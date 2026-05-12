class Parallax {
    constructor(containerId) {
        this.container = document.querySelector(containerId);
        this.intensity = 5; // Degrees of rotation
        this.isLocked = false;
        this.init();
    }

    init() {
        let ticking = false;
        document.body.addEventListener('mousemove', (e) => {
            if (!this.container || this.isLocked) return;

            if (!ticking) {
                requestAnimationFrame(() => {
                    const x = e.clientX / window.innerWidth - 0.5;
                    const y = e.clientY / window.innerHeight - 0.5;

                    // Calculate rotation
                    const rotateX = -y * this.intensity;
                    const rotateY = x * this.intensity;

                    // Apply tilt to main container
                    this.container.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                    
                    // Apply slight counter-parallax to stages for depth
                    document.querySelectorAll('.stage, .git-graph-panel, .terminal-panel').forEach(el => {
                        const depth = el.classList.contains('terminal-panel') ? 10 : 20;
                        el.style.transform = `translateZ(${depth}px)`;
                    });
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    lock() {
        this.isLocked = true;
        this.container.style.transition = 'transform 0.5s ease';
        this.container.style.transform = 'rotateX(0deg) rotateY(0deg)';
    }

    unlock() {
        this.isLocked = false;
        this.container.style.transition = '';
    }
}
