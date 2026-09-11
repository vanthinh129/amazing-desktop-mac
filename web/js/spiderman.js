/**
 * Amazing Desktop Mac - ULTRA EPIC SPIDER-VERSE CINEMATIC WALLPAPER 🕷️🏙️💥
 * Features: Dynamic Camera Trajectory & Zoom Engine, Spider-Verse Chromatic Glitch,
 * Comic Pop-Art Text ("THWIP!", "BOOM!"), Anamorphic Lens Flares, Braided Web Cables & Screen Shake
 */

class SpiderCharacter {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        
        // Fullscreen setup
        this.resize = this.resize.bind(this);
        this.resize();
        window.addEventListener('resize', this.resize);

        // AI State: 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'
        this.state = 'IDLE';

        this.time = 0;
        this.audioAmplitude = 0;

        // Dynamic Elements
        this.webLines = [];
        this.sparks = [];
        this.dustParticles = [];
        this.comicTexts = []; // Comic Pop-Art Texts ("THWIP!", "BOOM!")

        // Stars & NYC Buildings Setup
        this.initStars();
        this.initDustParticles();
        this.initBuildings();

        // DYNAMIC CINEMATIC CAMERA SYSTEM
        this.cam = {
            x: 0,
            y: 0,
            zoom: 1.0,
            targetZoom: 1.0,
            angle: 0,
            targetAngle: 0,
            shake: 0
        };

        // AUTOMATIC HIGH-IMPACT ACTION ROUTINE SYSTEM
        // Sequences: 'DIVE_SWING' -> 'CAMERA_CLOSEUP_FLIP' -> 'EPIC_HERO_LAND' -> 'ROOFTOP_PERCH' -> 'MOON_LAUNCH' -> loop
        this.actionState = 'DIVE_SWING';
        this.actionTime = 0;
        this.spideyPos = { x: -100, y: -100, rot: 0, scale: 1.3, pose: 'SWING' };
        this.landingImpact = 0;

        this.animate = this.animate.bind(this);
        this.animFrameId = requestAnimationFrame(this.animate);
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        const wrapper = this.canvas.closest('.avatar-canvas-wrapper');
        if (wrapper) {
            wrapper.classList.add('fullscreen-mode');
        }

