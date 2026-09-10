/**
 * Amazing Desktop Mac - Voice & Speech Recognition / Synthesis Engine
 */

class VoiceEngine {
    constructor() {
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.isListening = false;
        this.selectedVoice = null;

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
            // Prefer Vietnamese voices or fallback
            this.selectedVoice = voices.find(v => v.lang.includes('vi') || v.lang.includes('VI')) || voices[0];
            
            const voiceSelect = document.getElementById('voiceSelect');
            if (voiceSelect) {
                voiceSelect.innerHTML = '';
                voices.forEach((v, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = `${v.name} (${v.lang})`;
                    if (v === this.selectedVoice) option.selected = true;
                    voiceSelect.appendChild(option);
                });

                voiceSelect.onchange = (e) => {
                    this.selectedVoice = voices[e.target.value];
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
        if (!this.synth) return;

        // Cancel ongoing speech
        this.synth.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
        }
        utterance.rate = 1.0;
        utterance.pitch = 1.05;

        utterance.onstart = () => {
            if (onStart) onStart();
            this.simulateSpeakingFrequency(onEnd);
        };

        utterance.onend = () => {
            if (onEnd) onEnd();
        };

        utterance.onerror = (err) => {
            console.warn("Speech synthesis error:", err);
            if (onEnd) onEnd();
        };

        this.synth.speak(utterance);
    }

    simulateSpeakingFrequency(onComplete) {
        let currentTick = 0;
        const interval = setInterval(() => {
            if (!this.synth.speaking) {
                clearInterval(interval);
                return;
            }
            currentTick++;
            // Generate simulated audio volume amplitude (0.2 to 1.0)
            const amplitude = 0.3 + Math.abs(Math.sin(currentTick * 0.4)) * 0.7;
            if (this.onSpeakProgressCallback) {
                this.onSpeakProgressCallback(amplitude);
            }
        }, 80);
    }
}

window.voiceEngine = new VoiceEngine();
