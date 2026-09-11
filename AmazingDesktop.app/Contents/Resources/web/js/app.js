/**
 * Amazing Desktop Mac - Main Application Controller
 */

class AppController {
    constructor() {
        this.speechBubbleTimeout = null;
        this.initClock();
        this.initBackgroundCanvas();
        this.initCharacter();
        this.initVoiceBridge();
        this.initUIEventListeners();
        this.initNativeBridge();
    }

    initClock() {
        const timeDisplay = document.getElementById('timeDisplay');
        const secondsDisplay = document.getElementById('secondsDisplay');
        const dateDisplay = document.getElementById('dateDisplay');

        const updateClock = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');

            if (timeDisplay) timeDisplay.childNodes[0].nodeValue = `${hours}:${minutes}`;
            if (secondsDisplay) secondsDisplay.textContent = `:${seconds}`;

            if (dateDisplay) {
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                dateDisplay.textContent = now.toLocaleDateString('vi-VN', options);
            }
        };

        updateClock();
        setInterval(updateClock, 1000);
    }

    initBackgroundCanvas() {
        const canvas = document.getElementById('bgCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const particles = [];
        let particleCount = parseInt(localStorage.getItem('particle_density') || '60', 10);

        const createParticles = () => {
            particles.length = 0;
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    size: Math.random() * 2.5 + 1,
                    alpha: Math.random() * 0.5 + 0.1
                });
            }
        };

        createParticles();

        const drawBg = () => {
            ctx.clearRect(0, 0, width, height);

            // Subtle dark radial gradient center glow
            const radGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width * 0.7);
            radGrad.addColorStop(0, 'rgba(0, 240, 255, 0.04)');
            radGrad.addColorStop(1, 'rgba(7, 9, 19, 0)');
            ctx.fillStyle = radGrad;
            ctx.fillRect(0, 0, width, height);

            // Draw floating particles
            ctx.fillStyle = '#00f0ff';
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(drawBg);
        };

        drawBg();
    }

    initCharacter() {
        window.aiCharacter = new AICharacter('characterCanvas');
    }

    initVoiceBridge() {
        const voice = window.voiceEngine;
        const micBtn = document.getElementById('micBtn');
        const statusText = document.getElementById('statusText');

        if (!voice) return;

        voice.onSpeechStartCallback = () => {
            if (micBtn) micBtn.classList.add('listening');
            if (statusText) statusText.textContent = "AI Listening... • Đang lắng nghe";
            if (window.aiCharacter) window.aiCharacter.setState('LISTENING');
        };

        voice.onSpeechResultCallback = (transcript, isFinal) => {
            this.showSpeechBubble("Bạn", transcript);
            if (isFinal) {
                this.handleUserQuery(transcript);
            }
        };

        voice.onSpeechEndCallback = () => {
            if (micBtn) micBtn.classList.remove('listening');
            if (statusText) statusText.textContent = "AI Ready • Sẵn sàng";
        };

        voice.onSpeakProgressCallback = (amplitude) => {
            if (window.aiCharacter) {
                window.aiCharacter.setAudioAmplitude(amplitude);
            }
        };
    }

    initUIEventListeners() {
        const micBtn = document.getElementById('micBtn');
        const chatInput = document.getElementById('chatInput');
        const sendBtn = document.getElementById('sendBtn');
        const settingsToggleBtn = document.getElementById('settingsToggleBtn');
        const closeDrawerBtn = document.getElementById('closeDrawerBtn');
        const settingsDrawer = document.getElementById('settingsDrawer');
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        const apiKeyInput = document.getElementById('apiKeyInput');

        // Populate API Key in drawer
        if (apiKeyInput && window.aiEngine) {
            apiKeyInput.value = window.aiEngine.getApiKey();
        }

        // Mic Button Click
        if (micBtn) {
            micBtn.addEventListener('click', () => {
                if (window.voiceEngine) window.voiceEngine.toggleListening();
            });
        }

        // Send Button & Chat Input
        const submitChat = () => {
            const text = chatInput.value.trim();
            if (text) {
                chatInput.value = '';
                this.handleUserQuery(text);
            }
        };

        if (sendBtn) sendBtn.addEventListener('click', submitChat);
        if (chatInput) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') submitChat();
            });
        }

        // Quick Chip Buttons
        document.querySelectorAll('.chip-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.getAttribute('data-query');
                if (query) this.handleUserQuery(query);
            });
        });

        // Settings Drawer Toggle
        if (settingsToggleBtn && settingsDrawer) {
            settingsToggleBtn.addEventListener('click', () => {
                settingsDrawer.classList.add('open');
            });
        }
        if (closeDrawerBtn && settingsDrawer) {
            closeDrawerBtn.addEventListener('click', () => {
                settingsDrawer.classList.remove('open');
            });
        }

        // Save Settings
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                if (apiKeyInput && window.aiEngine) {
                    window.aiEngine.setApiKey(apiKeyInput.value);
                }
                const densityInput = document.getElementById('particleDensity');
                if (densityInput) {
                    localStorage.setItem('particle_density', densityInput.value);
                }
                if (settingsDrawer) settingsDrawer.classList.remove('open');
                this.showSpeechBubble("Cài đặt", "Đã lưu cấu hình mới thành công!");
            });
        }

        // Theme Switcher Buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const themeClass = btn.getAttribute('data-theme');
                this.switchTheme(themeClass);
            });
        });
    }

    switchTheme(themeClass) {
        document.body.className = themeClass;
        localStorage.setItem('wallpaper_theme', themeClass);

        // Update AI Character Theme Colors
        let primary = '#00f0ff';
        let secondary = '#7000ff';

        if (themeClass === 'theme-purple') {
            primary = '#a855f7';
            secondary = '#ec4899';
        } else if (themeClass === 'theme-emerald') {
            primary = '#10b981';
            secondary = '#06b6d4';
        } else if (themeClass === 'theme-sunset') {
            primary = '#ff5e62';
            secondary = '#ff9966';
        }

        if (window.aiCharacter) {
            window.aiCharacter.setThemeColors(primary, secondary);
        }
    }

    async handleUserQuery(queryText) {
        this.showSpeechBubble("Bạn", queryText);

        const statusText = document.getElementById('statusText');
        if (statusText) statusText.textContent = "AI Thinking... • Đang suy nghĩ";
        if (window.aiCharacter) window.aiCharacter.setState('THINKING');

        // Show Thinking Speech Bubble while waiting for AI API response
        const thinkingTimer = setTimeout(() => {
            if (window.aiCharacter && window.aiCharacter.state === 'THINKING') {
                this.showSpeechBubble("AI Companion", "Đang suy nghĩ câu trả lời... 🤔", true);
            }
        }, 1200);

        // Generate response from AI Engine
        let responseText = "Tôi đã nghe được bạn nói.";
        if (window.aiEngine) {
            responseText = await window.aiEngine.generateResponse(queryText);
        }

        clearTimeout(thinkingTimer);

        if (statusText) statusText.textContent = "AI Speaking... • Đang nói";
        if (window.aiCharacter) window.aiCharacter.setState('SPEAKING');

        this.showSpeechBubble("AI Companion", responseText);

        // Speak back using Voice Engine
        if (window.voiceEngine) {
            window.voiceEngine.speak(
                responseText,
                () => { if (window.aiCharacter) window.aiCharacter.setState('SPEAKING'); },
                () => {
                    if (window.aiCharacter) window.aiCharacter.setState('IDLE');
                    if (statusText) statusText.textContent = "AI Ready • Sẵn sàng";
                    // Hide speech bubble IMMEDIATELY (0ms delay) as soon as reading finishes
                    this.hideSpeechBubbleAfterDelay(0);
                }
            );
        } else {
            const wordCount = responseText.split(/\s+/).length;
            this.hideSpeechBubbleAfterDelay(Math.max(6000, wordCount * 300));
        }
    }

    showSpeechBubble(tag, text, isThinking = false) {
        const bubble = document.getElementById('speechBubble');
        const bubbleTag = document.getElementById('bubbleTag');
        const bubbleText = document.getElementById('bubbleText');

        if (!bubble || !bubbleTag || !bubbleText) return;

        bubbleTag.textContent = tag;
        bubbleText.textContent = text;
        bubble.classList.add('active');

        if (this.speechBubbleTimeout) clearTimeout(this.speechBubbleTimeout);

        if (isThinking) {
            // Keep visible continuously while thinking
            return;
        }

        // Safety fallback duration in case TTS is disabled or blocked
        const wordCount = text.split(/\s+/).length;
        const fallbackDuration = Math.max(10000, wordCount * 400);

        this.speechBubbleTimeout = setTimeout(() => {
            if (window.aiCharacter && (window.aiCharacter.state === 'SPEAKING' || window.aiCharacter.state === 'THINKING')) {
                return;
            }
            bubble.classList.remove('active');
        }, fallbackDuration);
    }

    hideSpeechBubbleAfterDelay(ms = 0) {
        const bubble = document.getElementById('speechBubble');
        if (!bubble) return;

        if (this.speechBubbleTimeout) clearTimeout(this.speechBubbleTimeout);

        if (ms === 0) {
            bubble.classList.remove('active');
        } else {
            this.speechBubbleTimeout = setTimeout(() => {
                if (window.aiCharacter && (window.aiCharacter.state === 'SPEAKING' || window.aiCharacter.state === 'THINKING')) {
                    return;
                }
                bubble.classList.remove('active');
            }, ms);
        }
    }

    initNativeBridge() {
        // Load saved theme on boot
        const savedTheme = localStorage.getItem('wallpaper_theme') || 'theme-cyan';
        this.switchTheme(savedTheme);

        // Receiver for messages sent from Swift WKWebView
        window.onNativeCommand = (command, data) => {
            console.log("Native command received:", command, data);
            if (command === 'setTheme') {
                this.switchTheme(data);
            } else if (command === 'toggleMic') {
                if (window.voiceEngine) window.voiceEngine.toggleListening();
            } else if (command === 'reload') {
                window.location.reload();
            }
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.appController = new AppController();
});
