/**
 * Amazing Desktop Mac - 3D Spatial Image Slider Component
 * Rotates 3D image gallery every 5 seconds bringing active image to front focus.
 */

class Spatial3DSlider {
    constructor() {
        this.stage = document.getElementById('slider3DStage');
        this.carousel = document.getElementById('slider3DCarousel');
        this.badge = document.getElementById('slideBadge');
        this.progressBar = document.getElementById('sliderProgress');

        this.currentIndex = 0;
        this.autoPlayInterval = null;
        this.intervalDuration = 3000; // 5 seconds auto rotate
        this.progressAnimation = null;

        // Image items list (Default placeholders + custom image support from images/ directory)
        this.items = [
            { title: "Cyberpunk City", src: "images/1.jpg", fallbackGrad: "linear-gradient(135deg, #00f0ff, #7000ff)" },
            { title: "Cosmic Nebula", src: "images/2.jpg", fallbackGrad: "linear-gradient(135deg, #a855f7, #ec4899)" },
            { title: "Emerald Aurora", src: "images/3.jpg", fallbackGrad: "linear-gradient(135deg, #10b981, #06b6d4)" },
            { title: "Neon Sunset", src: "images/4.jpg", fallbackGrad: "linear-gradient(135deg, #ff5e62, #ff9966)" },
            { title: "Quantum Realm", src: "images/5.jpg", fallbackGrad: "linear-gradient(135deg, #3b82f6, #8b5cf6)" },
            { title: "Holographic Sphere", src: "images/6.jpg", fallbackGrad: "linear-gradient(135deg, #f43f5e, #fb923c)" }
        ];

        this.init();
    }

    init() {
        if (!this.carousel) return;

        this.shuffleArray(this.items);
        this.renderCards();
        this.update3DPositions();
        this.startAutoPlay();
        this.bindEvents();
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    loadCustomImages(imageUrls) {
        if (!Array.isArray(imageUrls) || imageUrls.length === 0) return;

        // Shuffle images randomly on each load
        const shuffledUrls = [...imageUrls];
        this.shuffleArray(shuffledUrls);

        const gradients = [
            "linear-gradient(135deg, #00f0ff, #7000ff)",
            "linear-gradient(135deg, #a855f7, #ec4899)",
            "linear-gradient(135deg, #10b981, #06b6d4)",
            "linear-gradient(135deg, #ff5e62, #ff9966)",
            "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            "linear-gradient(135deg, #f43f5e, #fb923c)"
        ];

        this.items = shuffledUrls.map((url, idx) => {
            // Extract filename for title
            const parts = url.split('/');
            let rawFilename = parts[parts.length - 1] || `Image ${idx + 1}`;
            rawFilename = decodeURIComponent(rawFilename).replace(/\.[^/.]+$/, "");
            const formattedTitle = rawFilename.replace(/[-_]/g, ' ');

            return {
                title: formattedTitle || `Artwork #${idx + 1}`,
                src: url,
                fallbackGrad: gradients[idx % gradients.length]
            };
        });

        this.currentIndex = 0;
        this.renderCards();
        this.update3DPositions();
        this.startAutoPlay();
    }

    renderCards() {
        this.carousel.innerHTML = '';
        this.items.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'slider-card';
            card.setAttribute('data-index', index);

            // Create image element with fallback gradient
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.title;
            img.onerror = () => {
                // If image in images/ folder not found yet, use fallback gradient card
                img.style.display = 'none';
                card.style.background = item.fallbackGrad;
            };

            const overlay = document.createElement('div');
            overlay.className = 'card-overlay';

            const title = document.createElement('div');
            title.className = 'card-title';
            title.textContent = item.title;

            const indexBadge = document.createElement('span');
            indexBadge.className = 'card-index-tag';
            indexBadge.textContent = `#0${index + 1}`;

            overlay.appendChild(indexBadge);
            overlay.appendChild(title);
            card.appendChild(img);
            card.appendChild(overlay);

            card.addEventListener('click', () => {
                this.goToSlide(index);
            });

            this.carousel.appendChild(card);
        });
    }

    update3DPositions() {
        const cards = this.carousel.querySelectorAll('.slider-card');
        const total = cards.length;
        if (total === 0) return;

        cards.forEach((card, index) => {
            // Offset relative to current active index
            let diff = index - this.currentIndex;
            if (diff < -Math.floor(total / 2)) diff += total;
            if (diff > Math.floor(total / 2)) diff -= total;

            const absDiff = Math.abs(diff);

            if (diff === 0) {
                // Main active center card: Pops forward into front focus, 100% visible, zero overlap
                card.style.transform = `translate3d(0px, 0px, 140px) rotateY(0deg) scale(1.18)`;
                card.style.opacity = '1';
                card.style.zIndex = '100';
                card.classList.add('active');
            } else {
                // Side cards: Pushed further outward (X) and deeper into background (-Z)
                const direction = diff > 0 ? 1 : -1;
                const xOffset = direction * (105 + absDiff * 32);
                const zOffset = -70 - absDiff * 50;
                const rotateY = -direction * (22 + absDiff * 8);
                const scale = Math.max(0.6, 0.82 - absDiff * 0.08);
                const opacity = Math.max(0.18, 0.6 - absDiff * 0.1);

                card.style.transform = `translate3d(${xOffset}px, 0px, ${zOffset}px) rotateY(${rotateY}deg) scale(${scale})`;
                card.style.opacity = opacity;
                card.style.zIndex = 50 - absDiff;
                card.classList.remove('active');
            }
        });

        if (this.badge) {
            this.badge.textContent = `${this.currentIndex + 1} / ${total}`;
        }
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.items.length;
        this.update3DPositions();
        this.resetProgressBar();
    }

    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        this.update3DPositions();
        this.resetProgressBar();
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.update3DPositions();
        this.resetProgressBar();
    }

    startAutoPlay() {
        this.stopAutoPlay();
        this.resetProgressBar();
        this.autoPlayInterval = setInterval(() => {
            this.nextSlide();
        }, this.intervalDuration);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
            this.autoPlayInterval = null;
        }
    }

    resetProgressBar() {
        if (!this.progressBar) return;
        this.progressBar.style.transition = 'none';
        this.progressBar.style.width = '0%';

        setTimeout(() => {
            this.progressBar.style.transition = `width ${this.intervalDuration}ms linear`;
            this.progressBar.style.width = '100%';
        }, 30);
    }

    bindEvents() {
        const prevBtn = document.getElementById('prevSlideBtn');
        const nextBtn = document.getElementById('nextSlideBtn');

        if (prevBtn) prevBtn.addEventListener('click', () => this.prevSlide());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextSlide());

        // Pause auto-rotation on mouse hover over 3D slider widget
        const widget = document.querySelector('.spatial-slider-widget');
        if (widget) {
            widget.addEventListener('mouseenter', () => this.stopAutoPlay());
            widget.addEventListener('mouseleave', () => this.startAutoPlay());
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.spatial3DSlider = new Spatial3DSlider();
});