        if (this.buildings) this.initBuildings();
        if (this.stars) this.initStars();
        if (this.dustParticles) this.initDustParticles();
    }

    initStars() {
        this.stars = [];
        const starCount = Math.max(100, Math.floor((this.width * this.height) / 7000));
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * (this.height * 0.65),
                radius: Math.random() * 2.5 + 0.5,
                alpha: Math.random() * 0.85 + 0.15,
                twinkleSpeed: Math.random() * 0.05 + 0.01
            });
        }
    }

    initDustParticles() {
        this.dustParticles = [];
        for (let i = 0; i < 50; i++) {
            this.dustParticles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 2.2 + 0.8,
                vx: (Math.random() - 0.5) * 0.6,
                vy: -Math.random() * 0.5 - 0.2,
                alpha: Math.random() * 0.7 + 0.2
            });
        }
    }

    initBuildings() {
        this.buildings = [];
        const numBuildings = Math.max(10, Math.ceil(this.width / 130));
        const bWidth = this.width / numBuildings;
        const centerIdx = Math.floor(numBuildings / 2);

        for (let i = 0; i < numBuildings; i++) {
            const isCenter = (i === centerIdx || i === centerIdx - 1);
            let bType = 'GENERIC';
            let bHeight = 200 + Math.random() * 180;
            let bName = '';
            let bColor = (i % 2 === 0) ? '#080d1e' : '#0d152d';

            if (i === 1) {
                bType = 'OSCORP';
                bHeight = 350;
                bName = 'OSCORP';
                bColor = '#0a142c';
            } else if (i === numBuildings - 2) {
                bType = 'BUGLE';
                bHeight = 310;
                bName = 'DAILY BUGLE';
                bColor = '#170f24';
            } else if (isCenter) {
                bType = 'STAGE';
                bHeight = 240;
                bColor = '#050812';
            }

            const windowCols = Math.max(3, Math.floor(bWidth / 18));
            const windowRows = Math.floor(bHeight / 24);
            const windows = [];

            for (let r = 0; r < windowRows; r++) {
                for (let c = 0; c < windowCols; c++) {
                    windows.push({
                        lit: Math.random() > 0.35,
                        color: Math.random() > 0.35 ? '#ffe875' : (Math.random() > 0.5 ? '#75e6ff' : '#ff75b0'),
                        flicker: Math.random() * Math.PI * 2
                    });
                }
            }

            this.buildings.push({
                x: i * bWidth,
                width: bWidth + 3,
                height: bHeight,
                type: bType,
                name: bName,
                windowCols: windowCols,
                windowRows: windowRows,
                windows: windows,
                color: bColor,
                spire: (i % 3 === 2)
            });
        }
    }

    setState(newState) {
        this.state = newState;
        if (newState === 'SPEAKING') {
            this.addWebCable(
                this.spideyPos.x,
                this.spideyPos.y,
                this.centerX + (Math.random() - 0.5) * 500,
                80 + Math.random() * 200
            );
            this.spawnComicText('THWIP!', this.spideyPos.x, this.spideyPos.y - 60, '#00f0ff');
        }
    }

    setAudioAmplitude(amp) {
        this.audioAmplitude = amp;
    }

    setThemeColors(primary, secondary) {
        // Contract compatibility
    }

    stop() {
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
        }
        window.removeEventListener('resize', this.resize);
        const wrapper = this.canvas.closest('.avatar-canvas-wrapper');
        if (wrapper) {
            wrapper.classList.remove('fullscreen-mode');
        }
    }

    addWebCable(startX, startY, targetX, targetY) {
        this.webLines.push({
            startX: startX,
            startY: startY,
            targetX: targetX,
            targetY: targetY,
            progress: 0,
            life: 1.0
        });

        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 3;
            this.sparks.push({
                x: targetX,
                y: targetY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 3 + 1,
                alpha: 1.0,
                color: Math.random() > 0.5 ? '#ffffff' : '#00f0ff'
            });
        }
    }

    spawnComicText(text, x, y, color = '#ff003c') {
        this.comicTexts.push({
            text: text,
            x: x,
            y: y,
            scale: 0.2,
            targetScale: 1.2 + Math.random() * 0.4,
            alpha: 1.0,
            rotation: (Math.random() - 0.5) * 0.4,
            color: color
        });
    }

    animate() {
        this.time += 0.03;
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Update Camera Matrix Target Values
        this.updateCamera();

        // Save Context for Cinematic Camera Transform & Screen Shake
        this.ctx.save();
        this.applyCameraTransform();

        // 1. Render Cinematic Layered NYC Skyline Background
        this.drawCinematicNYCBackground();

        // 2. Render Atmospheric Dust Particles
        this.updateAndDrawDust();

        // 3. Render Web Cables & Energetic Sparks
        this.updateAndDrawWebs();

        // 4. Update High-Impact Movie Action State Machine
        this.updateMovieActionRoutine();

        // 5. Render High-Detail Spider-Man Model with Chromatic Glitch Shift
        this.drawHighDetailSpiderMan(this.spideyPos.x, this.spideyPos.y, this.spideyPos.rot, this.spideyPos.scale, this.spideyPos.pose);

        // 6. Render Ground Impact Shockwave
        if (this.landingImpact > 0) {
            this.drawLandingImpact();
            this.landingImpact -= 0.035;
        }

        // 7. Render Comic Pop-Art Texts ("THWIP!", "BOOM!")
        this.updateAndDrawComicTexts();

        this.ctx.restore(); // Restore Camera Transform

        this.animFrameId = requestAnimationFrame(this.animate);
    }

    updateCamera() {
        // Smoothly interpolate camera zoom & tilt towards targets
        this.cam.zoom += (this.cam.targetZoom - this.cam.zoom) * 0.08;
        this.cam.angle += (this.cam.targetAngle - this.cam.angle) * 0.08;

        // Apply decay to screen shake
        if (this.cam.shake > 0) {
            this.cam.shake *= 0.88;
            if (this.cam.shake < 0.2) this.cam.shake = 0;
        }
    }

    applyCameraTransform() {
        const ctx = this.ctx;
        // Screen shake offset
        const shakeX = (Math.random() - 0.5) * this.cam.shake;
        const shakeY = (Math.random() - 0.5) * this.cam.shake;

        ctx.translate(this.centerX + shakeX, this.centerY + shakeY);
        ctx.scale(this.cam.zoom, this.cam.zoom);
        ctx.rotate(this.cam.angle);
        ctx.translate(-this.centerX, -this.centerY);
    }

    updateMovieActionRoutine() {
        this.actionTime += 0.03;

        // ----------------------------------------------------
        // SEQUENCE 1: DIVE_SWING (Wide View Pendulum Swing)
        // ----------------------------------------------------
        if (this.actionState === 'DIVE_SWING') {
            const duration = 1.3;
            const p = Math.min(1, this.actionTime / duration);

            this.cam.targetZoom = 1.05;
            this.cam.targetAngle = -0.06;

            const pivotX = this.width * 0.45;
            const pivotY = 50;
            const radius = Math.min(this.width, this.height) * 0.58;
            const angle = -Math.PI * 0.65 + p * (Math.PI * 0.85);

            this.spideyPos.x = pivotX + Math.sin(angle) * radius;
            this.spideyPos.y = pivotY + Math.cos(angle) * radius;
            this.spideyPos.rot = angle + Math.PI / 2;
            this.spideyPos.scale = 1.3;
            this.spideyPos.pose = 'SWING';

            this.drawBraidedWebCable(pivotX, pivotY, this.spideyPos.x, this.spideyPos.y);

            if (p >= 1.0) {
                this.actionState = 'CAMERA_CLOSEUP_FLIP';
                this.actionTime = 0;
            }
        }
        // ----------------------------------------------------
        // SEQUENCE 2: CAMERA_CLOSEUP_FLIP (Zoom In 1.5x, 360° Flip & Comic "THWIP!")
        // ----------------------------------------------------
        else if (this.actionState === 'CAMERA_CLOSEUP_FLIP') {
            const duration = 1.2;
            const p = Math.min(1, this.actionTime / duration);

            // DYNAMIC CAMERA CLOSE-UP ZOOM!
            this.cam.targetZoom = 1.45;
            this.cam.targetAngle = 0.08;

            const startX = this.width * 0.2;
            const targetX = this.centerX;
            const jumpY = -Math.sin(p * Math.PI) * 170;

            this.spideyPos.x = startX + p * (targetX - startX);
            this.spideyPos.y = (this.height - 240) + jumpY;
            this.spideyPos.rot = p * Math.PI * 4; // Double 720° somersault!
            this.spideyPos.scale = 1.4;
            this.spideyPos.pose = 'FLIP';

            if (Math.abs(this.actionTime - 0.3) < 0.03) {
                this.spawnComicText('THWIP!', this.spideyPos.x + 40, this.spideyPos.y - 40, '#00f0ff');
            }

            if (Math.random() > 0.2) {
                this.sparks.push({
                    x: this.spideyPos.x + (Math.random() - 0.5) * 50,
                    y: this.spideyPos.y + (Math.random() - 0.5) * 50,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    radius: Math.random() * 3 + 1,
                    alpha: 1,
                    color: Math.random() > 0.5 ? '#ff003c' : '#00f0ff'
                });
            }

            if (p >= 1.0) {
                this.actionState = 'EPIC_HERO_LAND';
                this.actionTime = 0;
                this.landingImpact = 1.0;
                this.cam.shake = 18; // Trigger SCREEN SHAKE!
                this.spawnComicText('BOOM!', this.centerX, this.height - 280, '#ff003c');
            }
        }
        // ----------------------------------------------------
        // SEQUENCE 3: EPIC_HERO_LAND (3-Point Landing Crouch with Screen Shake & Pop-Art "BOOM!")
        // ----------------------------------------------------
        else if (this.actionState === 'EPIC_HERO_LAND') {
            const duration = 1.0;
            const p = Math.min(1, this.actionTime / duration);
            const targetY = this.height - 230;

            this.cam.targetZoom = 1.3;
            this.cam.targetAngle = 0;

            this.spideyPos.x = this.centerX;
            this.spideyPos.y = targetY + (1 - p) * 25;
            this.spideyPos.rot = 0;
            this.spideyPos.scale = 1.35;
            this.spideyPos.pose = 'CROUCH_LAND';

            if (p >= 1.0) {
                this.actionState = 'ROOFTOP_PERCH';
                this.actionTime = 0;
            }
        }
        // ----------------------------------------------------
        // SEQUENCE 4: ROOFTOP_PERCH (Rooftop Stand & Rapid Dual Web Shooting)
        // ----------------------------------------------------
        else if (this.actionState === 'ROOFTOP_PERCH') {
            const duration = 2.2;
            const p = Math.min(1, this.actionTime / duration);

            this.cam.targetZoom = 1.1;
            this.cam.targetAngle = -0.03;

            const floatBob = Math.sin(this.actionTime * 3) * 6;
            this.spideyPos.x = this.centerX;
            this.spideyPos.y = (this.height - 230) + floatBob;
            this.spideyPos.rot = Math.sin(this.actionTime * 1.5) * 0.03;
            this.spideyPos.scale = 1.3;
            this.spideyPos.pose = 'STAND_HERO';

            if (Math.abs(this.actionTime - 0.4) < 0.03) {
                this.addWebCable(this.spideyPos.x, this.spideyPos.y - 15, this.width * 0.15, 110);
                this.spawnComicText('THWIP!', this.width * 0.18, 90, '#00f0ff');
            }
            if (Math.abs(this.actionTime - 1.2) < 0.03) {
                this.addWebCable(this.spideyPos.x, this.spideyPos.y - 15, this.width * 0.85, 130);
                this.spawnComicText('THWIP!', this.width * 0.82, 110, '#ffea75');
            }

            if (p >= 1.0) {
                this.actionState = 'MOON_LAUNCH';
                this.actionTime = 0;
            }
        }
        // ----------------------------------------------------
        // SEQUENCE 5: MOON_LAUNCH (High Altitude Launch across Moon)
        // ----------------------------------------------------
        else if (this.actionState === 'MOON_LAUNCH') {
            const duration = 1.5;
            const p = Math.min(1, this.actionTime / duration);

            this.cam.targetZoom = 1.2;
            this.cam.targetAngle = 0.05;

            const pivotX = this.width * 0.35;
            const pivotY = 40;
            const radius = Math.min(this.width, this.height) * 0.58;
            const angle = Math.PI * 0.62 - p * (Math.PI * 0.82);

            this.spideyPos.x = pivotX + Math.sin(angle) * radius;
            this.spideyPos.y = pivotY + Math.cos(angle) * radius;
            this.spideyPos.rot = angle - Math.PI / 2;
            this.spideyPos.scale = 1.3;
            this.spideyPos.pose = 'SWING';

            this.drawBraidedWebCable(pivotX, pivotY, this.spideyPos.x, this.spideyPos.y);

            if (p >= 1.0) {
                this.actionState = 'DIVE_SWING';
                this.actionTime = 0;
            }
        }
    }

    drawBraidedWebCable(pivotX, pivotY, spideyX, spideyY) {
        const ctx = this.ctx;
        ctx.save();

        // Main white web strand
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(spideyX, spideyY);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 18;
        ctx.shadowColor = '#00f0ff';
        ctx.stroke();

        // Secondary cyan spiral web accent
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        const midX = (pivotX + spideyX) / 2 + Math.sin(this.time * 6) * 10;
        const midY = (pivotY + spideyY) / 2 + Math.cos(this.time * 6) * 10;
        ctx.quadraticCurveTo(midX, midY, spideyX, spideyY);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Anchor node spark
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ffffff';
        ctx.fill();
        ctx.restore();
    }

    drawLandingImpact() {
        const ctx = this.ctx;
        const targetY = this.height - 130;
        const radius = (1 - this.landingImpact) * 280 + 35;

        ctx.save();
        ctx.translate(this.centerX, targetY);
        ctx.scale(1, 0.32);

        // Outer cyan ring
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 240, 255, ${this.landingImpact})`;
        ctx.lineWidth = 7 * this.landingImpact;
        ctx.shadowBlur = 35;
        ctx.shadowColor = '#00f0ff';
        ctx.stroke();

        // Inner crimson ring
        ctx.beginPath();
        ctx.arc(0, 0, radius * 0.65, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 0, 60, ${this.landingImpact})`;
        ctx.lineWidth = 5 * this.landingImpact;
        ctx.stroke();

        // Radial web shockwave spokes
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius);
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.landingImpact * 0.85})`;
            ctx.lineWidth = 2.5;
            ctx.stroke();
        }

        ctx.restore();
    }

    updateAndDrawComicTexts() {
        const ctx = this.ctx;

        for (let i = this.comicTexts.length - 1; i >= 0; i--) {
            const t = this.comicTexts[i];
            t.scale += (t.targetScale - t.scale) * 0.2;
            t.alpha -= 0.02;

            ctx.save();
            ctx.translate(t.x, t.y);
            ctx.rotate(t.rotation);
            ctx.scale(t.scale, t.scale);

            // Comic Pop-Art Badge Background Starburst
            ctx.beginPath();
            const points = 10;
            for (let p = 0; p < points * 2; p++) {
                const r = (p % 2 === 0) ? 55 : 30;
                const a = (p / (points * 2)) * Math.PI * 2;
                const px = Math.cos(a) * r;
                const py = Math.sin(a) * r;
                if (p === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fillStyle = t.color;
            ctx.globalAlpha = Math.max(0, t.alpha * 0.85);
            ctx.shadowBlur = 20;
            ctx.shadowColor = t.color;
            ctx.fill();

            // Text Label
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 24px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ffffff';
            ctx.globalAlpha = Math.max(0, t.alpha);
            ctx.fillText(t.text, 0, 0);

            ctx.restore();

            if (t.alpha <= 0) {
                this.comicTexts.splice(i, 1);
            }
        }
    }

    drawCinematicNYCBackground() {
        const ctx = this.ctx;

        // Rich Movie Atmospheric Night Sky Gradient (Deep Indigo to Cyber Night)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        skyGrad.addColorStop(0, '#040714');
        skyGrad.addColorStop(0.4, '#0a122c');
        skyGrad.addColorStop(0.8, '#141d3d');
        skyGrad.addColorStop(1, '#1d274a');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Twinkling Stars
        ctx.save();
        this.stars.forEach(s => {
            s.alpha += Math.sin(this.time * 5 * s.twinkleSpeed) * 0.015;
            s.alpha = Math.max(0.1, Math.min(0.95, s.alpha));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
            ctx.shadowBlur = s.radius * 2;
            ctx.shadowColor = '#ffffff';
            ctx.fill();
        });
        ctx.restore();

        // Giant Textured 3D Moon with Atmospheric Cyan Glow
        ctx.save();
        const moonX = this.width - 180;
        const moonY = 120;
        const moonRadius = 65;

        const moonGlow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.7, moonX, moonY, moonRadius * 3.2);
        moonGlow.addColorStop(0, 'rgba(255, 255, 240, 0.95)');
        moonGlow.addColorStop(0.3, 'rgba(0, 240, 255, 0.3)');
        moonGlow.addColorStop(0.7, 'rgba(112, 0, 255, 0.12)');
        moonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = moonGlow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#fffdf0';
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#ffffdd';
        ctx.fill();

        // Moon Craters
        ctx.fillStyle = 'rgba(190, 190, 170, 0.35)';
        ctx.beginPath();
        ctx.arc(moonX - 16, moonY - 12, 13, 0, Math.PI * 2);
        ctx.arc(moonX + 20, moonY + 16, 9, 0, Math.PI * 2);
        ctx.arc(moonX - 10, moonY + 22, 8, 0, Math.PI * 2);
        ctx.fill();

        // Drifting Clouds over Moon
        const cloudX = moonX + Math.sin(this.time * 0.3) * 28 - 45;
        ctx.fillStyle = 'rgba(20, 30, 60, 0.45)';
        ctx.beginPath();
        ctx.ellipse(cloudX, moonY + 10, 80, 24, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Searchlight Spotlight Beams with Light Shaft Volumetrics
        ctx.save();
        const beamAngle = Math.sin(this.time * 0.6) * 0.32;
        ctx.translate(this.width * 0.2, this.height);
        ctx.rotate(beamAngle);

        const beamGrad = ctx.createLinearGradient(0, 0, 0, -this.height * 0.95);
        beamGrad.addColorStop(0, 'rgba(0, 240, 255, 0.25)');
        beamGrad.addColorStop(0.6, 'rgba(0, 240, 255, 0.09)');
        beamGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.beginPath();
        ctx.moveTo(-35, 0);
        ctx.lineTo(-120, -this.height * 0.95);
        ctx.lineTo(120, -this.height * 0.95);
        ctx.lineTo(35, 0);
        ctx.fillStyle = beamGrad;
        ctx.fill();
        ctx.restore();

        // Render Layered NYC Skyscrapers (Oscorp, Daily Bugle, Stage)
        this.buildings.forEach(b => {
            const bY = this.height - b.height;
            ctx.save();

            const bGrad = ctx.createLinearGradient(b.x, bY, b.x + b.width, bY + b.height);
            bGrad.addColorStop(0, b.color);
            bGrad.addColorStop(1, '#050914');

            ctx.fillStyle = bGrad;
            ctx.fillRect(b.x, bY, b.width, b.height);

            ctx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(b.x, bY, b.width, b.height);

            // OSCORP TOWER (Slanted Glass Top & Neon Sign)
            if (b.type === 'OSCORP') {
                ctx.beginPath();
                ctx.moveTo(b.x, bY + 40);
                ctx.lineTo(b.x + b.width, bY);
                ctx.lineTo(b.x + b.width, bY + 40);
                ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
                ctx.fill();

                ctx.fillStyle = '#00f0ff';
                ctx.font = 'bold 18px "Space Grotesk", sans-serif';
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#00f0ff';
                ctx.fillText('OSCORP', b.x + 10, bY + 70);
            }

            // DAILY BUGLE TOWER (Classic Brick & Giant Red Billboard)
            if (b.type === 'BUGLE') {
                const bbX = b.x + 6;
                const bbY = bY + 20;
                const bbW = b.width - 12;
                const bbH = 45;

                ctx.fillStyle = '#ff003c';
                ctx.shadowBlur = 22;
                ctx.shadowColor = '#ff003c';
                ctx.fillRect(bbX, bbY, bbW, bbH);

                ctx.fillStyle = '#ffffff';
                ctx.font = '900 13px "Space Grotesk", sans-serif';
                ctx.shadowBlur = 12;
                ctx.shadowColor = '#ffffff';
                ctx.fillText('DAILY BUGLE', bbX + 4, bbY + 28);
            }

            // Building Spire Hazard Lights
            if (b.spire) {
                ctx.beginPath();
                ctx.moveTo(b.x + b.width / 2 - 5, bY);
                ctx.lineTo(b.x + b.width / 2, bY - 60);
                ctx.lineTo(b.x + b.width / 2 + 5, bY);
                ctx.fillStyle = '#ff003c';
                ctx.fill();

                if (Math.sin(this.time * 6) > 0) {
                    ctx.beginPath();
                    ctx.arc(b.x + b.width / 2, bY - 60, 4, 0, Math.PI * 2);
                    ctx.fillStyle = '#ff003c';
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = '#ff003c';
                    ctx.fill();
                }
            }

            // Window Lights
            const colWidth = (b.width - 14) / b.windowCols;
            const rowHeight = (b.height - 30) / b.windowRows;

            b.windows.forEach((w, wIdx) => {
                const r = Math.floor(wIdx / b.windowCols);
                const c = wIdx % b.windowCols;
                const wx = b.x + 7 + c * colWidth + 2;
                const wy = bY + 15 + r * rowHeight + 2;

                if (w.lit) {
                    const flickerAlpha = 0.65 + Math.sin(this.time * 3 + w.flicker) * 0.25;
                    ctx.fillStyle = w.color;
                    ctx.globalAlpha = flickerAlpha;
                    ctx.shadowBlur = 6;
                    ctx.shadowColor = w.color;
                    ctx.fillRect(wx, wy, colWidth - 4, rowHeight - 4);
                } else {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.globalAlpha = 1.0;
                    ctx.fillRect(wx, wy, colWidth - 4, rowHeight - 4);
                }
            });

            ctx.restore();
        });

        // Foreground Stage Building Rooftop Ledge
        ctx.save();
        const ledgeWidth = 260;
        const ledgeX = this.centerX - ledgeWidth / 2;
        const ledgeY = this.height - 180;

        ctx.fillStyle = '#050812';
        ctx.fillRect(ledgeX, ledgeY, ledgeWidth, 180);
        ctx.strokeStyle = '#1a274a';
        ctx.lineWidth = 3;
        ctx.strokeRect(ledgeX, ledgeY, ledgeWidth, 180);

        // Neon Red Rim Lighting on Ledge Edge
        ctx.beginPath();
        ctx.moveTo(ledgeX, ledgeY);
        ctx.lineTo(ledgeX + ledgeWidth, ledgeY);
        ctx.strokeStyle = '#ff003c';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff003c';
        ctx.stroke();
        ctx.restore();

        // Atmospheric Fog
        ctx.save();
        const fogGrad = ctx.createLinearGradient(0, this.height - 100, 0, this.height);
        fogGrad.addColorStop(0, 'rgba(10, 18, 40, 0)');
        fogGrad.addColorStop(1, 'rgba(10, 18, 40, 0.7)');
        ctx.fillStyle = fogGrad;
        ctx.fillRect(0, this.height - 100, this.width, 100);
        ctx.restore();
    }

    updateAndDrawDust() {
        const ctx = this.ctx;
        ctx.save();
        this.dustParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.y < 0) p.y = this.height;
            if (p.x < 0) p.x = this.width;
            if (p.x > this.width) p.x = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha})`;
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#00f0ff';
            ctx.fill();
        });
        ctx.restore();
    }

    updateAndDrawWebs() {
        const ctx = this.ctx;

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
            ctx.lineWidth = 3.8;
            ctx.shadowBlur = 18;
            ctx.shadowColor = '#00f0ff';
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(currX, currY, 5.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.restore();

            if (w.life <= 0) {
                this.webLines.splice(i, 1);
            }
        }

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
            ctx.shadowBlur = 10;
            ctx.shadowColor = s.color;
            ctx.fill();
            ctx.restore();

            if (s.alpha <= 0) {
                this.sparks.splice(i, 1);
            }
        }
    }

    drawHighDetailSpiderMan(x, y, rotation, scale, pose) {
        const ctx = this.ctx;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(scale, scale);

        // SPIDER-VERSE CHROMATIC ABERRATION GLITCH SHIFT EFFECT
        if (pose === 'FLIP' || pose === 'SWING') {
            ctx.save();
            ctx.translate(-4, -2);
            this.drawSpiderManBodyGeometry(ctx, 'rgba(0, 240, 255, 0.45)', pose);
            ctx.restore();

            ctx.save();
            ctx.translate(4, 2);
            this.drawSpiderManBodyGeometry(ctx, 'rgba(255, 0, 60, 0.45)', pose);
            ctx.restore();
        }

        // Main Spider-Man Render
        this.drawSpiderManBodyGeometry(ctx, null, pose);

        ctx.restore();
    }

    drawSpiderManBodyGeometry(ctx, overrideColor = null, pose = 'SWING') {
        const suitRed = overrideColor || '#ff003c';
        const suitBlue = overrideColor || '#0a1d4a';
        const webLineColor = 'rgba(15, 20, 35, 0.85)';

        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';

        if (pose === 'CROUCH_LAND') {
            ctx.scale(1.1, 0.85);
        }

        // Torso / Legs
        ctx.beginPath();
        ctx.ellipse(0, 42, 34, 42, 0, 0, Math.PI * 2);
        ctx.fillStyle = suitBlue;
        ctx.fill();

        // Red V-Chest Vest
        ctx.beginPath();
        ctx.moveTo(-30, 12);
        ctx.lineTo(0, 78);
        ctx.lineTo(30, 12);
        ctx.lineTo(24, 8);
        ctx.lineTo(0, 52);
        ctx.lineTo(-24, 8);
        ctx.fillStyle = suitRed;
        ctx.fill();

        // Spider Emblem
        ctx.save();
        ctx.translate(0, 34);
        ctx.beginPath();
        ctx.ellipse(0, 0, 6, 9, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#060810';
        ctx.fill();

        ctx.strokeStyle = '#060810';
        ctx.lineWidth = 2.2;
        for (let i = -1; i <= 1; i += 2) {
            ctx.beginPath();
            ctx.moveTo(0, -4);
            ctx.lineTo(i * 14, -10);
            ctx.lineTo(i * 18, -5);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, 4);
            ctx.lineTo(i * 16, 8);
            ctx.lineTo(i * 20, 15);
            ctx.stroke();
        }
        ctx.restore();

        // Arms
        const isSpeakingOrThwipping = this.state === 'SPEAKING' || this.webLines.length > 0;
        const armWave = isSpeakingOrThwipping ? Math.sin(this.time * 12) * 10 : Math.sin(this.time * 2) * 3;

        // Left Arm
        ctx.save();
        ctx.translate(-30, 18);
        ctx.rotate(-0.35 + armWave * 0.02);
        ctx.beginPath();
        ctx.ellipse(0, 22, 11, 24, 0.2, 0, Math.PI * 2);
        ctx.fillStyle = suitRed;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 42, 10, 0, Math.PI * 2);
        ctx.fillStyle = suitRed;
        ctx.fill();
        ctx.restore();

        // Right Arm (Thwip Gesture)
        ctx.save();
        ctx.translate(30, 18);
        const rArmAngle = isSpeakingOrThwipping ? -0.85 : (this.state === 'LISTENING' ? -0.4 : 0.25);
        ctx.rotate(rArmAngle);
        ctx.beginPath();
        ctx.ellipse(0, 22, 11, 24, -0.2, 0, Math.PI * 2);
        ctx.fillStyle = suitRed;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 42, 10, 0, Math.PI * 2);
        ctx.fillStyle = suitRed;
        ctx.fill();

        ctx.strokeStyle = '#a00028';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(4, 42);
        ctx.lineTo(14, 54);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-4, 42);
        ctx.lineTo(-12, 54);
        ctx.stroke();
        ctx.restore();

        // Head Mask
        ctx.save();
        ctx.translate(0, -18);

        ctx.beginPath();
        ctx.ellipse(0, 0, 48, 50, 0, 0, Math.PI * 2);
        ctx.fillStyle = suitRed;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#ff003c';
        ctx.fill();

        // Web Mesh on Mask
        ctx.save();
        ctx.clip();
        ctx.strokeStyle = webLineColor;
        ctx.lineWidth = 1.3;

        for (let r = 12; r <= 50; r += 12) {
            ctx.beginPath();
            ctx.arc(0, -5, r, 0, Math.PI * 2);
            ctx.stroke();
        }
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
            ctx.beginPath();
            ctx.moveTo(0, -5);
            ctx.lineTo(Math.cos(a) * 55, -5 + Math.sin(a) * 55);
            ctx.stroke();
        }
        ctx.restore();

        // Eye Lenses
        this.drawSpideyLenses(ctx);

        ctx.restore(); // Head
    }

    drawSpideyLenses(ctx) {
        let lensSquintL = 1.0;
        let lensSquintR = 1.0;
        let lensScale = 1.0;
        let glowColor = '#ffffff';

        if (this.state === 'LISTENING') {
            lensScale = 1.18;
            glowColor = '#00f0ff';
        } else if (this.state === 'THINKING') {
            lensSquintL = 0.45 + Math.sin(this.time * 4) * 0.1;
            lensSquintR = 1.1;
            lensScale = 1.05;
        } else if (this.state === 'SPEAKING') {
            const talkAmp = this.audioAmplitude * 2.5;
            lensSquintL = 0.8 + Math.sin(this.time * 15) * 0.25 + talkAmp * 0.3;
            lensSquintR = 0.8 + Math.cos(this.time * 15) * 0.25 + talkAmp * 0.3;
            lensScale = 1.0 + talkAmp * 0.2;
            glowColor = '#ffeb3b';
        }

        const lensOffsetX = 19;
        const lensOffsetY = -5;

        for (let side = -1; side <= 1; side += 2) {
            const squint = side === -1 ? lensSquintL : lensSquintR;

            ctx.save();
            ctx.translate(side * lensOffsetX, lensOffsetY);
            ctx.scale(side * lensScale, lensScale * squint);

            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.bezierCurveTo(15, -20, 24, -4, 22, 15);
            ctx.bezierCurveTo(13, 20, -4, 13, -20, 0);
            ctx.bezierCurveTo(-20, -13, -11, -20, 0, -20);
            ctx.fillStyle = '#060810';
            ctx.shadowBlur = 15;
            ctx.shadowColor = glowColor;
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(0, -15);
            ctx.bezierCurveTo(11, -15, 18, -3, 16, 11);
            ctx.bezierCurveTo(10, 14, -3, 10, -14, 0);
            ctx.bezierCurveTo(-14, -10, -8, -15, 0, -15);

            const glassGrad = ctx.createLinearGradient(0, -15, 0, 11);
            glassGrad.addColorStop(0, '#ffffff');
            glassGrad.addColorStop(0.65, '#e0f8ff');
            glassGrad.addColorStop(1, '#a6f0ff');

            ctx.fillStyle = glassGrad;
            ctx.shadowBlur = 18;
            ctx.shadowColor = glowColor;
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(-6, -9);
            ctx.lineTo(9, 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 2.2;
            ctx.stroke();

            ctx.restore();
        }
    }
}

window.SpiderCharacter = SpiderCharacter;
