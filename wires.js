class Wires {
    constructor(svgId) {
        this.svg = document.getElementById(svgId);
        this.paths = {}; // Stores arrays of parallel paths for each connection
        this.stages = ['working-directory', 'staging-area', 'local-repo', 'remote-repo'];
        
        window.addEventListener('resize', () => this.drawPaths());
        this.drawPaths();
        this.startIdleFlow();
    }

    drawPaths() {
        this.svg.innerHTML = `
            <defs>
                <linearGradient id="trace-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#64ffda; stop-opacity:0.3" />
                    <stop offset="50%" style="stop-color:#f472b6; stop-opacity:0.6" />
                    <stop offset="100%" style="stop-color:#64ffda; stop-opacity:0.3" />
                </linearGradient>
            </defs>
        `; 
        this.paths = {};
        
        // Define connections: 0 -> 1, 1 -> 2, 2 -> 3
        for (let i = 0; i < this.stages.length - 1; i++) {
            this.createPCBBus(this.stages[i], this.stages[i+1]);
        }
    }

    createPCBBus(fromId, toId) {
        const offsets = [-12, 0, 12]; // Create 3 parallel traces
        const connectionKey = `${fromId}->${toId}`;
        this.paths[connectionKey] = [];
        this.paths[`${toId}->${fromId}`] = this.paths[connectionKey]; // Reverse lookup

        offsets.forEach((offset, idx) => {
            const path = this.createOrthogonalPath(fromId, toId, offset, idx);
            if (path) {
                this.paths[connectionKey].push(path);
            }
        });
    }

    createOrthogonalPath(fromId, toId, xOffset, idx) {
        const fromEl = document.getElementById(fromId);
        const toEl = document.getElementById(toId);
        if (!fromEl || !toEl) return null;

        const containerRect = this.svg.getBoundingClientRect();
        const r1 = fromEl.getBoundingClientRect();
        const r2 = toEl.getBoundingClientRect();

        const isVerticalLayout = window.innerWidth <= 600;
        let d;

        if (isVerticalLayout) {
            // Mobile: Side-to-side orthogonal paths
            const x1 = r1.left - containerRect.left + 10;
            const y1 = (r1.top + r1.bottom) / 2 - containerRect.top + (idx * 5);
            const x2 = r2.left - containerRect.left + 10;
            const y2 = (r2.top + r2.bottom) / 2 - containerRect.top + (idx * 5);
            
            const midX = x1 - (30 + idx * 5);
            d = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
        } else {
            // Desktop: Top-to-top orthogonal paths
            const x1 = (r1.left + r1.right) / 2 - containerRect.left + xOffset;
            const y1 = r1.top - containerRect.top + 5;
            const x2 = (r2.left + r2.right) / 2 - containerRect.left + xOffset;
            const y2 = r2.top - containerRect.top + 5;

            const midY = y1 - (40 + idx * 5); 
            d = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
        }
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", d);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "url(#trace-gradient)");
        path.setAttribute("stroke-width", "1.5");
        path.classList.add('plasma-trace');
        path.id = `path-${fromId}-to-${toId}-${idx}`;
        
        this.svg.appendChild(path);
        return path;
    }

    firePulse(fromId, toId, isIdle = false) {
        const bus = this.paths[`${fromId}->${toId}`];
        if (!bus || bus.length === 0) return;

        const path = bus[Math.floor(Math.random() * bus.length)];
        const isReverse = fromId === 'remote-repo' || (fromId === 'local-repo' && toId === 'staging-area');

        const pulse = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const radius = isIdle ? "1.5" : "4";
        const opacity = isIdle ? "0.3" : "1";
        const duration = isIdle ? (1.5 + Math.random()) + "s" : "0.8s";
        
        pulse.setAttribute("r", radius);
        pulse.setAttribute("fill", isIdle ? "#64ffda" : "#fff");
        pulse.setAttribute("filter", "url(#pulse-glow)");
        pulse.style.opacity = opacity;
        
        const motion = document.createElementNS("http://www.w3.org/2000/svg", "animateMotion");
        motion.setAttribute("dur", duration);
        motion.setAttribute("repeatCount", "1");
        motion.setAttribute("rotate", "auto");
        motion.setAttribute("fill", "freeze");
        
        const mPath = document.createElementNS("http://www.w3.org/2000/svg", "mpath");
        mPath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", `#${path.id}`);
        
        motion.appendChild(mPath);
        
        if (isReverse) {
            motion.setAttribute("keyPoints", "1;0");
            motion.setAttribute("keyTimes", "0;1");
            motion.setAttribute("calcMode", "linear");
        }

        pulse.appendChild(motion);
        this.svg.appendChild(pulse);

        setTimeout(() => {
            pulse.remove();
        }, parseFloat(duration) * 1000 + 50);
    }

    startIdleFlow() {
        // Disabled idle flow to reduce distraction as requested
        /*
        setInterval(() => {
            if (Math.random() > 0.2) {
                const connectionIndex = Math.floor(Math.random() * (this.stages.length - 1));
                const fromId = this.stages[connectionIndex];
                const toId = this.stages[connectionIndex + 1];
                if (Math.random() > 0.5) {
                    this.firePulse(fromId, toId, true);
                } else {
                    this.firePulse(toId, fromId, true);
                }
            }
        }, 400);
        */
    }
}
