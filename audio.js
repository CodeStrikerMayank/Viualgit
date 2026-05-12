class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterVolume = 0.2;
        this.isMuted = false;
        this.previewBuffer = null;
    }

    async init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.loadPreview();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    async loadPreview() {
        try {
            const response = await fetch('preview.mp3');
            const arrayBuffer = await response.arrayBuffer();
            this.previewBuffer = await this.ctx.decodeAudioData(arrayBuffer);
        } catch (e) {
            console.error("Failed to load preview audio:", e);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    playType() {
        // Sound removed
    }

    playMove() {
        if (!this.ctx || this.isMuted) return;
        
        if (this.previewBuffer) {
            const source = this.ctx.createBufferSource();
            source.buffer = this.previewBuffer;
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
            source.connect(gain);
            gain.connect(this.ctx.destination);
            source.start(0);
        } else {
            // Fallback to original synth sound if buffer not loaded
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(200, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.5);
            
            gain.gain.setValueAtTime(0, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(this.masterVolume * 0.5, this.ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 0.5);
        }
    }

    playSuccess() {
        if (!this.ctx || this.isMuted) return;
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            gain.gain.setValueAtTime(0, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(this.masterVolume, now + i * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.4);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.4);
        });
    }
}
