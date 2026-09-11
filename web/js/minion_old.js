/**
 * Amazing Desktop Mac - Minion Lunar Moon Squad AI Character Renderer 🍌🌕
 * Draws an interactive Lunar Space Environment with a funny Minion Squad (Kevin, Stuart, Bob) on HTML5 Canvas.
 * Features:
 *  - Full Lunar Surface with Craters, Glowing Blue Earth 🌍, Twinkling Stars & Floating Zero-G Bananas 🍌
 *  - Signature Minion Laughing & Teeth Grinning Expressions ("Bello!") with squinting joyful eyes
 *  - Clearly visible denim legs & glossy 3D black boots with stepping/dancing walking animations
 *  - Main Speaker: KEVIN (Two-Eye, Tall Leader, lip-syncs to AI voice & audio amplitude, waves hands)
 *  - Left Companion: STUART (One-Eye, floating in zero-G with Banana 🍌 & Ukulele 🎸, cheeky wink)
 *  - Right Companion: BOB (Short, Heterochromia Brown/Green eyes, hugging Teddy Bear Tim 🧸 & Flashing "BEE-DO" Red Siren 🚨)
 */

class MinionCharacter {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width = 650;
        this.height = this.canvas.height = 420;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        // State: 'IDLE' | 'LISTENING' | 'THINKING' | 'SPEAKING'
        this.state = 'IDLE';

        this.time = 0;
        this.audioAmplitude = 0;
        this.blinkTimer = 0;
        this.isBlinking = false;
        this.sirenFlash = 0;
        this.laughTimer = 0; // Triggered on click for hilarious laughing spree

