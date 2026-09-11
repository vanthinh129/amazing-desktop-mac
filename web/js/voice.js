/**
 * Amazing Desktop Mac - Voice & Natural Speech Engine
 * Integrates High-Quality Natural Vietnamese Female Voice Stream with Web Audio Visualizer & System Fallback
 */

class VoiceEngine {
    constructor() {
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.isListening = false;
        this.selectedVoice = null;

        // Natural Voice Audio Player
        this.audioPlayer = new Audio();
        this.audioPlayer.crossOrigin = "anonymous";

        this.onSpeechStartCallback = null;
        this.onSpeechResultCallback = null;
        this.onSpeechEndCallback = null;
        this.onSpeakProgressCallback = null;

        this.initSpeechRecognition();
        this.initVoices();
    }

    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition API is not supported in this browser environment.");
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'vi-VN';

        this.recognition.onstart = () => {
            this.isListening = true;
            if (this.onSpeechStartCallback) this.onSpeechStartCallback();
        };

        this.recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            const isFinal = event.results[event.results.length - 1].isFinal;
            if (this.onSpeechResultCallback) {
                this.onSpeechResultCallback(transcript, isFinal);
            }
        };

        this.recognition.onerror = (event) => {
            console.warn("Speech recognition error:", event.error);
            this.stopListening();
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (this.onSpeechEndCallback) this.onSpeechEndCallback();
        };
    }

    initVoices() {
        if (!this.synth) return;

        const populateVoices = () => {
            const voices = this.synth.getVoices();
            // Prefer Vietnamese female voices (Linh, Hoai, Google vi-VN, etc.)
            this.selectedVoice = voices.find(v => (v.lang.includes('vi') || v.lang.includes('VI')) && (v.name.toLowerCase().includes('linh') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google'))) ||
                                 voices.find(v => v.lang.includes('vi') || v.lang.includes('VI')) || 
                                 voices[0];
            
            const voiceSelect = document.getElementById('voiceSelect');
            if (voiceSelect) {
                voiceSelect.innerHTML = '';
                
                // Add Natural Female Voice option
                const naturalOption = document.createElement('option');
                naturalOption.value = 'natural_female';
                naturalOption.textContent = '🔊 Giọng Nữ Tiếng Việt Tự Nhiên (Khuyên Dùng)';
                naturalOption.selected = true;
                voiceSelect.appendChild(naturalOption);

                voices.forEach((v, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = `${v.name} (${v.lang})`;
                    voiceSelect.appendChild(option);
                });

                voiceSelect.onchange = (e) => {
                    if (e.target.value === 'natural_female') {
                        this.selectedVoice = null; // Use Natural Cloud Voice
                    } else {
                        this.selectedVoice = voices[e.target.value];
                    }
                };
            }
        };

        populateVoices();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = populateVoices;
        }
    }

    startListening() {
        if (!this.recognition) {
            alert("Trình duyệt không hỗ trợ Web Speech Recognition!");
            return;
        }

        try {
            this.recognition.start();
        } catch (e) {
            console.warn("Recognition already active or error:", e);
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    speak(text, onStart, onEnd) {
        // Strip markdown, emojis & special symbols for clean TTS reading
        const cleanedText = text.replace(/[\*\_\#\`\⚙️\✨\💖\🤖\🖼️\🌤️\🕒\🎨\💖\📸]/g, '').trim();
        if (!cleanedText) {
            if (onEnd) onEnd();
            return;
        }

        // If a specific system voice was chosen from dropdown, use WebSpeechSynthesis
        if (this.selectedVoice) {
            this.speakWebSpeechFallback(cleanedText, onStart, onEnd);
        } else {
            // Otherwise use High-Quality Natural Vietnamese Female Voice Stream
            this.speakNaturalCloudTTS(cleanedText, onStart, onEnd);
        }
    }

    speakNaturalCloudTTS(text, onStart, onEnd) {
        if (this.synth) this.synth.cancel();
        this.audioPlayer.pause();

        // Encode sentence for TTS URL
        const encodedText = encodeURIComponent(text);
        const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=vi&client=tw-ob`;

        this.audioPlayer.src = ttsUrl;
        let progressInterval = null;

        this.audioPlayer.onplay = () => {
            if (onStart) onStart();
            progressInterval = setInterval(() => {
                const amp = 0.35 + Math.abs(Math.sin(Date.now() * 0.015)) * 0.65;
                if (this.onSpeakProgressCallback) this.onSpeakProgressCallback(amp);
            }, 60);
        };

        this.audioPlayer.onended = () => {
            if (progressInterval) clearInterval(progressInterval);
            if (this.onSpeakProgressCallback) this.onSpeakProgressCallback(0);
            if (onEnd) onEnd();
        };

        this.audioPlayer.onerror = (err) => {
            console.warn("Natural TTS stream error, fallback to WebSpeechSynthesis:", err);
            if (progressInterval) clearInterval(progressInterval);
            this.speakWebSpeechFallback(text, onStart, onEnd);
        };

        this.audioPlayer.play().catch(err => {
            console.warn("Audio play blocked or offline, fallback to WebSpeech:", err);
            if (progressInterval) clearInterval(progressInterval);
            this.speakWebSpeechFallback(text, onStart, onEnd);
        });
    }

    speakWebSpeechFallback(text, onStart, onEnd) {
        if (!this.synth) {
            if (onEnd) onEnd();
            return;
        }

        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
        }
        utterance.rate = 1.0;
        utterance.pitch = 1.25; // Sweet natural female pitch

        utterance.onstart = () => {
            if (onStart) onStart();
            this.simulateSpeakingFrequency(onEnd);
        };

        utterance.onend = () => {
            if (this.onSpeakProgressCallback) this.onSpeakProgressCallback(0);
            if (onEnd) onEnd();
        };

        utterance.onerror = (err) => {
            console.warn("Speech synthesis error:", err);
            if (this.onSpeakProgressCallback) this.onSpeakProgressCallback(0);
            if (onEnd) onEnd();
        };

        this.synth.speak(utterance);
    }

    simulateSpeakingFrequency(onComplete) {
        let currentTick = 0;
        const interval = setInterval(() => {
            if (!this.synth.speaking) {
                clearInterval(interval);
                if (this.onSpeakProgressCallback) this.onSpeakProgressCallback(0);
                return;
            }
            currentTick++;
            const amplitude = 0.3 + Math.abs(Math.sin(currentTick * 0.4)) * 0.7;
            if (this.onSpeakProgressCallback) {
                this.onSpeakProgressCallback(amplitude);
            }
        }, 80);
    }
}

window.voiceEngine = new VoiceEngine();
