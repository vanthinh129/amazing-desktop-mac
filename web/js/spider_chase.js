/**
 * Amazing Desktop Mac - CHIBI SPIDER-MAN VS VENOM INDEPENDENT COMBAT ENGINE 🕷️⚡💥
 * 100% Vector Procedural Dual-Agent Combat with Independent Attack/Parry/Block Routines.
 */

class SpiderChaseCharacter {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');

        // Virtual stage resolution (800 x 500)
        this.virtualWidth = 800;
        this.virtualHeight = 500;

        this.resize = this.resize.bind(this);
        this.resize();
        window.addEventListener('resize', this.resize);

        // AI State
        this.state = 'IDLE';
        this.animTime = 0;
        this.audioAmplitude = 0;

        // Dynamic Particle & Comic FX Arrays
        this.sparks = [];
        this.webLines = [];
        this.comicTexts = [];
        this.shieldImpact = 0;

        // Independent Character State Agents
        this.spidey = {
            x: 480,
            y: 260,
            scale: 0.76,
            rot: 0,
            flipX: false,
            pose: 'IDLE',
            emotion: 'happy',
            eyeMorph: { innerTopY: -10, outerTopY: -25, innerBotY: -35, outerBotY: -30, tilt: 0 }
        };

        this.venom = {
            x: 280,
            y: 260,
            scale: 0.80,
            rot: 0,
            flipX: false,
            pose: 'IDLE',
            mouthOpen: 0.5,
            shieldActive: false
        };

        // 5 Independent Combat Scenes State Machine:
        // 'SCENE_1_CLAW_SWIPE' -> 'SCENE_2_SLINGSHOT_SHIELD' -> 'SCENE_3_TENDRIL_WALLJUMP' -> 'SCENE_4_RAPID_EXCHANGE' -> 'SCENE_5_STANDOFF_FISTBUMP'
        this.scene = 'SCENE_1_CLAW_SWIPE';
        this.sceneTime = 0;

