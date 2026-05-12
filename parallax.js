class Parallax {
    constructor(containerId) {
        this.container = document.querySelector(containerId);
        this.intensity = 5; // Degrees of rotation
        this.init();
    }

    init() {
        document.body.addEventListener('mousemove', (e) => {
            if (!this.container) return;

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
        });
    }
}
