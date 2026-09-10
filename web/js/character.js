/**
 * Amazing Desktop Mac - Canvas AI Character & Visualizer Renderer
 */

class AICharacter {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        // Character State: 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'
        this.state = 'IDLE';

        // Animation Time & Parameters
        this.time = 0;
        this.floatOffsetY = 0;
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.audioAmplitude = 0;
        this.primaryColor = '#00f0ff';
        this.secondaryColor = '#7000ff';

        // Particles surrounding avatar
        this.particles = [];
        this.initParticles(35);

        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    setThemeColors(primary, secondary) {
        this.primaryColor = primary;
        this.secondaryColor = secondary;
    }

    setState(newState) {
        this.state = newState;
    }

    setAudioAmplitude(amp) {
        this.audioAmplitude = amp;
    }

    initParticles(count) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 60 + Math.random() * 110;
            this.particles.push({
                x: this.centerX + Math.cos(angle) * dist,
                y: this.centerY + Math.sin(angle) * dist,
                angle: angle,
                dist: dist,
                speed: 0.005 + Math.random() * 0.015,
                radius: 1.5 + Math.random() * 2.5,
                alpha: 0.2 + Math.random() * 0.7
            });
        }
    }

    animate() {
        this.time += 0.03;
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Calculate floating bobbing effect
        this.floatOffsetY = Math.sin(this.time * 1.5) * 8;

        // Calculate blink state
        this.blinkTimer += 0.03;
        if (this.blinkTimer > 3.5) {
            this.isBlinking = true;
            if (this.blinkTimer > 3.7) {
                this.isBlinking = false;
                this.blinkTimer = 0;
            }
        }

        const renderY = this.centerY + this.floatOffsetY;

        // Draw Outer Energy Waves & Spectrum Rings
        this.drawOuterSpectrumRings(this.centerX, renderY);

        // Draw Orbiting Particles
        this.drawParticles(this.centerX, renderY);

        // Draw Sci-Fi Rotating Halo Rings
        this.drawHaloRings(this.centerX, renderY);

        // Draw Core Hologram Sphere
        this.drawCoreSphere(this.centerX, renderY);

        // Draw AI Facial Features (Digital Eyes & Mouth Expression)
        this.drawFaceFeatures(this.centerX, renderY);

        requestAnimationFrame(this.animate);
    }

    drawOuterSpectrumRings(cx, cy) {
        const ctx = this.ctx;
        let ringCount = 3;
        let baseRadius = 110;
        let ampMultiplier = this.state === 'SPEAKING' ? this.audioAmplitude * 35 : (this.state === 'LISTENING' ? 20 : 6);

        ctx.save();
        for (let r = 0; r < ringCount; r++) {
            const radius = baseRadius + r * 20 + Math.sin(this.time * 2 + r) * 5 + ampMultiplier;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = r === 0 ? this.primaryColor : (r === 1 ? this.secondaryColor : 'rgba(255,255,255,0.2)');
            ctx.lineWidth = 1.5 - r * 0.3;
            ctx.globalAlpha = 0.35 - r * 0.08;
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.primaryColor;
            ctx.stroke();
        }
        ctx.restore();
    }

    drawHaloRings(cx, cy) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(cx, cy);

        // Rotating Ring 1
        const rot1 = this.state === 'THINKING' ? this.time * 3 : this.time * 0.8;
        ctx.rotate(rot1);
        ctx.beginPath();
        ctx.ellipse(0, 0, 130, 45, Math.PI / 4, 0, Math.PI * 2);
        ctx.strokeStyle = this.primaryColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.stroke();

        // Rotating Ring 2 (Opposite direction)
        const rot2 = this.state === 'THINKING' ? -this.time * 2.5 : -this.time * 0.6;
        ctx.rotate(rot2);
        ctx.beginPath();
        ctx.ellipse(0, 0, 120, 40, -Math.PI / 3, 0, Math.PI * 2);
        ctx.strokeStyle = this.secondaryColor;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.45;
        ctx.stroke();

        ctx.restore();
    }

    drawCoreSphere(cx, cy) {
        const ctx = this.ctx;
        const radius = 80 + (this.state === 'SPEAKING' ? this.audioAmplitude * 10 : 0);

        ctx.save();
        // Radial Gradient for Holographic Orb Body
        const gradient = ctx.createRadialGradient(cx - 25, cy - 25, 10, cx, cy, radius);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, this.primaryColor);
        gradient.addColorStop(0.7, this.secondaryColor);
        gradient.addColorStop(1, 'rgba(7, 9, 19, 0.9)');

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 30 + (this.state === 'SPEAKING' || this.state === 'LISTENING' ? 25 : 10);
        ctx.shadowColor = this.primaryColor;
        ctx.fill();
        ctx.restore();
    }

    drawParticles(cx, cy) {
        const ctx = this.ctx;
        ctx.save();
        this.particles.forEach(p => {
            p.angle += p.speed * (this.state === 'THINKING' ? 3 : 1);
            p.x = cx + Math.cos(p.angle) * p.dist;
            p.y = cy + Math.sin(p.angle) * p.dist + this.floatOffsetY;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.primaryColor;
            ctx.globalAlpha = p.alpha;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.primaryColor;
            ctx.fill();
        });
        ctx.restore();
    }

    drawFaceFeatures(cx, cy) {
        const ctx = this.ctx;
        const eyeOffset = 25;
        const eyeY = cy - 8;

        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ffffff';

        // Draw Eyes
        if (this.isBlinking) {
            // Closed eyes slit
            ctx.fillRect(cx - eyeOffset - 12, eyeY, 24, 3);
            ctx.fillRect(cx + eyeOffset - 12, eyeY, 24, 3);
        } else {
            if (this.state === 'LISTENING') {
                // Wide attentive glowing eyes
                ctx.beginPath();
                ctx.arc(cx - eyeOffset, eyeY, 11, 0, Math.PI * 2);
                ctx.arc(cx + eyeOffset, eyeY, 11, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.state === 'SPEAKING') {
                // Happy curved eyes
                ctx.lineWidth = 4;
                ctx.strokeStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(cx - eyeOffset, eyeY + 4, 10, Math.PI, 0);
                ctx.arc(cx + eyeOffset, eyeY + 4, 10, Math.PI, 0);
                ctx.stroke();
            } else {
                // Normal Oval Eyes
                ctx.beginPath();
                ctx.ellipse(cx - eyeOffset, eyeY, 8, 12, 0, 0, Math.PI * 2);
                ctx.ellipse(cx + eyeOffset, eyeY, 8, 12, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw Mouth
        const mouthY = cy + 22;
        ctx.beginPath();
        if (this.state === 'SPEAKING') {
            const mouthHeight = 4 + this.audioAmplitude * 18;
            ctx.ellipse(cx, mouthY, 10, mouthHeight, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
        } else if (this.state === 'LISTENING') {
            ctx.arc(cx, mouthY - 3, 7, 0, Math.PI);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
        } else {
            // Subtle smile
            ctx.arc(cx, mouthY - 4, 9, 0.2, Math.PI - 0.2);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#ffffff';
            ctx.stroke();
        }

        ctx.restore();
    }
}

window.aiCharacter = null;
