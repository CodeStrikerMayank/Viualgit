class UIManager {
    constructor() {
        this.terminalPanel = document.querySelector('.terminal-panel');
        this.minimizeBtn = document.getElementById('minimize-terminal');
        this.expandBtn = document.getElementById('expand-terminal');
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.currentBranchDisplay = document.getElementById('current-branch-display');
        
        this.historyPanel = document.getElementById('history-panel');
        this.historyBtn = document.getElementById('history-btn');
        this.closeHistoryBtn = document.getElementById('close-history-btn');
        this.toggleGraphBtn = document.getElementById('toggle-graph-btn');
        this.graphViewport = document.getElementById('git-graph-viewport');

        this.initEventListeners();
    }

    initEventListeners() {
        // Info Modal
        const infoBtn = document.getElementById('info-modal-btn');
        const infoModal = document.getElementById('info-modal');
        const closeInfoBtn = document.getElementById('close-info-btn');

        if (infoBtn && infoModal && closeInfoBtn) {
            infoBtn.addEventListener('click', () => {
                document.body.classList.add('modal-open');
                infoModal.classList.add('active');
            });
            closeInfoBtn.addEventListener('click', () => {
                document.body.classList.remove('modal-open');
                infoModal.classList.remove('active');
            });
        }

        // Terminal toggling
        this.minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            gsap.to(this.terminalPanel, { 
                height: 45, 
                duration: 0.4, 
                ease: "power2.inOut",
                onComplete: () => { if (window.app.wires) window.app.wires.drawPaths(); }
            });
            this.terminalPanel.classList.add('minimized');
        });

        this.expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetHeight = window.innerWidth <= 768 ? 200 : 260;
            gsap.to(this.terminalPanel, { 
                height: targetHeight, 
                duration: 0.4, 
                ease: "power2.inOut",
                onComplete: () => { if (window.app.wires) window.app.wires.drawPaths(); }
            });
            this.terminalPanel.classList.remove('minimized');
        });

        // History Panel
        this.historyBtn.addEventListener('click', () => {
            this.historyPanel.classList.add('active');
            this.renderHistory();
        });

        this.closeHistoryBtn.addEventListener('click', () => {
            this.historyPanel.classList.remove('active');
        });

        // Toggle Graph View
        let isGraphExpanded = true;
        this.toggleGraphBtn.addEventListener('click', () => {
            isGraphExpanded = !isGraphExpanded;
            gsap.to(this.graphViewport, { 
                height: isGraphExpanded ? '100%' : '0', 
                opacity: isGraphExpanded ? 1 : 0,
                duration: 0.4 
            });
            this.toggleGraphBtn.style.transform = isGraphExpanded ? 'rotate(0deg)' : 'rotate(180deg)';
        });

        // Interactive Button Effects
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, { scale: 1.05, duration: 0.2, ease: "power1.out" });
            });
            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, { scale: 1, duration: 0.2, ease: "power1.in" });
            });
            btn.addEventListener('mousedown', () => {
                gsap.to(btn, { scale: 0.95, duration: 0.1 });
            });
            btn.addEventListener('mouseup', () => {
                gsap.to(btn, { scale: 1.05, duration: 0.1 });
            });
        });

        // Navigation switching
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.id === 'neural-center-btn' || btn.id === 'reset-btn') return;
                
                this.navButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const view = btn.getAttribute('data-view');
                if (view === 'stages') {
                    this.historyPanel.classList.remove('active');
                }
                
                // Visual feedback for view switch
                gsap.from('.content-wrapper', { opacity: 0, y: 10, duration: 0.4, ease: "power2.out" });
            });
        });
    }

    renderHistory() {
        const log = document.getElementById('history-log');
        const history = window.app.git.history;
        
        if (history.length === 0) {
            log.innerHTML = '<div class="empty-hint">No commits recorded yet</div>';
            return;
        }

        log.innerHTML = history.slice().reverse().map(commit => `
            <div class="log-entry">
                <div class="log-hash">${commit.hash}</div>
                <div class="log-msg">${commit.message}</div>
                <div class="log-meta">${new Date(commit.timestamp).toLocaleTimeString()}</div>
            </div>
        `).join('');
    }

    updateBranch(name) {
        if (this.currentBranchDisplay) {
            this.currentBranchDisplay.textContent = name;
            
            // Add a subtle flash effect
            this.currentBranchDisplay.style.color = '#fff';
            setTimeout(() => {
                this.currentBranchDisplay.style.color = 'var(--accent)';
            }, 300);
        }
    }
}
