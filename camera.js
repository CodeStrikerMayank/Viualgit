class Camera {
    constructor(wrapperId) {
        this.wrapper = document.querySelector(wrapperId);
        this.currentZoom = 1;
        this.currentPanX = 0;
        this.currentPanY = 0;
    }

    focusTerminal() {
        this.zoom(1.05);
        this.pan(0, -50);
    }

    focusStages() {
        this.zoom(1);
        this.pan(0, 0);
    }

    zoom(level) {
        this.currentZoom = level;
        this.apply();
    }

    pan(x, y) {
        this.currentPanX = x;
        this.currentPanY = y;
        this.apply();
    }

    apply() {
        if (!this.wrapper) return;
        // Combine with existing parallax if needed, but here we just update scale/translate
        // Note: The parallax logic is on .main-container, so we put camera on .content-wrapper
        this.wrapper.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        this.wrapper.style.transform = `scale(${this.currentZoom}) translate(${this.currentPanX}px, ${this.currentPanY}px)`;
    }

    async panToStage(stageId) {
        if (window.app.parallax) window.app.parallax.lock();
        
        const stage = document.getElementById(stageId);
        if (!stage) return;
        
        // Slightly pan towards the stage to track it
        const rect = stage.getBoundingClientRect();
        const centerX = window.innerWidth / 2;
        const stageX = (rect.left + rect.right) / 2;
        const offsetX = (centerX - stageX) * 0.1;

        this.pan(offsetX, 0);
    }

    reset() {
        this.zoom(1);
        this.pan(0, 0);
        if (window.app.parallax) window.app.parallax.unlock();
        
        // Improvement B: Update wires AFTER camera reset animation completes
        setTimeout(() => {
            if (window.app.wires) window.app.wires.drawPaths();
        }, 850);
    }
}
