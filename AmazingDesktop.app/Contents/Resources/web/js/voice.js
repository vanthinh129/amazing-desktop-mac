/**
 * Amazing Desktop Mac - Voice & Local Neural Speech Synthesis Engine
 * Connects to Local Neural TTS Server (http://127.0.0.1:8008) for natural Southern Vietnamese female speech (Hoài My Neural)
 */

class VoiceEngine {
    constructor() {
        this.synth = window.speechSynthesis;
        this.selectedVoice = null; // null by default -> priority to Local Neural TTS (Hoài My)
        this.voices = [];
        this.audioPlayer = new Audio();
        this.localTtsUrl = 'http://127.0.0.1:8008';
        this.currentVoice = 'vi-VN-HoaiMyNeural';

        this.isListening = false;
        this.recognition = null;

        this.onSpeechStartCallback = null;
        this.onSpeechResultCallback = null;
        this.onSpeechEndCallback = null;
        this.onSpeakProgressCallback = null;

        this.initVoices();
        this.initRecognition();
    }

    initVoices() {
        if (!this.synth) return;
        const loadVoices = () => {
            this.voices = this.synth.getVoices();
        };
        loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = loadVoices;
        }
    }

    initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech Recognition API not supported in this browser.");
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
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            const transcript = finalTranscript || interimTranscript;
            if (this.onSpeechResultCallback) {
                this.onSpeechResultCallback(transcript, !!finalTranscript);
            }
        };

        this.recognition.onerror = (event) => {
            console.warn("Speech recognition error", event.error);
            this.isListening = false;
            if (this.onSpeechEndCallback) this.onSpeechEndCallback();
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (this.onSpeechEndCallback) this.onSpeechEndCallback();
        };
    }

    startListening() {
        if (!this.recognition) {
            console.warn("Speech recognition not initialized.");
            return;
        }
        if (this.isListening) return;
        try {
            this.recognition.start();
        } catch (e) {
            console.warn("Speech recognition already started:", e);
        }
    }

    stopListening() {
        if (!this.recognition) return;
        try {
            this.recognition.stop();
        } catch (e) {
            console.warn(e);
        }
        this.isListening = false;
        if (this.onSpeechEndCallback) this.onSpeechEndCallback();
    }

    stop() {
        if (this.audioPlayer) {
            this.audioPlayer.pause();
            this.audioPlayer.currentTime = 0;
        }
        if (this.synth) {
            this.synth.cancel();
        }
        if (this.onSpeakProgressCallback) this.onSpeakProgressCallback(0);
    }

    splitIntoSentences(text) {
        const regex = /([^.!?\n]+[.!?\n]*)/g;
        const matches = text.match(regex);
        if (!matches) return [text];
        return matches.map(s => s.trim()).filter(s => s.length > 0);
    }

    async speak(text, onStart, onEnd) {
        const cleanedText = text.replace(/[*_#`⚙️✨💖🤖🖼️🌤️🕒🎨📸🐸💎]/g, '').trim();
        if (!cleanedText) {
            if (onEnd) onEnd();
            return;
        }

        this.stop();

        if (this.selectedVoice) {
            this.speakWebSpeechFallback(cleanedText, onStart, onEnd);
            return;
        }

        // Attempt Local Neural TTS (Hoài My Neural) first
        try {
            await this.speakLocalNeuralTTS(cleanedText, onStart, onEnd);
        } catch (e) {
            console.warn("Local TTS failed, fallback to Google TTS:", e);
            this.speakGoogleFastTTS(cleanedText, onStart, onEnd);
        }
    }

    async speakLocalNeuralTTS(text, onStart, onEnd) {
        const sentences = this.splitIntoSentences(text);
        if (sentences.length === 0) {
            if (onEnd) onEnd();
            return;
        }

        const fetchSentenceBlob = async (sText) => {
            const res = await fetch(`${this.localTtsUrl}/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: sText, voice: this.currentVoice })
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const blob = await res.blob();
            return URL.createObjectURL(blob);
        };

        // Pre-fetch sentence audio concurrently
        const audioPromises = sentences.map(s => fetchSentenceBlob(s));

        let hasStarted = false;

        for (let i = 0; i < sentences.length; i++) {
            let audioUrl;
            try {
                audioUrl = await audioPromises[i];
            } catch (err) {
                console.warn(`Failed Local TTS for sentence ${i}:`, err);
                continue;
            }

            await new Promise((resolve) => {
                this.audioPlayer.src = audioUrl;
                this.audioPlayer.onplay = () => {
                    if (!hasStarted) {
                        hasStarted = true;
                        if (onStart) onStart();
                    }
                    this.simulateAudioProgress();
                };
                this.audioPlayer.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    resolve();
                };
                this.audioPlayer.onerror = (err) => {
                    console.warn("Audio playback error:", err);
                    URL.revokeObjectURL(audioUrl);
                    resolve();
                };
                this.audioPlayer.play().catch(err => {
                    console.warn("Audio play rejected:", err);
                    URL.revokeObjectURL(audioUrl);
                    resolve();
                });
            });
        }

        if (this.onSpeakProgressCallback) this.onSpeakProgressCallback(0);
        if (onEnd) onEnd();
    }

    speakGoogleFastTTS(text, onStart, onEnd) {
        const sentences = this.splitIntoSentences(text);
        if (sentences.length === 0) {
            if (onEnd) onEnd();
            return;
        }

        const fetchGoogleAudio = async (sentenceText) => {
            const encodedText = encodeURIComponent(sentenceText);
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=vi&client=tw-ob`;
            const res = await fetch(ttsUrl);
            if (!res.ok) throw new Error(`Google TTS status ${res.status}`);
            const blob = await res.blob();
            return URL.createObjectURL(blob);
        };

        const audioPromises = sentences.map(s => fetchGoogleAudio(s));
        let hasStarted = false;

        (async () => {
            try {
                for (let i = 0; i < sentences.length; i++) {
                    let audioUrl;
                    try {
                        audioUrl = await audioPromises[i];
                    } catch (err) {
                        console.warn(`Failed Google TTS sentence ${i}:`, err);
                        continue;
                    }

                    await new Promise((resolve) => {
                        this.audioPlayer.src = audioUrl;
                        this.audioPlayer.onplay = () => {
                            if (!hasStarted) {
                                hasStarted = true;
                                if (onStart) onStart();
                            }
                            this.simulateAudioProgress();
                        };
                        this.audioPlayer.onended = () => {
                            URL.revokeObjectURL(audioUrl);
                            resolve();
                        };
                        this.audioPlayer.onerror = () => {
                            URL.revokeObjectURL(audioUrl);
                            resolve();
                        };
                        this.audioPlayer.play().catch(err => {
                            URL.revokeObjectURL(audioUrl);
                            resolve();
                        });
                    });
                }

                if (this.onSpeakProgressCallback) this.onSpeakProgressCallback(0);
                if (onEnd) onEnd();
            } catch (e) {
                console.warn("Google TTS fallback failed:", e);
                this.speakWebSpeechFallback(text, onStart, onEnd);
            }
        })();
    }

    simulateAudioProgress() {
        const interval = setInterval(() => {
            if (this.audioPlayer.paused || this.audioPlayer.ended) {
                clearInterval(interval);
                if (this.onSpeakProgressCallback) this.onSpeakProgressCallback(0);
                return;
            }
            const amplitude = 0.3 + Math.abs(Math.sin(Date.now() * 0.01)) * 0.7;
            if (this.onSpeakProgressCallback) {
                this.onSpeakProgressCallback(amplitude);
            }
        }, 80);
    }

    speakWebSpeechFallback(text, onStart, onEnd) {
        if (!this.synth) {
            if (onEnd) onEnd();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        if (this.selectedVoice) {
            utterance.voice = this.selectedVoice;
        } else {
            utterance.lang = 'vi-VN';
        }
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            if (onStart) onStart();
        };

        utterance.onend = () => {
            if (this.onSpeakProgressCallback) this.onSpeakProgressCallback(0);
            if (onEnd) onEnd();
        };

        utterance.onerror = () => {
            if (this.onSpeakProgressCallback) this.onSpeakProgressCallback(0);
            if (onEnd) onEnd();
        };

        this.synth.speak(utterance);
    }
}

window.voiceEngine = new VoiceEngine();