        // Mouse tracking for interactive eye look
        this.mousePos = { x: this.centerX, y: this.centerY };
        this.onMouseMove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = e.clientX - rect.left;
            this.mousePos.y = e.clientY - rect.top;
        };
        window.addEventListener('mousemove', this.onMouseMove);

        // Click easter egg reaction
        this.onClick = () => {
            this.triggerEasterEgg();
        };
        this.canvas.addEventListener('click', this.onClick);

        // Stars array in lunar space sky
        this.stars = [];
        for (let i = 0; i < 55; i++) {
            this.stars.push({
                x: Math.random() * this.width,
                y: Math.random() * 260,
                size: Math.random() * 2.2 + 0.8,
                alpha: Math.random() * 0.8 + 0.2,
                speed: Math.random() * 0.03 + 0.01
            });
        }

        // Floating bananas in zero-gravity space
        this.floatingBananas = [
            { x: 65, y: 75, rot: 0.25, speedY: 0.02, floatAmp: 14 },
            { x: 580, y: 95, rot: -0.35, speedY: 0.025, floatAmp: 18 },
            { x: 325, y: 35, rot: 0.7, speedY: 0.018, floatAmp: 10 }
        ];

        this.animate = this.animate.bind(this);
        this.animFrameId = requestAnimationFrame(this.animate);
    }

    setState(newState) {
        this.state = newState;
        if (newState === 'SPEAKING') {
            this.laughTimer = 0;
        }
    }

    setAudioAmplitude(amp) {
        this.audioAmplitude = amp;
    }

    triggerEasterEgg() {
        this.sirenFlash = 2.5; // Flash Bob's BEE-DO siren!
        this.laughTimer = 3.0; // Trigger 3-second hilarious laughter spree
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

    animate() {
        this.time += 0.04;
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Blink calculation
        this.blinkTimer += 0.03;
        if (this.blinkTimer > 2.6) {
            this.isBlinking = true;
            if (this.blinkTimer > 2.85) {
                this.isBlinking = false;
                this.blinkTimer = 0;
            }
        }

        if (this.sirenFlash > 0) {
            this.sirenFlash -= 0.02;
        }

        if (this.laughTimer > 0) {
            this.laughTimer -= 0.02;
        }

        // 🌟 0. Render Lunar Moon Surface & Deep Space Background
        this.drawLunarEnvironment();

        // 🎸 1. Render Left Companion Minion: STUART (One-Eye, Banana & Ukulele Float)
        this.drawStuartMinion(140, 230);

        // 🧸 2. Render Right Companion Minion: BOB (Heterochromia Eyes, Teddy Bear Tim & Siren)
        this.drawBobMinion(510, 240);

        // 🍌 3. Render Main Center Minion: KEVIN (Two-Eye, AI Companion Speaker)
        this.drawKevinMainMinion(325, 210);

        this.animFrameId = requestAnimationFrame(this.animate);
    }

    // =========================================================================
    // 🌌 1. LUNAR MOON & SPACE ENVIRONMENT RENDERER
    // =========================================================================
    drawLunarEnvironment() {
        const ctx = this.ctx;
        ctx.save();

        // Deep Space Background Gradient
        const spaceGrad = ctx.createLinearGradient(0, 0, 0, this.height);
        spaceGrad.addColorStop(0, '#04060F');
        spaceGrad.addColorStop(0.55, '#0C1225');
        spaceGrad.addColorStop(1, '#161D33');
        ctx.fillStyle = spaceGrad;
        ctx.fillRect(0, 0, this.width, this.height);

        // Twinkling Stars
        this.stars.forEach(star => {
            star.alpha += Math.sin(this.time * star.speed * 10) * 0.018;
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = Math.max(0.15, Math.min(0.95, star.alpha));
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        // Glowing Blue Earth Planet in Upper Sky 🌍
        const earthX = 540;
        const earthY = 65;
        const earthR = 36;

        ctx.save();
        ctx.beginPath();
        ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
        const earthGrad = ctx.createRadialGradient(earthX - 10, earthY - 10, 5, earthX, earthY, earthR);
        earthGrad.addColorStop(0, '#86E0FF');
        earthGrad.addColorStop(0.35, '#1E6CE8');
        earthGrad.addColorStop(0.75, '#0B3390');
        earthGrad.addColorStop(1, '#051446');
        ctx.fillStyle = earthGrad;
        ctx.shadowBlur = 25;
        ctx.shadowColor = 'rgba(0, 240, 255, 0.55)';
        ctx.fill();

        // Earth Continents / Clouds Sheen
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(earthX - 10, earthY - 8, 15, 8, 0.4, 0, Math.PI * 2);
        ctx.ellipse(earthX + 12, earthY + 10, 14, 7, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Floating Zero-Gravity Bananas 🍌
        this.floatingBananas.forEach(b => {
            const floatY = b.y + Math.sin(this.time * 2 + b.x) * b.floatAmp;
            this.drawBanana(b.x, floatY, 0.75, b.rot + Math.sin(this.time * 1.2) * 0.12);
        });

        // Lunar Moon Surface Ground Curve & Craters
        const moonGroundY = 325;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(this.centerX, moonGroundY + 140, 440, 170, 0, 0, Math.PI * 2);
        const moonGrad = ctx.createLinearGradient(0, moonGroundY - 20, 0, this.height);
        moonGrad.addColorStop(0, '#60677D');
        moonGrad.addColorStop(0.35, '#42475A');
        moonGrad.addColorStop(1, '#242735');
        ctx.fillStyle = moonGrad;
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
        ctx.fill();

        // Lunar Craters (Hố Mặt trăng)
        const craters = [
            { x: 95, y: 350, rx: 30, ry: 11 },
            { x: 250, y: 372, rx: 48, ry: 16 },
            { x: 445, y: 362, rx: 38, ry: 13 },
            { x: 585, y: 345, rx: 26, ry: 9 }
        ];

        craters.forEach(c => {
            ctx.beginPath();
            ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#2D3040';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        ctx.restore();
    }

    drawBanana(bx, by, scale, rot) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(rot);
        ctx.scale(scale, scale);

        // Yellow Banana Body Curve
        ctx.beginPath();
        ctx.moveTo(-18, -12);
        ctx.quadraticCurveTo(0, 20, 24, -6);
        ctx.quadraticCurveTo(2, 6, -18, -12);
        ctx.fillStyle = '#FFE11A';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(254, 225, 26, 0.5)';
        ctx.fill();

        // Green Stem tip
        ctx.fillStyle = '#78B800';
        ctx.fillRect(-21, -14, 5, 4);

        ctx.restore();
    }

    // =========================================================================
    // 🍌 2. CENTER MAIN MINION: KEVIN (Two Eyes, Tall AI Companion Speaker)
    // =========================================================================
    drawKevinMainMinion(cx, cy) {
        const ctx = this.ctx;
        const isLaughing = this.laughTimer > 0;

        let bodyOffsetY = Math.sin(this.time * 2.2) * 5;
        let headTilt = Math.sin(this.time * 1.5) * 0.05;
        let legStep = Math.sin(this.time * 4) * 5;

        if (isLaughing) {
            bodyOffsetY += Math.abs(Math.sin(this.time * 14)) * 14;
            headTilt = Math.sin(this.time * 12) * 0.15;
            legStep = Math.sin(this.time * 14) * 9;
        } else if (this.state === 'SPEAKING') {
            bodyOffsetY += Math.abs(Math.sin(this.time * 9)) * (10 + this.audioAmplitude * 22);
            headTilt = Math.sin(this.time * 7) * 0.12;
            legStep = Math.sin(this.time * 10) * 8;
        } else if (this.state === 'THINKING') {
            headTilt = -0.16;
            bodyOffsetY += Math.sin(this.time * 3) * 3;
        } else if (this.state === 'LISTENING') {
            headTilt = 0.14;
            bodyOffsetY += Math.sin(this.time * 5) * 6;
        }

        const renderX = cx;
        const renderY = cy + bodyOffsetY;

        ctx.save();
        ctx.translate(renderX, renderY);
        ctx.rotate(headTilt);

        // Ground Shadow
        this.drawShadow(0, 128 - bodyOffsetY * 0.4);

        // CLEARLY VISIBLE DEMIN LEGS & GLOSSY BOOTS
        this.drawLegsAndBoots(0, 78, legStep);

        // Arms & Gloves
        this.drawKevinArms(0, 10, isLaughing);

        // Body Pill (Yellow Capsule)
        this.drawMinionPillBody(0, 0, 130, 205, '#FEE11A');

        // Denim Overalls & Gru Logo
        this.drawOveralls(0, 28, 130);

        // Cute Rosy Cheeks
        this.drawRosyCheeks(0, 5);

        // Metallic Twin Goggles
        this.drawTwinGoggles(0, -42, 32, 25);

        // Eyes (Squinting happily when laughing/smiling!)
        const look = this.getEyeLookOffset(cx, cy - 42);
        this.drawKevinEyes(0, -42, 24, 25, look, isLaughing);

        // Iconic Minion Smile & Teeth Mouth Expression
        this.drawKevinMouth(0, 12, isLaughing);

        // Hair Strands (Swaying dynamically)
        this.drawHair(0, -114);

        ctx.restore();
    }

    // =========================================================================
    // 🎸 3. LEFT COMPANION MINION: STUART (One Eye, Floating with Banana & Ukulele)
    // =========================================================================
    drawStuartMinion(cx, cy) {
        const ctx = this.ctx;
        const isLaughing = this.laughTimer > 0;

        // Zero-Gravity floating motion
        const floatY = cy + Math.sin(this.time * 1.8 + 1) * 10;
        const tilt = Math.sin(this.time * 1.2) * 0.09 - 0.06;
        const legStep = Math.sin(this.time * 3.5) * 4;

        ctx.save();
        ctx.translate(cx, floatY);
        ctx.rotate(tilt);

        // Shadow
        this.drawShadow(0, 110);

        // Visible Legs & Boots
        this.drawLegsAndBoots(0, 68, legStep);

        // Arms holding Mini Ukulele 🎸 & Banana 🍌
        // Right Arm holding Ukulele neck
        ctx.save();
        ctx.translate(36, 12);
        ctx.rotate(-0.75 + Math.sin(this.time * 3) * 0.1);
        ctx.fillStyle = '#F5C800';
        ctx.fillRect(-6, 0, 12, 36);
        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.arc(0, 38, 9, 0, Math.PI * 2);
        ctx.fill();

        // Mini Wooden Ukulele Body
        ctx.translate(14, 20);
        ctx.rotate(0.6);
        ctx.fillStyle = '#A0522D';
        ctx.beginPath();
        ctx.ellipse(0, 0, 14, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#D2B48C';
        ctx.beginPath();
        ctx.arc(0, -2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.arc(0, -2, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Left Arm holding Banana
        ctx.save();
        ctx.translate(-36, 12);
        ctx.rotate(0.55);
        ctx.fillStyle = '#F5C800';
        ctx.fillRect(-6, 0, 12, 36);
        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.arc(0, 38, 9, 0, Math.PI * 2);
        ctx.fill();
        this.drawBanana(-10, 24, 0.7, -0.4);
        ctx.restore();

        // Body Pill (Slightly shorter)
        this.drawMinionPillBody(0, 0, 112, 178, '#FEE11A');

        // Overalls
        this.drawOveralls(0, 22, 112);

        // Single Large Metallic Goggle Frame
        ctx.save();
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(-56, -42, 112, 24);

        const goggleR = 34;
        const metalGrad = ctx.createLinearGradient(-30, -60, 30, -20);
        metalGrad.addColorStop(0, '#FFFFFF');
        metalGrad.addColorStop(0.3, '#CCCCCC');
        metalGrad.addColorStop(0.7, '#777777');
        metalGrad.addColorStop(1, '#333333');

        ctx.beginPath();
        ctx.arc(0, -30, goggleR, 0, Math.PI * 2);
        ctx.fillStyle = metalGrad;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#333';
        ctx.stroke();

        // Single Eye Eyeball & Cheeky Wink!
        const eyeR = 25;
        ctx.beginPath();
        ctx.arc(0, -30, eyeR, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();

        if (this.isBlinking || isLaughing) {
            ctx.beginPath();
            ctx.arc(0, -30, eyeR, 0, Math.PI * 2);
            ctx.fillStyle = '#FEE11A';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, -30, eyeR - 2, 0.1, Math.PI - 0.1);
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#3E2700';
            ctx.stroke();
        } else {
            const look = this.getEyeLookOffset(cx, floatY - 30);
            const pupilX = look.x * 0.8;
            const pupilY = -30 + look.y * 0.8;

            ctx.beginPath();
            ctx.arc(pupilX, pupilY, 11, 0, Math.PI * 2);
            ctx.fillStyle = '#A0522D';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(pupilX, pupilY, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(pupilX - 3, pupilY - 3, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
        }
        ctx.restore();

        // Stuart Mouth (Cheeky Smile with Tongue sticking out!)
        ctx.beginPath();
        ctx.arc(0, 10, 15, 0.15, Math.PI - 0.15);
        ctx.lineWidth = 3.8;
        ctx.strokeStyle = '#3E2700';
        ctx.lineCap = 'round';
        ctx.stroke();

        // White Tooth & Tongue
        ctx.fillStyle = '#FFF';
        ctx.fillRect(-8, 9, 16, 4);
        ctx.beginPath();
        ctx.ellipse(3, 19, 6, 4, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FF5588';
        ctx.fill();

        // Center Combed Hair
        ctx.beginPath();
        ctx.moveTo(-14, -92);
        ctx.quadraticCurveTo(0, -102, 14, -92);
        ctx.strokeStyle = '#1A1A1A';
        ctx.lineWidth = 2.8;
        ctx.stroke();

        ctx.restore();
    }

    // =========================================================================
    // 🧸 4. RIGHT COMPANION MINION: BOB (Short, Heterochromia, Teddy Bear & Siren 🚨)
    // =========================================================================
    drawBobMinion(cx, cy) {
        const ctx = this.ctx;
        const isLaughing = this.laughTimer > 0;

        const bobFloatY = cy + Math.sin(this.time * 2.5 + 2) * 7;
        const tilt = Math.sin(this.time * 1.8) * 0.07;
        const legStep = Math.sin(this.time * 5) * 5;

        ctx.save();
        ctx.translate(cx, bobFloatY);
        ctx.rotate(tilt);

        // Shadow
        this.drawShadow(0, 98);

        // Visible Short Legs & Boots
        this.drawLegsAndBoots(0, 60, legStep);

        // Body Pill (Short & Round Bob Body)
        this.drawMinionPillBody(0, 0, 120, 154, '#FEE11A');

        // Overalls
        this.drawOveralls(0, 18, 120);

        // --- Flashing Siren Light on Top of Bob's Head (BEE-DO BEE-DO 🚨) ---
        const isSirenOn = (this.state === 'THINKING' || this.state === 'LISTENING' || this.sirenFlash > 0 || isLaughing);
        const sirenAlpha = isSirenOn ? (0.65 + Math.abs(Math.sin(this.time * 14)) * 0.35) : 0.25;

        ctx.save();
        ctx.fillStyle = `rgba(255, 30, 30, ${sirenAlpha})`;
        ctx.shadowBlur = isSirenOn ? 30 : 0;
        ctx.shadowColor = '#FF0000';
        ctx.beginPath();
        ctx.arc(0, -84, 13, Math.PI, 0, false);
        ctx.fill();
        ctx.fillStyle = '#333333';
        ctx.fillRect(-11, -76, 22, 6);
        ctx.restore();

        // Goggles
        this.drawTwinGoggles(0, -32, 29, 23);

        // Bob's Iconic Heterochromia Eyes (Left Brown, Right Emerald Green!)
        const look = this.getEyeLookOffset(cx, bobFloatY - 32);
        this.drawBobEyes(0, -32, 21, 23, look, isLaughing);

        // Hugging Teddy Bear Tim 🧸 in left arm
        this.drawTeddyBearTim(-40, 22);

        // Bob's Cute Excited Laughing Mouth
        ctx.beginPath();
        ctx.arc(0, 10, 14, 0.1, Math.PI - 0.1);
        ctx.lineWidth = 3.8;
        ctx.strokeStyle = '#3E2700';
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.fillStyle = '#FFF';
        ctx.fillRect(-6, 9, 12, 3.5);
        ctx.beginPath();
        ctx.ellipse(0, 17, 5, 3.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#FF5588';
        ctx.fill();

        ctx.restore();
    }

    drawTeddyBearTim(tx, ty) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(tx, ty);

        // Brown Teddy Bear Head
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#8B4513';
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.fill();

        // Bear Ears
        ctx.beginPath();
        ctx.arc(-11, -11, 5.5, 0, Math.PI * 2);
        ctx.arc(11, -11, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = '#8B4513';
        ctx.fill();

        // Bear Button Eyes (Classic Tim eyes)
        ctx.fillStyle = '#FFE11A';
        ctx.beginPath();
        ctx.arc(-5, -2, 3.5, 0, Math.PI * 2);
        ctx.arc(5, -2, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillRect(-6, -3, 2.5, 2.5);
        ctx.fillRect(4, -3, 2.5, 2.5);

        // Bear Snout
        ctx.fillStyle = '#D2B48C';
        ctx.beginPath();
        ctx.ellipse(0, 5, 6.5, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // =========================================================================
    // 🎨 DETAILED RENDER HELPERS FOR MINION LEGS, BOOTS & BODY
    // =========================================================================
    getEyeLookOffset(cx, cy) {
        const dx = (this.mousePos.x - cx) * 0.08;
        const dy = (this.mousePos.y - cy) * 0.08;
        return {
            x: Math.max(-12, Math.min(12, dx)),
            y: Math.max(-8, Math.min(8, dy))
        };
    }

    drawShadow(cx, cy) {
        const ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, cy, 68, 15, 0, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 68);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
    }

    /**
     * Renders CLEARLY VISIBLE Minion Denim Legs & 3D Glossy Boots 👞
     */
    drawLegsAndBoots(cx, cy, legStep) {
        const ctx = this.ctx;
        const legSpacing = 26;
        const legW = 20;
        const legH = 26;

        ctx.save();

        const denimGrad = ctx.createLinearGradient(-30, cy, 30, cy);
        denimGrad.addColorStop(0, '#2D5E99');
        denimGrad.addColorStop(0.5, '#1E4575');
        denimGrad.addColorStop(1, '#133054');

        // --- Left Leg & Glossy Leather Boot ---
        const leftLegY = cy + legStep;

        // Denim Trousers Leg
        ctx.beginPath();
        ctx.rect(cx - legSpacing - legW / 2, leftLegY, legW, legH);
        ctx.fillStyle = denimGrad;
        ctx.fill();
        ctx.strokeStyle = '#FEE11A'; // Yellow overall stitching line
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - legSpacing - legW / 2, leftLegY, legW, legH);

        // Denim Cuff Fold
        ctx.fillStyle = '#3E76BA';
        ctx.fillRect(cx - legSpacing - legW / 2 - 2, leftLegY + legH - 4, legW + 4, 5);

        // Left Boot (Glossy 3D Leather with Sole)
        const bootLeftX = cx - legSpacing - 4;
        const bootLeftY = leftLegY + legH + 4;

        // Boot Sole (Gray rubber base)
        ctx.beginPath();
        ctx.ellipse(bootLeftX, bootLeftY + 4, 16, 8, -0.12, 0, Math.PI * 2);
        ctx.fillStyle = '#444444';
        ctx.fill();

        // Boot Main Body
        ctx.beginPath();
        ctx.ellipse(bootLeftX, bootLeftY, 15, 10, -0.12, 0, Math.PI * 2);
        const bootGrad = ctx.createRadialGradient(bootLeftX - 4, bootLeftY - 4, 2, bootLeftX, bootLeftY, 15);
        bootGrad.addColorStop(0, '#555555');
        bootGrad.addColorStop(0.4, '#1A1A1A');
        bootGrad.addColorStop(1, '#050505');
        ctx.fillStyle = bootGrad;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.fill();

        // Boot Gloss Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.ellipse(bootLeftX - 4, bootLeftY - 3, 5, 2.5, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // --- Right Leg & Glossy Leather Boot ---
        const rightLegY = cy - legStep;

        // Denim Trousers Leg
        ctx.beginPath();
        ctx.rect(cx + legSpacing - legW / 2, rightLegY, legW, legH);
        ctx.fillStyle = denimGrad;
        ctx.fill();
        ctx.strokeStyle = '#FEE11A';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx + legSpacing - legW / 2, rightLegY, legW, legH);

        // Denim Cuff Fold
        ctx.fillStyle = '#3E76BA';
        ctx.fillRect(cx + legSpacing - legW / 2 - 2, rightLegY + legH - 4, legW + 4, 5);

        // Right Boot (Glossy 3D Leather with Sole)
        const bootRightX = cx + legSpacing + 4;
        const bootRightY = rightLegY + legH + 4;

        // Boot Sole
        ctx.beginPath();
        ctx.ellipse(bootRightX, bootRightY + 4, 16, 8, 0.12, 0, Math.PI * 2);
        ctx.fillStyle = '#444444';
        ctx.fill();

        // Boot Main Body
        ctx.beginPath();
        ctx.ellipse(bootRightX, bootRightY, 15, 10, 0.12, 0, Math.PI * 2);
        const bootGradR = ctx.createRadialGradient(bootRightX + 4, bootRightY - 4, 2, bootRightX, bootRightY, 15);
        bootGradR.addColorStop(0, '#555555');
        bootGradR.addColorStop(0.4, '#1A1A1A');
        bootGradR.addColorStop(1, '#050505');
        ctx.fillStyle = bootGradR;
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.fill();

        // Boot Gloss Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.beginPath();
        ctx.ellipse(bootRightX + 4, bootRightY - 3, 5, 2.5, 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawKevinArms(cx, cy, isLaughing) {
        const ctx = this.ctx;
        ctx.save();

        let leftArmAngle = Math.sin(this.time * 2.2) * 0.14 + 0.3;
        let rightArmAngle = -Math.sin(this.time * 2.2) * 0.14 - 0.3;

        if (isLaughing) {
            leftArmAngle = Math.sin(this.time * 16) * 0.6 + 0.8;
            rightArmAngle = -Math.cos(this.time * 16) * 0.6 - 0.8;
        } else if (this.state === 'THINKING') {
            rightArmAngle = -1.45;
            leftArmAngle = 0.6;
        } else if (this.state === 'SPEAKING') {
            leftArmAngle = Math.sin(this.time * 9) * 0.45 + 0.5;
            rightArmAngle = -Math.cos(this.time * 9) * 0.45 - 0.5;
        }

        // Left Arm & Black Glove
        ctx.save();
        ctx.translate(cx - 62, cy + 10);
        ctx.rotate(leftArmAngle);
        ctx.fillStyle = '#F5C800';
        ctx.fillRect(-6, 0, 12, 44);
        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.arc(0, 46, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Right Arm & Black Glove
        ctx.save();
        ctx.translate(cx + 62, cy + 10);
        ctx.rotate(rightArmAngle);
        ctx.fillStyle = '#F5C800';
        ctx.fillRect(-6, 0, 12, 44);
        ctx.fillStyle = '#1A1A1A';
        ctx.beginPath();
        ctx.arc(0, 46, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.restore();
    }

    drawMinionPillBody(cx, cy, width, height, color) {
        const ctx = this.ctx;
        const radius = width / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy - height / 2 + radius, radius, Math.PI, 0, false);
        ctx.lineTo(cx + radius, cy + height / 2 - radius);
        ctx.arc(cx, cy + height / 2 - radius, radius, 0, Math.PI, false);
        ctx.closePath();

        const grad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy);
        grad.addColorStop(0, '#FFE838');
        grad.addColorStop(0.35, color);
        grad.addColorStop(0.75, '#F5C800');
        grad.addColorStop(1, '#D9A700');
        ctx.fillStyle = grad;
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(254, 225, 26, 0.45)';
        ctx.fill();

        // Highlight sheen on top head
        ctx.beginPath();
        ctx.arc(cx, cy - height / 2 + radius, radius - 5, Math.PI * 1.1, Math.PI * 1.6, false);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 5.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.restore();
    }

    drawOveralls(cx, cy, bodyW) {
        const ctx = this.ctx;
        const waistY = cy + 18;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy + 32, bodyW / 2, 0, Math.PI, false);
        ctx.lineTo(cx - bodyW / 2, waistY);
        ctx.lineTo(cx + bodyW / 2, waistY);
        ctx.closePath();

        const denimGrad = ctx.createLinearGradient(cx - bodyW / 2, cy, cx + bodyW / 2, cy);
        denimGrad.addColorStop(0, '#2D5E99');
        denimGrad.addColorStop(0.5, '#1E4575');
        denimGrad.addColorStop(1, '#133054');
        ctx.fillStyle = denimGrad;
        ctx.fill();

        // Overalls Bib Front
        const bibW = bodyW * 0.64;
        const bibH = 48;
        const bibX = cx - bibW / 2;
        const bibY = waistY - 36;

        ctx.beginPath();
        ctx.rect(bibX, bibY, bibW, bibH);
        ctx.fillStyle = denimGrad;
        ctx.fill();

        // Straps & Black Buttons
        ctx.strokeStyle = '#133054';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(bibX - 8, bibY - 20);
        ctx.lineTo(bibX + 6, bibY + 6);
        ctx.moveTo(bibX + bibW + 8, bibY - 20);
        ctx.lineTo(bibX + bibW - 6, bibY + 6);
        ctx.stroke();

        // Yellow Stitching around Bib
        ctx.strokeStyle = '#FEE11A';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bibX, bibY, bibW, bibH);

        // Gru "G" Pocket Logo
        ctx.beginPath();
        ctx.arc(cx, bibY + 25, 7.5, 0, Math.PI * 2);
        ctx.fillStyle = '#111111';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx, bibY + 25, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FEE11A';
        ctx.fill();
        ctx.fillStyle = '#111111';
        ctx.fillRect(cx, bibY + 23, 4, 4);

        ctx.restore();
    }

    drawRosyCheeks(cx, cy) {
        const ctx = this.ctx;
        ctx.save();
        ctx.globalAlpha = 0.32;
        ctx.fillStyle = '#FF5588';
        ctx.beginPath();
        ctx.ellipse(cx - 36, cy + 5, 12, 7, -0.1, 0, Math.PI * 2);
        ctx.ellipse(cx + 36, cy + 5, 12, 7, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawTwinGoggles(cx, cy, goggleR, eyeOffset) {
        const ctx = this.ctx;
        ctx.save();

        // Black Strap
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(cx - 68, cy - 13, 136, 26);

        const metalGrad = ctx.createLinearGradient(cx - 40, cy - 25, cx + 40, cy + 25);
        metalGrad.addColorStop(0, '#FFFFFF');
        metalGrad.addColorStop(0.3, '#CCCCCC');
        metalGrad.addColorStop(0.7, '#777777');
        metalGrad.addColorStop(1, '#333333');

        ctx.beginPath();
        ctx.arc(cx - eyeOffset, cy, goggleR, 0, Math.PI * 2);
        ctx.arc(cx + eyeOffset, cy, goggleR, 0, Math.PI * 2);
        ctx.fillStyle = metalGrad;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.55)';
        ctx.fill();
        ctx.lineWidth = 3.2;
        ctx.strokeStyle = '#333';
        ctx.stroke();

        ctx.restore();
    }

    drawKevinEyes(cx, cy, eyeR, eyeOffset, look, isLaughing) {
        const ctx = this.ctx;
        ctx.save();

        const drawEye = (ex) => {
            ctx.beginPath();
            ctx.arc(ex, cy, eyeR, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();

            if (this.isBlinking || isLaughing) {
                ctx.beginPath();
                ctx.arc(ex, cy, eyeR, 0, Math.PI * 2);
                ctx.fillStyle = '#FEE11A';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(ex, cy, eyeR - 2, 0.15, Math.PI - 0.15);
                ctx.lineWidth = 3.8;
                ctx.strokeStyle = '#3E2700';
                ctx.stroke();
                return;
            }

            const pupilX = ex + look.x;
            const pupilY = cy + look.y;

            ctx.beginPath();
            ctx.arc(pupilX, pupilY, 10.5, 0, Math.PI * 2);
            ctx.fillStyle = '#A0522D';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(pupilX, pupilY, 5, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(pupilX - 3, pupilY - 3, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#FFF';
            ctx.fill();
        };

        drawEye(cx - eyeOffset);
        drawEye(cx + eyeOffset);

        ctx.restore();
    }

    drawBobEyes(cx, cy, eyeR, eyeOffset, look, isLaughing) {
        const ctx = this.ctx;
        ctx.save();

        const drawBobSingleEye = (ex, irisColor) => {
            ctx.beginPath();
            ctx.arc(ex, cy, eyeR, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();

            if (this.isBlinking || isLaughing) {
                ctx.beginPath();
                ctx.arc(ex, cy, eyeR, 0, Math.PI * 2);
                ctx.fillStyle = '#FEE11A';
                ctx.fill();
                ctx.beginPath();
                ctx.arc(ex, cy, eyeR - 2, 0.15, Math.PI - 0.15);
                ctx.lineWidth = 3.5;
                ctx.strokeStyle = '#3E2700';
                ctx.stroke();
                return;
            }

            const pupilX = ex + look.x;
            const pupilY = cy + look.y;

            ctx.beginPath();
            ctx.arc(pupilX, pupilY, 9.5, 0, Math.PI * 2);
            ctx.fillStyle = irisColor;
            ctx.fill();
            ctx.beginPath();
            ctx.arc(pupilX, pupilY, 4.5, 0, Math.PI * 2);
            ctx.fillStyle = '#000';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(pupilX - 2.5, pupilY - 2.5, 2.8, 0, Math.PI * 2);
            ctx.fillStyle = '#FFF';
            ctx.fill();
        };

        drawBobSingleEye(cx - eyeOffset, '#A0522D'); // Left Eye: Brown
        drawBobSingleEye(cx + eyeOffset, '#2E8B57'); // Right Eye: Emerald Green (Heterochromia!)

        ctx.restore();
    }

    /**
     * Iconic Minion Laughing & Teeth Grinning Smile Expression 👄 😁
     */
    drawKevinMouth(cx, cy, isLaughing) {
        const ctx = this.ctx;
        ctx.save();

        const mouthY = cy + 10;

        if (isLaughing) {
            // Hilarious Wide Open Minion Laugh ("Bello!! Hahaha!")
            const mouthW = 28;
            const mouthH = 18;

            ctx.beginPath();
            ctx.ellipse(cx, mouthY + 2, mouthW, mouthH, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#4A0808';
            ctx.fill();

            // Upper Teeth Row
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(cx - 16, mouthY - 14, 32, 8);
            ctx.strokeStyle = '#DDD';
            ctx.lineWidth = 1;
            ctx.strokeRect(cx - 16, mouthY - 14, 32, 8);

            // Tongue
            ctx.beginPath();
            ctx.ellipse(cx, mouthY + 10, 14, 8, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#FF4D73';
            ctx.fill();
        } else if (this.state === 'SPEAKING') {
            const openH = 14 + this.audioAmplitude * 22;
            const mouthW = 24 + this.audioAmplitude * 8;

            ctx.beginPath();
            ctx.ellipse(cx, mouthY + openH * 0.2, mouthW, openH, 0, 0, Math.PI * 2);
            ctx.fillStyle = '#4A0808';
            ctx.fill();

            // Teeth
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(cx - 14, mouthY - openH * 0.7, 28, 7);

            // Tongue
            ctx.beginPath();
            ctx.arc(cx, mouthY + openH * 0.6, 12, 0, Math.PI * 2);
            ctx.fillStyle = '#FF4D73';
            ctx.fill();
        } else if (this.state === 'THINKING') {
            ctx.beginPath();
            ctx.arc(cx + 8, mouthY - 2, 10, 0.3, Math.PI - 0.3);
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#3E2700';
            ctx.lineCap = 'round';
            ctx.stroke();
        } else if (this.state === 'LISTENING') {
            ctx.beginPath();
            ctx.arc(cx, mouthY - 6, 22, 0.1, Math.PI - 0.1);
            ctx.lineWidth = 4.5;
            ctx.strokeStyle = '#3E2700';
            ctx.lineCap = 'round';
            ctx.stroke();
        } else {
            // Signature Minion Happy Grin with Teeth & Dimples 😁
            ctx.beginPath();
            ctx.arc(cx, mouthY - 5, 20, 0.12, Math.PI - 0.12);
            ctx.lineWidth = 4.2;
            ctx.strokeStyle = '#3E2700';
            ctx.lineCap = 'round';
            ctx.stroke();

            // Tooth band
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(cx - 10, mouthY + 1, 20, 5);

            // Tongue tip
            ctx.beginPath();
            ctx.ellipse(cx + 4, mouthY + 7, 7, 4.5, 0.2, 0, Math.PI * 2);
            ctx.fillStyle = '#FF5588';
            ctx.fill();
        }

        ctx.restore();
    }

    drawHair(cx, cy) {
        const ctx = this.ctx;
        ctx.save();
        ctx.strokeStyle = '#1A1A1A';
        ctx.lineWidth = 3.0;
        ctx.lineCap = 'round';

        const hairOffset = Math.sin(this.time * 2.2) * 5;

        ctx.beginPath();
        ctx.moveTo(cx - 16, cy + 5);
        ctx.quadraticCurveTo(cx - 24 + hairOffset, cy - 18, cx - 28, cy - 26);
        ctx.moveTo(cx - 8, cy + 2);
        ctx.quadraticCurveTo(cx - 12 + hairOffset, cy - 22, cx - 14, cy - 30);
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(cx + hairOffset, cy - 26, cx, cy - 34);
        ctx.moveTo(cx + 8, cy + 2);
        ctx.quadraticCurveTo(cx + 12 + hairOffset, cy - 22, cx + 14, cy - 30);
        ctx.moveTo(cx + 16, cy + 5);
        ctx.quadraticCurveTo(cx + 24 + hairOffset, cy - 18, cx + 28, cy - 26);
        ctx.stroke();

        ctx.restore();
    }
}

window.MinionCharacter = MinionCharacter;