        this.animate = this.animate.bind(this);
        this.animFrameId = requestAnimationFrame(this.animate);
    }

    resize() {
        const wrapper = this.canvas.parentElement;
        if (wrapper) {
            this.width = this.canvas.width = wrapper.clientWidth || window.innerWidth;
            this.height = this.canvas.height = wrapper.clientHeight || window.innerHeight;
        } else {
            this.width = this.canvas.width = window.innerWidth;
            this.height = this.canvas.height = window.innerHeight;
        }
    }

    stop() {
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
        }
        window.removeEventListener('resize', this.resize);
    }

    setState(newState) {
        this.state = newState;
    }

    setAudioAmplitude(amp) {
        this.audioAmplitude = amp;
    }

    lerp(a, b, t) {
        return a + (b - a) * t;
    }

    spawnComicText(text, x, y, color = '#ff003c') {
        this.comicTexts.push({
            text: text,
            x: x,
            y: y,
            scale: 0.2,
            targetScale: 1.25,
            alpha: 1.0,
            rotation: (Math.random() - 0.5) * 0.4,
            color: color
        });
    }

    spawnSparks(x, y, count = 12, color = '#ffffff') {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 2;
            this.sparks.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                radius: Math.random() * 3.5 + 1.2,
                alpha: 1.0,
                color: color
            });
        }
    }

    // --- INDEPENDENT COMBAT STATE MACHINE (5 SYNCHRONIZED ACTION SCENES) ---

    updateCombatStateMachine() {
        const dt = 0.03;
        this.sceneTime += dt;
        const groundY = 260;

        // ----------------------------------------------------
        // SCENE 1: Venom Claw Slash -> Spidey Duck & Backflip Parry
        // ----------------------------------------------------
        if (this.scene === 'SCENE_1_CLAW_SWIPE') {
            const duration = 4.5;
            const p = Math.min(1, this.sceneTime / duration);

            // Venom runs up and swings claw
            const venomCharge = Math.sin(p * Math.PI) * 120;
            this.venom.x = 220 + venomCharge;
            this.venom.y = groundY + Math.abs(Math.sin(this.sceneTime * 14)) * -12;
            this.venom.rot = Math.sin(this.sceneTime * 8) * 0.1;
            this.venom.flipX = false;
            this.venom.pose = p > 0.4 && p < 0.8 ? 'SWIPE' : 'IDLE';
            this.venom.mouthOpen = p > 0.4 ? 1.0 : 0.4;
            this.venom.shieldActive = false;

            // Spidey ducks low, then vaults back & shoots web blast
            if (p < 0.4) {
                // Spidey crouches/ducks under claw
                this.spidey.x = 480;
                this.spidey.y = groundY + 20;
                this.spidey.rot = -0.15;
                this.spidey.flipX = true;
                this.spidey.pose = 'DUCK';
                this.spidey.emotion = 'happy';
            } else if (p < 0.75) {
                // Spidey spring-vaults back mid-air
                const jumpProgress = (p - 0.4) / 0.35;
                this.spidey.x = 480 + jumpProgress * 100;
                this.spidey.y = groundY - Math.sin(jumpProgress * Math.PI) * 110;
                this.spidey.rot = -jumpProgress * Math.PI * 2;
                this.spidey.flipX = true;
                this.spidey.pose = 'FLIP';
                this.spidey.emotion = 'angry';
            } else {
                // Spidey lands & shoots web blast at Venom!
                this.spidey.x = 580;
                this.spidey.y = groundY;
                this.spidey.rot = 0;
                this.spidey.flipX = true;
                this.spidey.pose = 'THWIP';
                this.spidey.emotion = 'angry';

                if (Math.abs(this.sceneTime - 3.4) < 0.04) {
                    this.spawnComicText('THWIP!', 540, 210, '#00f0ff');
                    this.webLines.push({ startX: 580, startY: 230, targetX: 340, targetY: 220, life: 1.0 });
                }
            }

            if (p >= 1.0) {
                this.scene = 'SCENE_2_SLINGSHOT_SHIELD';
                this.sceneTime = 0;
            }
        }
        // ----------------------------------------------------
        // SCENE 2: Spidey Slingshot Dropkick -> Venom Symbiote Shield Block
        // ----------------------------------------------------
        else if (this.scene === 'SCENE_2_SLINGSHOT_SHIELD') {
            const duration = 4.5;
            const p = Math.min(1, this.sceneTime / duration);

            // Spidey anchors webs & slingshots forward
            if (p < 0.4) {
                // Pulling back
                this.spidey.x = 640 - p * 80;
                this.spidey.y = groundY;
                this.spidey.rot = 0.2;
                this.spidey.flipX = true;
                this.spidey.pose = 'SLING_PULL';
                this.spidey.emotion = 'angry';

                // Web slingshot ropes behind Spidey
                this.webLines.push({ startX: this.spidey.x, startY: 240, targetX: 780, targetY: 100, life: 0.1 });
                this.webLines.push({ startX: this.spidey.x, startY: 240, targetX: 780, targetY: 380, life: 0.1 });

                this.venom.x = 240;
                this.venom.y = groundY;
                this.venom.rot = 0;
                this.venom.flipX = false;
                this.venom.pose = 'IDLE';
                this.venom.shieldActive = false;
            } else if (p < 0.75) {
                // High-speed dropkick launch!
                const launchP = (p - 0.4) / 0.35;
                this.spidey.x = 560 - launchP * 240;
                this.spidey.y = groundY - Math.sin(launchP * Math.PI) * 40;
                this.spidey.rot = -0.4;
                this.spidey.flipX = true;
                this.spidey.pose = 'DROPKICK';

                // Venom grows symbiote shield to block!
                this.venom.x = 240;
                this.venom.y = groundY;
                this.venom.rot = -0.1;
                this.venom.flipX = false;
                this.venom.pose = 'SHIELD_BLOCK';
                this.venom.shieldActive = true;

                if (Math.abs(launchP - 0.85) < 0.05) {
                    this.shieldImpact = 1.0;
                    this.spawnComicText('BLOCK!', 300, 200, '#a855f7');
                    this.spawnSparks(300, 230, 18, '#a855f7');
                }
            } else {
                // Spidey bounces off Venom's shield
                const bounceP = (p - 0.75) / 0.25;
                this.spidey.x = 320 + bounceP * 120;
                this.spidey.y = groundY - Math.sin(bounceP * Math.PI) * 70;
                this.spidey.rot = bounceP * Math.PI * 2;
                this.spidey.flipX = false;
                this.spidey.pose = 'FLIP';

                this.venom.x = 240;
                this.venom.y = groundY;
                this.venom.rot = 0;
                this.venom.shieldActive = false;
            }

            if (p >= 1.0) {
                this.scene = 'SCENE_3_TENDRIL_WALLJUMP';
                this.sceneTime = 0;
            }
        }
        // ----------------------------------------------------
        // SCENE 3: Venom Tendril Sweep -> Spidey Wall-Jump Dodge & Web Pull
        // ----------------------------------------------------
        else if (this.scene === 'SCENE_3_TENDRIL_WALLJUMP') {
            const duration = 4.5;
            const p = Math.min(1, this.sceneTime / duration);

            // Venom sweeps 4 heavy tendrils along floor
            this.venom.x = 300;
            this.venom.y = groundY;
            this.venom.rot = 0.15;
            this.venom.flipX = false;
            this.venom.pose = 'TENDRIL_SWEEP';
            this.venom.mouthOpen = 0.9;

            if (p < 0.45) {
                // Spidey wall-jumps off right skyscraper to dodge low sweep
                const wallP = p / 0.45;
                this.spidey.x = 440 + wallP * 280;
                this.spidey.y = groundY - Math.sin(wallP * Math.PI) * 140;
                this.spidey.rot = -wallP * Math.PI * 1.5;
                this.spidey.flipX = true;
                this.spidey.pose = 'WALL_JUMP';
                this.spidey.emotion = 'happy';
            } else if (p < 0.8) {
                // Spidey kicks off wall, anchors web onto Venom's arm & pulls Venom!
                const pullP = (p - 0.45) / 0.35;
                this.spidey.x = 720 - pullP * 180;
                this.spidey.y = groundY;
                this.spidey.rot = 0;
                this.spidey.flipX = true;
                this.spidey.pose = 'WEB_PULL';
                this.spidey.emotion = 'angry';

                // Web connecting Spidey to Venom
                this.webLines.push({ startX: this.spidey.x - 30, startY: 240, targetX: this.venom.x + 30, targetY: 240, life: 0.1 });

                // Venom stumbles forward from web pull!
                this.venom.x = 300 + pullP * 80;
                this.venom.rot = 0.3;
                this.venom.pose = 'STUMBLE';

                if (Math.abs(pullP - 0.5) < 0.05) {
                    this.spawnComicText('YANK!', 400, 190, '#00f0ff');
                }
            } else {
                // Reset positions
                this.spidey.x = 540;
                this.spidey.y = groundY;
                this.spidey.rot = 0;
                this.spidey.flipX = true;
                this.spidey.pose = 'IDLE';

                this.venom.x = 380;
                this.venom.y = groundY;
                this.venom.rot = 0;
                this.venom.pose = 'IDLE';
            }

            if (p >= 1.0) {
                this.scene = 'SCENE_4_RAPID_EXCHANGE';
                this.sceneTime = 0;
            }
        }
        // ----------------------------------------------------
        // SCENE 4: Rapid Close Combat Exchange (Punch - Block - Sway - Counter)
        // ----------------------------------------------------
        else if (this.scene === 'SCENE_4_RAPID_EXCHANGE') {
            const duration = 4.5;
            const p = Math.min(1, this.sceneTime / duration);

            this.spidey.x = 460;
            this.venom.x = 340;
            this.spidey.flipX = true;
            this.venom.flipX = false;

            if (p < 0.3) {
                // Venom claw jab -> Spidey sways back
                this.venom.pose = 'JAB_LEFT';
                this.venom.x = 340 + Math.sin(p * Math.PI * 3.3) * 25;

                this.spidey.pose = 'SWAY_BACK';
                this.spidey.x = 460 + Math.sin(p * Math.PI * 3.3) * 15;
                this.spidey.rot = -0.2;

                if (Math.abs(p - 0.15) < 0.03) {
                    this.spawnComicText('MISS!', 400, 200, '#e2e8f0');
                }
            } else if (p < 0.65) {
                // Spidey right web punch -> Venom forearm block
                this.spidey.pose = 'JAB_RIGHT';
                this.spidey.x = 460 - Math.sin((p - 0.3) * Math.PI * 2.8) * 30;

                this.venom.pose = 'BLOCK_ARM';
                this.venom.x = 340 - Math.sin((p - 0.3) * Math.PI * 2.8) * 10;

                if (Math.abs(p - 0.45) < 0.03) {
                    this.spawnComicText('CLASH!', 400, 200, '#ffe875');
                    this.spawnSparks(400, 230, 10, '#ffe875');
                }
            } else {
                // Spidey somersaults over Venom -> Venom turns around roaring!
                const overP = (p - 0.65) / 0.35;
                this.spidey.x = 460 - overP * 240;
                this.spidey.y = groundY - Math.sin(overP * Math.PI) * 110;
                this.spidey.rot = -overP * Math.PI * 2;
                this.spidey.flipX = false;

                this.venom.x = 340;
                this.venom.y = groundY;
                this.venom.flipX = true;
                this.venom.pose = 'ROAR';
                this.venom.mouthOpen = 1.0;
            }

            if (p >= 1.0) {
                this.scene = 'SCENE_5_STANDOFF_FISTBUMP';
                this.sceneTime = 0;
            }
        }
        // ----------------------------------------------------
        // SCENE 5: Chibi Standoff & Playful Superhero Fist Bump
        // ----------------------------------------------------
        else if (this.scene === 'SCENE_5_STANDOFF_FISTBUMP') {
            const duration = 4.0;
            const p = Math.min(1, this.sceneTime / duration);

            if (p < 0.5) {
                // Both walk slowly toward each other into center stage
                this.spidey.x = 220 + p * 340;
                this.spidey.y = groundY + Math.sin(this.sceneTime * 6) * 4;
                this.spidey.rot = 0;
                this.spidey.flipX = true;
                this.spidey.pose = 'WALK';
                this.spidey.emotion = 'happy';

                this.venom.x = 580 - p * 340;
                this.venom.y = groundY + Math.sin(this.sceneTime * 6) * 4;
                this.venom.rot = 0;
                this.venom.flipX = false;
                this.venom.pose = 'WALK';
                this.venom.mouthOpen = 0.3;
            } else {
                // Both reach out and do a Chibi Fist Bump in center (X = 400)!
                this.spidey.x = 430;
                this.spidey.y = groundY;
                this.spidey.flipX = true;
                this.spidey.pose = 'FIST_BUMP';

                this.venom.x = 370;
                this.venom.y = groundY;
                this.venom.flipX = false;
                this.venom.pose = 'FIST_BUMP';

                if (Math.abs(p - 0.6) < 0.04) {
                    this.spawnComicText('FIST BUMP! 🤛💥🤜', 400, 160, '#00f0ff');
                    this.spawnSparks(400, 230, 20, '#00f0ff');
                }
            }

            if (p >= 1.0) {
                this.scene = 'SCENE_1_CLAW_SWIPE';
                this.sceneTime = 0;
            }
        }
    }

    // --- DRAW CHIBI SPIDER-MAN (Direct 100% Vector Engine matching spider.html) ---

    drawChibiSpiderMan(x, y, scale, rot, flipX, pose, emotion) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        if (flipX) ctx.scale(-1, 1);
        ctx.scale(scale, scale);
        ctx.rotate(rot);
        ctx.translate(-250, -260); // Center at (250, 260)

        // Ground shadow
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(250, 480, 90, 14, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const redSuit = '#bd1219';
        const blueSuit = '#0b529d';
        const lineBlack = '#080808';

        ctx.lineWidth = 5.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // 1. LEGS
        ctx.save();
        ctx.fillStyle = blueSuit;
        ctx.strokeStyle = lineBlack;
        ctx.beginPath();
        ctx.moveTo(210, 360); ctx.quadraticCurveTo(185, 385, 185, 415); ctx.quadraticCurveTo(215, 435, 235, 390); ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(290, 360); ctx.quadraticCurveTo(315, 385, 315, 415); ctx.quadraticCurveTo(285, 435, 265, 390); ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = redSuit;
        ctx.beginPath();
        ctx.moveTo(185, 410); ctx.quadraticCurveTo(170, 440, 185, 465); ctx.quadraticCurveTo(220, 475, 225, 440); ctx.quadraticCurveTo(215, 415, 185, 410); ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(315, 410); ctx.quadraticCurveTo(330, 440, 315, 465); ctx.quadraticCurveTo(280, 475, 275, 440); ctx.quadraticCurveTo(285, 415, 315, 410); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.restore();

        // 2. TORSO & BLUE PANELS
        ctx.save();
        ctx.fillStyle = redSuit;
        ctx.strokeStyle = lineBlack;
        ctx.beginPath();
        ctx.moveTo(200, 265); ctx.lineTo(300, 265); ctx.quadraticCurveTo(315, 310, 295, 370); ctx.lineTo(205, 370); ctx.quadraticCurveTo(185, 310, 200, 265); ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = blueSuit;
        ctx.beginPath();
        ctx.moveTo(197, 280); ctx.quadraticCurveTo(220, 310, 215, 368); ctx.lineTo(204, 368); ctx.quadraticCurveTo(188, 320, 197, 280); ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(303, 280); ctx.quadraticCurveTo(280, 310, 285, 368); ctx.lineTo(296, 368); ctx.quadraticCurveTo(312, 320, 303, 280); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.restore();

        // 3. ARMS (Pose specific angles)
        ctx.save();
        ctx.fillStyle = redSuit;
        ctx.strokeStyle = lineBlack;

        if (pose === 'THWIP' || pose === 'SLING_PULL') {
            // Extended arm forward
            ctx.beginPath();
            ctx.moveTo(195, 275); ctx.quadraticCurveTo(130, 270, 90, 290); ctx.quadraticCurveTo(80, 305, 95, 315); ctx.quadraticCurveTo(110, 320, 120, 305); ctx.quadraticCurveTo(145, 295, 195, 310); ctx.closePath();
            ctx.fill(); ctx.stroke();
        } else if (pose === 'FIST_BUMP') {
            // Fist bump forward arm
            ctx.beginPath();
            ctx.moveTo(195, 275); ctx.quadraticCurveTo(130, 275, 85, 285); ctx.quadraticCurveTo(75, 300, 90, 310); ctx.quadraticCurveTo(105, 315, 115, 300); ctx.quadraticCurveTo(145, 295, 195, 310); ctx.closePath();
            ctx.fill(); ctx.stroke();
        } else {
            // Default Spidey Arms
            ctx.beginPath();
            ctx.moveTo(195, 275); ctx.quadraticCurveTo(140, 290, 105, 330); ctx.quadraticCurveTo(95, 345, 110, 355); ctx.quadraticCurveTo(125, 360, 135, 345); ctx.quadraticCurveTo(155, 320, 195, 310); ctx.closePath();
            ctx.fill(); ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(305, 275); ctx.quadraticCurveTo(360, 290, 395, 330); ctx.quadraticCurveTo(405, 345, 390, 355); ctx.quadraticCurveTo(375, 360, 365, 345); ctx.quadraticCurveTo(345, 320, 305, 310); ctx.closePath();
            ctx.fill(); ctx.stroke();
        }
        ctx.restore();

        // 4. WEBS & EMBLEM
        ctx.save();
        ctx.strokeStyle = '#080808';
        ctx.lineWidth = 2.2;

        for (let x = -35; x <= 35; x += 17.5) {
            ctx.beginPath(); ctx.moveTo(250 + x * 0.6, 265); ctx.lineTo(250 + x * 1.1, 370); ctx.stroke();
        }
        for (let y = 285; y <= 355; y += 18) {
            ctx.beginPath(); ctx.moveTo(202, y); ctx.quadraticCurveTo(250, y + 8, 298, y); ctx.stroke();
        }

        ctx.fillStyle = '#080808';
        ctx.beginPath();
        ctx.ellipse(250, 310, 4.5, 6.5, 0, 0, Math.PI * 2);
        ctx.ellipse(250, 321, 6, 8.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 2.8; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(248, 310); ctx.quadraticCurveTo(230, 290, 222, 298);
        ctx.moveTo(248, 312); ctx.quadraticCurveTo(232, 298, 226, 312);
        ctx.moveTo(252, 310); ctx.quadraticCurveTo(270, 290, 278, 298);
        ctx.moveTo(252, 312); ctx.quadraticCurveTo(268, 298, 274, 312);
        ctx.moveTo(248, 318); ctx.quadraticCurveTo(230, 330, 224, 342);
        ctx.moveTo(248, 322); ctx.quadraticCurveTo(234, 338, 230, 350);
        ctx.moveTo(252, 318); ctx.quadraticCurveTo(270, 330, 276, 342);
        ctx.moveTo(252, 322); ctx.quadraticCurveTo(266, 338, 270, 350);
        ctx.stroke();
        ctx.restore();

        // 5. HEAD & MASK WEBS
        const cx = 250, cy = 160, rx = 145, ry = 135;
        ctx.save();
        ctx.fillStyle = '#bd1219';
        ctx.strokeStyle = '#080808';
        ctx.lineWidth = 6.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        ctx.strokeStyle = '#080808'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
        const originX = cx, originY = cy + 20;
        const rayAngles = [
            -Math.PI / 2, -Math.PI / 2.6, -Math.PI / 3.4, -Math.PI / 4.8,
            -Math.PI / 8, 0, Math.PI / 8, Math.PI / 4.8,
            Math.PI / 3.4, Math.PI / 2.6, Math.PI / 2,
            Math.PI - Math.PI / 2.6, Math.PI - Math.PI / 3.4,
            Math.PI + Math.PI / 4.8, Math.PI + Math.PI / 3.4, Math.PI + Math.PI / 2.6
        ];
        rayAngles.forEach(angle => {
            ctx.beginPath(); ctx.moveTo(originX, originY);
            ctx.lineTo(cx + Math.cos(angle) * (rx + 5), cy + Math.sin(angle) * (ry + 5));
            ctx.stroke();
        });

        const rings = [30, 55, 82, 110, 132];
        rings.forEach(r => {
            ctx.beginPath();
            for (let a = 0; a <= Math.PI * 2; a += 0.2) {
                const wx = originX + Math.cos(a) * r * 1.05;
                const wy = originY + Math.sin(a) * r * 0.95;
                if (a === 0) ctx.moveTo(wx, wy); else ctx.lineTo(wx, wy);
            }
            ctx.closePath(); ctx.stroke();
        });
        ctx.restore();

        // 6. EYES
        this.drawSpideyEyes(182, 175, true, emotion);
        this.drawSpideyEyes(318, 175, false, emotion);

        ctx.restore();
    }

    drawSpideyEyes(x, y, isLeft, emotion = 'happy') {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);

        const dir = isLeft ? 1 : -1;
        ctx.scale(dir, 1);

        const morphs = {
            neutral: { innerTopY: -45, outerTopY: 5, innerBotY: 15, outerBotY: -35, tilt: 0 },
            angry: { innerTopY: 5, outerTopY: 10, innerBotY: 30, outerBotY: -40, tilt: 0.15 },
            happy: { innerTopY: -10, outerTopY: -25, innerBotY: -35, outerBotY: -30, tilt: 0 }
        };

        const m = morphs[emotion] || morphs.happy;
        ctx.rotate(m.tilt);

        const pInnerTop = { x: 52, y: m.innerTopY };
        const pOuterTop = { x: -50, y: m.outerTopY };
        const pOuterBot = { x: -48, y: m.outerBotY };
        const pInnerBot = { x: 30, y: m.innerBotY + 50 };

        ctx.fillStyle = '#080808';
        ctx.beginPath();
        ctx.moveTo(pInnerTop.x + 8, pInnerTop.y - 8);
        ctx.quadraticCurveTo(0, pOuterTop.y - 20, pOuterTop.x - 12, pOuterTop.y);
        ctx.quadraticCurveTo(pOuterTop.x - 20, 10, pOuterBot.x - 10, pOuterBot.y + 20);
        ctx.quadraticCurveTo(-10, pInnerBot.y + 20, pInnerBot.x + 10, pInnerBot.y);
        ctx.quadraticCurveTo(pInnerTop.x + 20, 20, pInnerTop.x + 8, pInnerTop.y - 8);
        ctx.closePath(); ctx.fill();

        const lensGrad = ctx.createLinearGradient(-30, -40, 20, 40);
        lensGrad.addColorStop(0, '#ffffff');
        lensGrad.addColorStop(0.7, '#f1f5f9');
        lensGrad.addColorStop(1, '#cbd5e1');

        ctx.fillStyle = lensGrad;
        ctx.beginPath();
        ctx.moveTo(pInnerTop.x, pInnerTop.y);
        ctx.quadraticCurveTo(0, pOuterTop.y - 6, pOuterTop.x, pOuterTop.y);
        ctx.quadraticCurveTo(pOuterTop.x - 6, 10, pOuterBot.x, pOuterBot.y);
        ctx.quadraticCurveTo(-5, pInnerBot.y + 6, pInnerBot.x, pInnerBot.y);
        ctx.quadraticCurveTo(pInnerTop.x + 6, 10, pInnerTop.x, pInnerTop.y);
        ctx.closePath(); ctx.fill();

        ctx.restore();
    }

    // --- DRAW CHIBI VENOM (Exact Matching Vector Quality) ---

    drawChibiVenom(x, y, scale, rot, flipX, pose, mouthOpen = 0.5, shieldActive = false) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        if (flipX) ctx.scale(-1, 1);
        ctx.scale(scale, scale);
        ctx.rotate(rot);
        ctx.translate(-250, -260);

        // Ground shadow
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(250, 480, 95, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        const venomBlack = '#0b0c10';
        const lineBlack = '#000000';

        ctx.lineWidth = 6.0;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // 1. SYMBIOTE WRITHING TENDRILS (BACK)
        ctx.save();
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 6.0;
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i + Math.sin(this.animTime * 4 + i) * 0.35;
            const tx = 250 + Math.cos(angle) * 165;
            const ty = 260 + Math.sin(angle) * 165;
            ctx.beginPath();
            ctx.moveTo(250, 280);
            ctx.quadraticCurveTo(250 + Math.cos(angle) * 90, 260 + Math.sin(angle) * 90, tx, ty);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(tx, ty, 6.5, 0, Math.PI * 2);
            ctx.fillStyle = '#4c1d95';
            ctx.fill();
        }
        ctx.restore();

        // 2. VENOM LEGS & BOOTS
        ctx.save();
        ctx.fillStyle = venomBlack;
        ctx.strokeStyle = lineBlack;
        ctx.beginPath();
        ctx.moveTo(205, 360); ctx.quadraticCurveTo(175, 385, 175, 420); ctx.quadraticCurveTo(215, 440, 235, 390); ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(295, 360); ctx.quadraticCurveTo(325, 385, 325, 420); ctx.quadraticCurveTo(285, 440, 265, 390); ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(175, 415); ctx.quadraticCurveTo(160, 445, 175, 470); ctx.quadraticCurveTo(220, 480, 225, 445); ctx.quadraticCurveTo(215, 415, 175, 415); ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(325, 415); ctx.quadraticCurveTo(340, 445, 325, 470); ctx.quadraticCurveTo(280, 480, 275, 445); ctx.quadraticCurveTo(285, 415, 325, 415); ctx.closePath();
        ctx.fill(); ctx.stroke();
        ctx.restore();

        // 3. VENOM TORSO & ARMS (Pose specific)
        ctx.save();
        ctx.fillStyle = venomBlack;
        ctx.strokeStyle = lineBlack;
        ctx.beginPath();
        ctx.moveTo(195, 265); ctx.lineTo(305, 265); ctx.quadraticCurveTo(320, 310, 298, 375); ctx.lineTo(202, 375); ctx.quadraticCurveTo(180, 310, 195, 265); ctx.closePath();
        ctx.fill(); ctx.stroke();

        if (pose === 'SWIPE' || pose === 'JAB_LEFT') {
            // Forward claw swipe arm
            ctx.beginPath();
            ctx.moveTo(190, 275); ctx.quadraticCurveTo(120, 260, 80, 280); ctx.quadraticCurveTo(70, 295, 85, 310); ctx.quadraticCurveTo(100, 315, 115, 295); ctx.quadraticCurveTo(145, 290, 190, 310); ctx.closePath();
            ctx.fill(); ctx.stroke();
        } else if (pose === 'FIST_BUMP') {
            // Forward fist bump arm
            ctx.beginPath();
            ctx.moveTo(190, 275); ctx.quadraticCurveTo(125, 275, 80, 285); ctx.quadraticCurveTo(70, 300, 85, 310); ctx.quadraticCurveTo(100, 315, 110, 300); ctx.quadraticCurveTo(145, 295, 190, 310); ctx.closePath();
            ctx.fill(); ctx.stroke();
        } else {
            // Default Muscular Arms
            ctx.beginPath();
            ctx.moveTo(190, 275); ctx.quadraticCurveTo(130, 290, 95, 335); ctx.quadraticCurveTo(85, 350, 100, 360); ctx.quadraticCurveTo(120, 365, 130, 350); ctx.quadraticCurveTo(150, 320, 190, 310); ctx.closePath();
            ctx.fill(); ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(310, 275); ctx.quadraticCurveTo(370, 290, 405, 335); ctx.quadraticCurveTo(415, 350, 400, 360); ctx.quadraticCurveTo(380, 365, 370, 350); ctx.quadraticCurveTo(350, 320, 310, 310); ctx.closePath();
            ctx.fill(); ctx.stroke();
        }
        ctx.restore();

        // 4. ICONIC VENOM WHITE SPIDER CHEST EMBLEM
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.ellipse(250, 315, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 4.5;
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(245, 310); ctx.quadraticCurveTo(215, 275, 195, 270);
        ctx.moveTo(245, 315); ctx.quadraticCurveTo(210, 295, 190, 290);
        ctx.moveTo(255, 310); ctx.quadraticCurveTo(285, 275, 305, 270);
        ctx.moveTo(255, 315); ctx.quadraticCurveTo(290, 295, 310, 290);

        ctx.moveTo(245, 320); ctx.quadraticCurveTo(215, 345, 200, 365);
        ctx.moveTo(245, 325); ctx.quadraticCurveTo(220, 355, 210, 370);
        ctx.moveTo(255, 320); ctx.quadraticCurveTo(285, 345, 300, 365);
        ctx.moveTo(255, 325); ctx.quadraticCurveTo(280, 355, 290, 370);
        ctx.stroke();
        ctx.restore();

        // 5. VENOM HEAD
        const cx = 250, cy = 160, rx = 152, ry = 140;
        ctx.save();
        ctx.fillStyle = venomBlack;
        ctx.strokeStyle = lineBlack;
        ctx.lineWidth = 7.0;

        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        const headGlow = ctx.createRadialGradient(cx - 30, cy - 40, 10, cx, cy, rx);
        headGlow.addColorStop(0, 'rgba(126, 34, 206, 0.35)');
        headGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = headGlow;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx - 4, ry - 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 6. ROARING MOUTH, TEETH & TONGUE
        ctx.save();
        const mouthHeight = 35 * mouthOpen;
        ctx.fillStyle = '#450a0a';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(180, 195);
        ctx.quadraticCurveTo(250, 195 + mouthHeight, 320, 195);
        ctx.quadraticCurveTo(250, 195 - mouthHeight * 0.4, 180, 195);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        const tongueWobble = Math.sin(this.animTime * 6) * 10;
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.moveTo(225, 190);
        ctx.quadraticCurveTo(250 + tongueWobble, 195 + mouthHeight * 0.6, 275, 190);
        ctx.quadraticCurveTo(250, 180, 225, 190);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 9; i++) {
            const tx = 190 + i * 14;
            ctx.beginPath();
            ctx.moveTo(tx, 180); ctx.lineTo(tx + 5, 180 + mouthHeight * 0.35); ctx.lineTo(tx + 10, 180);
            ctx.closePath(); ctx.fill();

            ctx.beginPath();
            ctx.moveTo(tx, 200 + mouthHeight * 0.2); ctx.lineTo(tx + 5, 195); ctx.lineTo(tx + 10, 200 + mouthHeight * 0.2);
            ctx.closePath(); ctx.fill();
        }
        ctx.restore();

        // 7. JAGGED MENACING EYES
        this.drawVenomEye(180, 135, true);
        this.drawVenomEye(320, 135, false);

        // 8. SYMBIOTE SHIELD (When blocking!)
        if (shieldActive) {
            ctx.save();
            ctx.fillStyle = 'rgba(76, 29, 149, 0.85)';
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 5.0;
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#a855f7';

            ctx.beginPath();
            ctx.ellipse(360, 260, 45, 130, 0, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();

            // Symbiote spikes on shield
            for (let i = -4; i <= 4; i++) {
                ctx.beginPath();
                ctx.moveTo(390, 260 + i * 25);
                ctx.lineTo(430, 260 + i * 28);
                ctx.lineTo(395, 260 + i * 25 + 10);
                ctx.fillStyle = '#1e1b4b';
                ctx.fill();
            }
            ctx.restore();
        }

        ctx.restore();
    }

    drawVenomEye(x, y, isLeft) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);

        const dir = isLeft ? 1 : -1;
        ctx.scale(dir, 1);

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2.0;

        ctx.beginPath();
        ctx.moveTo(60, -45);
        ctx.quadraticCurveTo(10, -55, -55, -15);
        ctx.quadraticCurveTo(-65, 15, -40, 45);
        ctx.quadraticCurveTo(0, 55, 35, 15);
        ctx.quadraticCurveTo(65, 0, 60, -45);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.restore();
    }

    // --- DRAW PARTICLES & COMIC TEXTS ---

    updateAndDrawParticles() {
        const ctx = this.ctx;

        // Render Web Lines
        for (let i = this.webLines.length - 1; i >= 0; i--) {
            const w = this.webLines[i];
            w.life -= 0.04;
            if (w.life <= 0) {
                this.webLines.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.strokeStyle = `rgba(255, 255, 255, ${w.life})`;
            ctx.lineWidth = 4.0;
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#ffffff';

            ctx.beginPath();
            ctx.moveTo(w.startX, w.startY);
            ctx.lineTo(w.targetX, w.targetY);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(w.targetX, w.targetY, 5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${w.life})`;
            ctx.fill();
            ctx.restore();
        }

        // Render Sparks
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const s = this.sparks[i];
            s.x += s.vx;
            s.y += s.vy;
            s.alpha -= 0.04;

            if (s.alpha <= 0) {
                this.sparks.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = s.color;
            ctx.globalAlpha = s.alpha;
            ctx.shadowBlur = 10;
            ctx.shadowColor = s.color;
            ctx.fill();
            ctx.restore();
        }

        // Render Comic Text Badges
        for (let i = this.comicTexts.length - 1; i >= 0; i--) {
            const t = this.comicTexts[i];
            t.scale += (t.targetScale - t.scale) * 0.2;
            t.alpha -= 0.02;

            if (t.alpha <= 0) {
                this.comicTexts.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.translate(t.x, t.y);
            ctx.rotate(t.rotation);
            ctx.scale(t.scale, t.scale);

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

            ctx.fillStyle = '#ffffff';
            ctx.font = '900 22px "Space Grotesk", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ffffff';
            ctx.globalAlpha = Math.max(0, t.alpha);
            ctx.fillText(t.text, 0, 0);

            ctx.restore();
        }
    }

    animate() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.width, this.height);
        this.animTime += 0.04;

        this.updateCombatStateMachine();

        // Fit virtual 800x500 stage onto canvas
        const scale = Math.min(this.width / this.virtualWidth, this.height / this.virtualHeight) * 0.95;
        const offsetX = (this.width - this.virtualWidth * scale) / 2;
        const offsetY = (this.height - this.virtualHeight * scale) / 2;

        ctx.save();
        ctx.translate(offsetX, offsetY);
        ctx.scale(scale, scale);

        // Render Particles, Lines & Badges
        this.updateAndDrawParticles();

        // Render Both Independent Character Agents
        this.drawChibiSpiderMan(
            this.spidey.x,
            this.spidey.y,
            this.spidey.scale,
            this.spidey.rot,
            this.spidey.flipX,
            this.spidey.pose,
            this.spidey.emotion
        );

        this.drawChibiVenom(
            this.venom.x,
            this.venom.y,
            this.venom.scale,
            this.venom.rot,
            this.venom.flipX,
            this.venom.pose,
            this.venom.mouthOpen,
            this.venom.shieldActive
        );

        ctx.restore();

        this.animFrameId = requestAnimationFrame(this.animate);
    }
}

window.SpiderChaseCharacter = SpiderChaseCharacter;
