/**
 * Amazing Desktop Mac - Spider-Man AI Companion Character Renderer 🕷️🏙️
 * Interactive NYC Night Skyline Canvas Renderer with Cinematic Web-Slinging & Acrobatics Intro
 */

class SpiderCharacter {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width = 450;
        this.height = this.canvas.height = 450;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        // Character State: 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'
        this.state = 'IDLE';

        this.time = 0;
        this.audioAmplitude = 0;
        this.blinkTimer = 0;
        this.isBlinking = false;

        // Mouse look-at tracking
        this.mousePos = { x: this.centerX, y: this.centerY };
        this.headAngle = 0;

        // Interactive Web Thwip Bullets/Lines
        this.webLines = [];
        this.sparks = [];

        // Stars array in NYC Night Sky
        this.stars = [];
        for (let i = 0; i < 40; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * (this.height * 0.6),
                radius: Math.random() * 1.8 + 0.5,
                alpha: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.04 + 0.01
            });
        }

        // NYC Buildings Generator
        this.buildings = [
            { x: 10, width: 65, height: 210, windowCols: 3, windowRows: 7, color: '#0d1326' },
            { x: 80, width: 85, height: 280, windowCols: 4, windowRows: 9, color: '#111833', spire: true },
            { x: 170, width: 110, height: 230, windowCols: 5, windowRows: 8, color: '#090e1c' }, // Ledge building for Spidey
            { x: 285, width: 75, height: 260, windowCols: 3, windowRows: 9, color: '#121a36' },
            { x: 365, width: 75, height: 190, windowCols: 3, windowRows: 6, color: '#0b1021' }
        ];

        // Windows status array (randomly lit)
        this.windowLights = [];
        this.buildings.forEach((b, bIdx) => {
            b.windows = [];
            for (let r = 0; r < b.windowRows; r++) {
                for (let c = 0; c < b.windowCols; c++) {
                    b.windows.push({
                        lit: Math.random() > 0.45,
                        color: Math.random() > 0.3 ? '#ffdf7a' : (Math.random() > 0.5 ? '#7adfff' : '#ff7ab6'),
                        flicker: Math.random() * Math.PI * 2
                    });
                }
            }
        });

        // Cinematic Intro Animation State
        // Phases: 0 = Web Shoot, 1 = Swing Arc, 2 = Backflip mid-air, 3 = Hero Landing Crouch, 4 = Idle Perch Pose
        this.introPhase = 0;
        this.introTime = 0;
        this.introActive = true;
        this.spideyPos = { x: -50, y: -50, rot: 0, scale: 1 };
        this.landingImpact = 0; // Shockwave radius on superhero landing

        // Mouse Move Listener (non-blocking)
        this.onMouseMove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = e.clientX - rect.left;
            this.mousePos.y = e.clientY - rect.top;
        };
        window.addEventListener('mousemove', this.onMouseMove);

        // Click Listener (non-blocking, triggers Web Thwip & Flip)
        this.onClick = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            if (clickX >= 0 && clickX <= this.width && clickY >= 0 && clickY <= this.height) {
                this.triggerWebThwip(clickX, clickY);
            }
        };
        this.canvas.addEventListener('click', this.onClick);

        this.animate = this.animate.bind(this);
        this.animFrameId = requestAnimationFrame(this.animate);
    }

    setState(newState) {
        this.state = newState;
        if (newState === 'SPEAKING') {
            // Shoot web strands periodically when speaking
            this.triggerWebThwip(
                this.centerX + (Math.random() - 0.5) * 200,
                50 + Math.random() * 150
            );
        }
    }

    setAudioAmplitude(amp) {
        this.audioAmplitude = amp;
    }

    setThemeColors(primary, secondary) {
        // Keeps contract compatible with AppController theme switcher
    }

    playIntro() {
        this.introPhase = 0;
        this.introTime = 0;
        this.introActive = true;
        this.landingImpact = 0;
    }

    stop() {
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
        }
        if (this.onMouseMove) {
            window.removeEventListener('mousemove', this.onMouseMove);
        }
        if (this.onClick) {
            this.canvas.removeEventListener('click', this.onClick);
        }
    }

    triggerWebThwip(targetX, targetY) {
        const startX = this.spideyPos.x || (this.centerX + 20);
        const startY = this.spideyPos.y || (this.centerY + 20);

        this.webLines.push({
            startX: startX,
            startY: startY,
            targetX: targetX,
            targetY: targetY,
            progress: 0,
            life: 1.0,
            maxLife: 1.0
        });

        // Generate sparks on web shoot
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 2;
            this.sparks.push({
                x: targetX,
                y: targetY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 2 + 1,
                alpha: 1.0,
                color: '#ffffff'
            });
        }
    }

    animate() {
        this.time += 0.03;
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 1. Draw NYC City Skyline Night Background
        this.drawNYCBackground();

        // 2. Update & Draw Web Shooting Particles
        this.updateAndDrawWebs();

        // 3. Update & Draw Intro Motion or Idle Perch State
        if (this.introActive) {
            this.updateIntroSequence();
        } else {
            // Idle position centered on skyscraper ledge
            const floatBob = Math.sin(this.time * 2) * 5;
            this.spideyPos.x = this.centerX;
            this.spideyPos.y = 230 + floatBob;
            this.spideyPos.rot = Math.sin(this.time * 1.2) * 0.05;
            this.spideyPos.scale = 1;
        }

        // 4. Render Spider-Man Hero Model
        this.drawSpiderMan(this.spideyPos.x, this.spideyPos.y, this.spideyPos.rot, this.spideyPos.scale);

        // 5. Draw Heroic Landing Impact Wave
        if (this.landingImpact > 0) {
            this.drawLandingImpact();
            this.landingImpact -= 0.04;
        }

        this.animFrameId = requestAnimationFrame(this.animate);
    }

    updateIntroSequence() {
        this.introTime += 0.03;

        if (this.introPhase === 0) {
            // Phase 0: Web line shoots from top edge across canvas (0s to 0.4s)
            const p = Math.min(1, this.introTime / 0.4);
            const anchorX = 225;
            const anchorY = 30;

            // Draw initial incoming web line
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.moveTo(400, -20);
            this.ctx.lineTo(400 + (anchorX - 400) * p, -20 + (anchorY - -20) * p);
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 3;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#00f0ff';
            this.ctx.stroke();
            this.ctx.restore();

            this.spideyPos.x = -60;
            this.spideyPos.y = -60;

            if (this.introTime >= 0.4) {
                this.introPhase = 1;
                this.introTime = 0;
            }
        } else if (this.introPhase === 1) {
            // Phase 1: High speed pendulum swing across screen (0.4s to 1.3s)
            const p = Math.min(1, this.introTime / 0.9);
            // Swing arc parameterized path
            const angle = -Math.PI * 0.7 + p * (Math.PI * 0.9);
            const radius = 260;
            const pivotX = 225;
            const pivotY = 20;

            this.spideyPos.x = pivotX + Math.sin(angle) * radius;
            this.spideyPos.y = pivotY + Math.cos(angle) * radius;
            this.spideyPos.rot = angle + Math.PI / 2;

            // Draw active swing web line attached to Spidey hand
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.moveTo(pivotX, pivotY);
            this.ctx.lineTo(this.spideyPos.x, this.spideyPos.y);
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.lineWidth = 2.5;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = '#ffffff';
            this.ctx.stroke();
            this.ctx.restore();

            if (this.introTime >= 0.9) {
                this.introPhase = 2;
                this.introTime = 0;
            }
        } else if (this.introPhase === 2) {
            // Phase 2: Release web & Acrobatic mid-air 360° backflip (0s to 0.7s)
            const p = Math.min(1, this.introTime / 0.7);
            // Parabolic jump curve
            const jumpY = -Math.sin(p * Math.PI) * 70;
            this.spideyPos.x = 170 + p * (225 - 170);
            this.spideyPos.y = 220 + jumpY;
            this.spideyPos.rot = p * Math.PI * 2; // 360 flip!

            // Add backflip trailing sparks
            if (Math.random() > 0.4) {
                this.sparks.push({
                    x: this.spideyPos.x + (Math.random() - 0.5) * 30,
                    y: this.spideyPos.y + (Math.random() - 0.5) * 30,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    radius: Math.random() * 2 + 1,
                    alpha: 1,
                    color: '#ff3366'
                });
            }

            if (this.introTime >= 0.7) {
                this.introPhase = 3;
                this.introTime = 0;
                this.landingImpact = 1.0; // Trigger superhero landing ground flash!
            }
        } else if (this.introPhase === 3) {
            // Phase 3: Superhero 3-point crouch landing & head rise (0s to 0.8s)
            const p = Math.min(1, this.introTime / 0.8);
            this.spideyPos.x = this.centerX;
            this.spideyPos.y = 230 + (1 - p) * 15; // Smooth settle
            this.spideyPos.rot = 0;

            if (this.introTime >= 0.8) {
                this.introPhase = 4;
                this.introActive = false;
            }
        }
    }

    drawLandingImpact() {
        const ctx = this.ctx;
        const radius = (1 - this.landingImpact) * 120 + 20;

        ctx.save();
        ctx.translate(this.centerX, 330);
        ctx.scale(1, 0.35); // Oval perspective on ledge

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.landingImpact})`;
        ctx.lineWidth = 4 * this.landingImpact;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00f0ff';
        ctx.stroke();

        // Web shockwave web grid lines
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
            ctx.strokeStyle = `rgba(255, 50, 80, ${this.landingImpact * 0.7})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        ctx.restore();
    }

    drawNYCBackground() {
        const ctx = this.ctx;

        // Dark Atmospheric Night Sky Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        skyGrad.addColorStop(0, '#060913');
        skyGrad.addColorStop(0.5, '#0d152a');
        skyGrad.addColorStop(1, '#182038');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Twinkling Stars
        ctx.save();
        this.stars.forEach(s => {
            s.alpha += Math.sin(this.time * 5 * s.twinkleSpeed) * 0.015;
            s.alpha = Math.max(0.1, Math.min(0.9, s.alpha));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
            ctx.shadowBlur = s.radius * 2;
            ctx.shadowColor = '#ffffff';
            ctx.fill();
        });
        ctx.restore();

        // Glowing NYC Full Moon
        ctx.save();
        const moonX = 360;
        const moonY = 80;
        const moonRadius = 38;

        const moonGlow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.8, moonX, moonY, moonRadius * 2.5);
        moonGlow.addColorStop(0, 'rgba(255, 255, 230, 0.9)');
        moonGlow.addColorStop(0.4, 'rgba(0, 240, 255, 0.2)');
        moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = moonGlow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#fffdf0';
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#ffffdd';
        ctx.fill();

        // Moon craters
        ctx.fillStyle = 'rgba(210, 210, 190, 0.35)';
        ctx.beginPath();
        ctx.arc(moonX - 10, moonY - 8, 8, 0, Math.PI * 2);
        ctx.arc(moonX + 12, moonY + 10, 6, 0, Math.PI * 2);
        ctx.arc(moonX - 6, moonY + 14, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Searchlight Spotlight beams across sky
        ctx.save();
        const beamAngle = Math.sin(this.time * 0.8) * 0.25;
        ctx.translate(100, 350);
        ctx.rotate(beamAngle);
        const beamGrad = ctx.createLinearGradient(0, 0, 0, -350);
        beamGrad.addColorStop(0, 'rgba(0, 240, 255, 0.15)');
        beamGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.beginPath();
        ctx.moveTo(-15, 0);
        ctx.lineTo(-60, -350);
        ctx.lineTo(60, -350);
        ctx.lineTo(15, 0);
        ctx.fillStyle = beamGrad;
        ctx.fill();
        ctx.restore();

        // Draw Buildings & Illuminated Windows
        this.buildings.forEach((b, bIdx) => {
            const bY = this.height - b.height;
            ctx.save();

            // Building body
            ctx.fillStyle = b.color;
            ctx.fillRect(b.x, bY, b.width, b.height);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.lineWidth = 1;
            ctx.strokeRect(b.x, bY, b.width, b.height);

            // Spire if applicable
            if (b.spire) {
                ctx.beginPath();
                ctx.moveTo(b.x + b.width / 2 - 4, bY);
                ctx.lineTo(b.x + b.width / 2, bY - 45);
                ctx.lineTo(b.x + b.width / 2 + 4, bY);
                ctx.fillStyle = '#ff3366';
                ctx.fill();

                // Blinking red aviation hazard light
                if (Math.sin(this.time * 6) > 0) {
                    ctx.beginPath();
                    ctx.arc(b.x + b.width / 2, bY - 45, 3, 0, Math.PI * 2);
                    ctx.fillStyle = '#ff0033';
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#ff0033';
                    ctx.fill();
                }
            }

            // Draw Windows
            const colWidth = (b.width - 16) / b.windowCols;
            const rowHeight = (b.height - 30) / b.windowRows;

            b.windows.forEach((w, wIdx) => {
                const r = Math.floor(wIdx / b.windowCols);
                const c = wIdx % b.windowCols;
                const wx = b.x + 8 + c * colWidth + 2;
                const wy = bY + 15 + r * rowHeight + 2;

                if (w.lit) {
                    const flickerAlpha = 0.6 + Math.sin(this.time * 3 + w.flicker) * 0.25;
                    ctx.fillStyle = w.color;
                    ctx.globalAlpha = flickerAlpha;
                    ctx.shadowBlur = 6;
                    ctx.shadowColor = w.color;
                    ctx.fillRect(wx, wy, colWidth - 4, rowHeight - 4);
                } else {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                    ctx.globalAlpha = 1.0;
                    ctx.fillRect(wx, wy, colWidth - 4, rowHeight - 4);
                }
            });

            ctx.restore();
        });

        // Center Skyscraper Top Ledge (Spidey's stage platform)
        ctx.save();
        ctx.fillStyle = '#080c17';
        ctx.fillRect(140, 310, 170, 140);
        ctx.strokeStyle = '#1e294a';
        ctx.lineWidth = 3;
        ctx.strokeRect(140, 310, 170, 140);

        // Ledge neon rim line
        ctx.beginPath();
        ctx.moveTo(140, 310);
        ctx.lineTo(310, 310);
        ctx.strokeStyle = '#ff3366';
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ff3366';
        ctx.stroke();
        ctx.restore();
    }

    updateAndDrawWebs() {
        const ctx = this.ctx;

        // Draw active web shooting lines
        for (let i = this.webLines.length - 1; i >= 0; i--) {
            const w = this.webLines[i];
            w.progress = Math.min(1.0, w.progress + 0.12);
            w.life -= 0.03;

            const currX = w.startX + (w.targetX - w.startX) * w.progress;
            const currY = w.startY + (w.targetY - w.startY) * w.progress;

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(w.startX, w.startY);
            ctx.lineTo(currX, currY);
            ctx.strokeStyle = `rgba(255, 255, 255, ${w.life})`;
            ctx.lineWidth = 2.5;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00f0ff';
            ctx.stroke();

            // Web impact burst head
            ctx.beginPath();
            ctx.arc(currX, currY, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.restore();

            if (w.life <= 0) {
                this.webLines.splice(i, 1);
            }
        }

        // Draw web particle sparks
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const s = this.sparks[i];
            s.x += s.vx;
            s.y += s.vy;
            s.alpha -= 0.04;

            ctx.save();
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = s.color;
            ctx.globalAlpha = Math.max(0, s.alpha);
            ctx.shadowBlur = 6;
            ctx.shadowColor = s.color;
            ctx.fill();
            ctx.restore();

            if (s.alpha <= 0) {
                this.sparks.splice(i, 1);
            }
        }
    }

    drawSpiderMan(x, y, rotation, scale) {
        const ctx = this.ctx;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);

        // Head tracking angle towards mouse
        const dx = this.mousePos.x - x;
        const dy = this.mousePos.y - y;
        this.headAngle = Math.atan2(dy, dx) * 0.15; // Subtle natural head tilt

        // 1. Draw Spider-Man Body (Chibi / Superhero Mascot Proportions)
        const suitRed = '#e6002e';
        const suitBlue = '#0d2b6b';
        const webLineColor = 'rgba(20, 20, 35, 0.7)';

        // Shadows
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';

        // Torso / Legs
        ctx.beginPath();
        ctx.ellipse(0, 45, 32, 40, 0, 0, Math.PI * 2);
        ctx.fillStyle = suitBlue;
        ctx.fill();

        // Red Chest V-Vest
        ctx.beginPath();
        ctx.moveTo(-28, 15);
        ctx.lineTo(0, 75);
        ctx.lineTo(28, 15);
        ctx.lineTo(22, 10);
        ctx.lineTo(0, 50);
        ctx.lineTo(-22, 10);
        ctx.fillStyle = suitRed;
        ctx.fill();

        // Black Spider Emblem on Chest
        ctx.save();
        ctx.translate(0, 35);
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 8, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#0a0a10';
        ctx.fill();

        // Spider Legs
        ctx.strokeStyle = '#0a0a10';
        ctx.lineWidth = 1.8;
        for (let i = -1; i <= 1; i += 2) {
            ctx.beginPath();
            ctx.moveTo(0, -3);
            ctx.lineTo(i * 12, -8);
            ctx.lineTo(i * 15, -4);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, 3);
            ctx.lineTo(i * 14, 6);
            ctx.lineTo(i * 18, 12);
            ctx.stroke();
        }
        ctx.restore();

        // Arms (Left Arm Resting, Right Arm in "THWIP" Web Shooting Pose)
        const isSpeakingOrClicking = this.state === 'SPEAKING' || this.webLines.length > 0;
        const armWave = isSpeakingOrClicking ? Math.sin(this.time * 12) * 10 : Math.sin(this.time * 2) * 3;

        // Left Arm
        ctx.save();
        ctx.translate(-28, 20);
        ctx.rotate(-0.3 + armWave * 0.02);
        ctx.beginPath();
        ctx.ellipse(0, 20, 10, 22, 0.2, 0, Math.PI * 2);
        ctx.fillStyle = suitRed;
        ctx.fill();

        // Left Glove
        ctx.beginPath();
        ctx.arc(0, 38, 9, 0, Math.PI * 2);
        ctx.fillStyle = suitRed;
        ctx.fill();
        ctx.restore();

        // Right Arm (Signature Spidey Thwip Gesture!)
        ctx.save();
        ctx.translate(28, 20);
        const rArmAngle = isSpeakingOrClicking ? -0.8 : (this.state === 'LISTENING' ? -0.4 : 0.2);
        ctx.rotate(rArmAngle);
        ctx.beginPath();
        ctx.ellipse(0, 20, 10, 22, -0.2, 0, Math.PI * 2);
        ctx.fillStyle = suitRed;
        ctx.fill();

        // Thwip Hand (Index + Pinky extended, middle fingers folded)
        ctx.beginPath();
        ctx.arc(0, 38, 9, 0, Math.PI * 2);
        ctx.fillStyle = suitRed;
        ctx.fill();

        ctx.strokeStyle = '#a00020';
        ctx.lineWidth = 2;
        // Index Finger
        ctx.beginPath();
        ctx.moveTo(4, 38);
        ctx.lineTo(12, 48);
        ctx.stroke();
        // Pinky Finger
        ctx.beginPath();
        ctx.moveTo(-4, 38);
        ctx.lineTo(-10, 48);
        ctx.stroke();
        ctx.restore();

        // 2. Draw Spider-Man Head (Mask & Lenses)
        ctx.save();
        ctx.translate(0, -15);
        ctx.rotate(this.headAngle);

        // Head Mask Outline
        ctx.beginPath();
        ctx.ellipse(0, 0, 45, 48, 0, 0, Math.PI * 2);
        ctx.fillStyle = suitRed;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#e6002e';
        ctx.fill();

        // Web Pattern Lines on Mask
        ctx.save();
        ctx.clip(); // Clip web lines strictly within head boundary
        ctx.strokeStyle = webLineColor;
        ctx.lineWidth = 1.2;

        // Concentric Web Rings
        for (let r = 12; r <= 48; r += 12) {
            ctx.beginPath();
            ctx.arc(0, -5, r, 0, Math.PI * 2);
            ctx.stroke();
        }
        // Radial Web Lines from Nose/Center
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
            ctx.beginPath();
            ctx.moveTo(0, -5);
            ctx.lineTo(Math.cos(a) * 50, -5 + Math.sin(a) * 50);
            ctx.stroke();
        }
        ctx.restore();

        // 3. Draw Iconic Expressive Spider-Man Eye Lenses (White with thick black rim)
        this.drawSpideyLenses(ctx);

        ctx.restore(); // End Head translate

        ctx.restore(); // End Character translate
    }

    drawSpideyLenses(ctx) {
        // Calculate lens eye animations based on state & audio amplitude
        let lensSquintL = 1.0;
        let lensSquintR = 1.0;
        let lensScale = 1.0;
        let glowColor = '#ffffff';

        if (this.state === 'LISTENING') {
            // Wide glowing attentive lenses
            lensScale = 1.15;
            glowColor = '#00f0ff';
        } else if (this.state === 'THINKING') {
            // Asymmetric thoughtful squint (One eye narrowed, one eye wide)
            lensSquintL = 0.45 + Math.sin(this.time * 4) * 0.1;
            lensSquintR = 1.1;
            lensScale = 1.05;
        } else if (this.state === 'SPEAKING') {
            // Dynamic lens pulse & squinting synchronously with audio amplitude!
            const talkAmp = this.audioAmplitude * 2.5;
            lensSquintL = 0.8 + Math.sin(this.time * 15) * 0.25 + talkAmp * 0.3;
            lensSquintR = 0.8 + Math.cos(this.time * 15) * 0.25 + talkAmp * 0.3;
            lensScale = 1.0 + talkAmp * 0.2;
            glowColor = '#ffeb3b';
        }

        // Draw Left and Right Lenses
        const lensOffsetX = 18;
        const lensOffsetY = -5;

        for (let side = -1; side <= 1; side += 2) {
            const squint = side === -1 ? lensSquintL : lensSquintR;

            ctx.save();
            ctx.translate(side * lensOffsetX, lensOffsetY);
            ctx.scale(side * lensScale, lensScale * squint);

            // Black Thick Outer Lens Rim Frame
            ctx.beginPath();
            ctx.moveTo(0, -18);
            ctx.bezierCurveTo(14, -18, 22, -4, 20, 14);
            ctx.bezierCurveTo(12, 18, -4, 12, -18, 0);
            ctx.bezierCurveTo(-18, -12, -10, -18, 0, -18);
            ctx.fillStyle = '#0c0e14';
            ctx.shadowBlur = 12;
            ctx.shadowColor = glowColor;
            ctx.fill();

            // Inner Glowing White Glass Lens
            ctx.beginPath();
            ctx.moveTo(0, -14);
            ctx.bezierCurveTo(10, -14, 17, -3, 15, 10);
            ctx.bezierCurveTo(9, 13, -3, 9, -13, 0);
            ctx.bezierCurveTo(-13, -9, -7, -14, 0, -14);

            const glassGrad = ctx.createLinearGradient(0, -14, 0, 10);
            glassGrad.addColorStop(0, '#ffffff');
            glassGrad.addColorStop(0.7, '#e0f7fc');
            glassGrad.addColorStop(1, '#b2ebf2');

            ctx.fillStyle = glassGrad;
            ctx.shadowBlur = 15;
            ctx.shadowColor = glowColor;
            ctx.fill();

            // Inner Lens Mesh Reflection Line
            ctx.beginPath();
            ctx.moveTo(-6, -8);
            ctx.lineTo(8, 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        }
    }
}

window.SpiderCharacter = SpiderCharacter;
