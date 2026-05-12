class Terminal {
    constructor(currentCommandId, outputContainerId) {
        this.currentCommandEl = document.getElementById(currentCommandId);
        this.outputContainerEl = document.getElementById(outputContainerId);
        this.typingSpeed = 18;
        this.isTyping = false;
        this.commandCallback = null;
        this._keydownHandler = null;
        this.commandCount = 0;

        // Status bar elements
        this.termPanel = document.querySelector('.terminal-panel');
        this.branchNameEl = document.getElementById('term-branch-name');
        this.promptBranchPill = document.getElementById('prompt-branch-pill');
        this.processTextEl = document.getElementById('term-process-text');
        this.processDot = document.querySelector('.term-process-dot');
        this.clockEl = document.getElementById('term-clock');

        this.initEventListeners();
        this.startClock();
    }

    initEventListeners() {
        if (this._keydownHandler) {
            this.currentCommandEl.removeEventListener('keydown', this._keydownHandler);
        }

        this._keydownHandler = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const cmd = this.currentCommandEl.textContent;
                if (this.isTyping) return;

                // Improvement A: Resume audio context on user gesture
                if (window.app && window.app.audio) window.app.audio.init();

                this.finalizeCommand(cmd);
                if (this.commandCallback) {
                    this.commandCallback(cmd);
                }
            }
        };

        this.currentCommandEl.addEventListener('keydown', this._keydownHandler);

        // Ensure cursor is always at the end
        this.currentCommandEl.addEventListener('focus', () => {
            setTimeout(() => {
                const range = document.createRange();
                const sel = window.getSelection();
                range.selectNodeContents(this.currentCommandEl);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }, 0);
        });
    }

    onCommand(callback) {
        this.commandCallback = callback;
    }

    // ─── Status Bar Sync ─────────────────────────────────────────
    startClock() {
        const update = () => {
            if (this.clockEl) {
                const now = new Date();
                this.clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
            }
            requestAnimationFrame(update);
        };
        update();
    }

    setProcessStatus(status) {
        if (this.processTextEl) this.processTextEl.textContent = status;
        if (this.processDot) {
            if (status === 'IDLE') {
                this.processDot.classList.remove('running');
            } else {
                this.processDot.classList.add('running');
            }
        }
    }

    syncBranch() {
        const branch = (window.app && window.app.graph)
            ? window.app.graph.currentBranch
            : 'main';
        if (this.branchNameEl) this.branchNameEl.textContent = branch;
        if (this.promptBranchPill) {
            const changed = this.promptBranchPill.textContent !== branch;
            this.promptBranchPill.textContent = branch;
            if (changed) {
                this.promptBranchPill.classList.add('changed');
                setTimeout(() => this.promptBranchPill.classList.remove('changed'), 600);
            }
        }
    }

    // ─── Rich Prompt Builder ─────────────────────────────────────
    buildPromptHTML() {
        const branch = (window.app && window.app.graph)
            ? window.app.graph.currentBranch
            : 'main';
        return `<span class="prompt-echo"><span class="prompt-user">odyssey</span><span class="prompt-at">@</span><span class="prompt-host">neural</span><span class="prompt-sep">:</span><span class="prompt-dir">~/project</span> <span class="prompt-branch-pill">${branch}</span></span> <span class="prompt-dollar">$</span>`;
    }

    // ─── Type Command (AI auto-typing) ───────────────────────────
    async type(text) {
        // Queue if already typing
        if (this.isTyping) {
            await new Promise(resolve => {
                const check = setInterval(() => {
                    if (!this.isTyping) {
                        clearInterval(check);
                        resolve();
                    }
                }, 50);
            });
        }

        this.isTyping = true;
        this.commandCount++;
        this.setProcessStatus('TYPING');
        this.syncBranch();

        // Add typing-active glow to terminal panel
        if (this.termPanel) this.termPanel.classList.add('typing-active');
        
        // Screen Play Dynamic: Dim background stages
        const stages = document.querySelector('.stages-container');
        if (stages) stages.classList.add('cinematic-dim');

        this.currentCommandEl.setAttribute('contenteditable', 'false');
        this.currentCommandEl.textContent = '';

        for (let i = 0; i < text.length; i++) {
            this.currentCommandEl.textContent += text[i];
            if (window.app && window.app.audio) window.app.audio.playType();

            // Variable speed for realism (bursts and pauses)
            let charDelay = this.typingSpeed + Math.random() * 35;
            if (text[i] === ' ') charDelay += 60;
            if (text[i] === '-') charDelay += 25;
            if (text[i] === '"') charDelay += 40;

            await this.sleep(charDelay);
        }

        await this.sleep(350);
        this.finalizeCommand(text);
        this.isTyping = false;
        this.setProcessStatus('EXEC');

        // Remove typing glow and cinematic dim
        if (this.termPanel) this.termPanel.classList.remove('typing-active');
        if (stages) stages.classList.remove('cinematic-dim');

        this.currentCommandEl.setAttribute('contenteditable', 'true');
    }

    // ─── Finalize Command — Rich Echo ────────────────────────────
    finalizeCommand(text) {
        const line = document.createElement('div');
        line.className = 'line line-cmd';
        line.innerHTML = `${this.buildPromptHTML()} <span class="cmd-text">${this.escapeHTML(text)}</span>`;

        const currentLine = this.currentCommandEl.parentElement;
        this.outputContainerEl.insertBefore(line, currentLine);

        // Clear current command
        this.currentCommandEl.textContent = '';

        // Sync branch in prompt
        this.syncBranch();

        // Scroll to bottom
        this.outputContainerEl.scrollTop = this.outputContainerEl.scrollHeight;
    }

    // ─── Typewriter Log — Animated Output ────────────────────────
    async typewriterLog(message, type = 'info') {
        const line = document.createElement('div');
        line.className = `line line-log log-${type}`;

        // Prefix badge
        const prefix = document.createElement('span');
        const prefixMap = {
            info: '▸ INFO',
            success: '✓ OK',
            error: '✗ ERR',
            warn: '⚠ WARN'
        };
        prefix.className = `log-prefix prefix-${type}`;
        prefix.textContent = prefixMap[type] || '▸ INFO';
        line.appendChild(prefix);

        const content = document.createElement('span');
        line.appendChild(content);

        const currentLine = this.currentCommandEl.parentElement;
        this.outputContainerEl.insertBefore(line, currentLine);

        // Character-by-character typing
        for (let i = 0; i < message.length; i++) {
            content.textContent += message[i];
            if (window.app && window.app.audio) window.app.audio.playType();
            await this.sleep(8 + Math.random() * 12);
        }

        this.outputContainerEl.scrollTop = this.outputContainerEl.scrollHeight;
    }

    // ─── Instant Log — No Animation ──────────────────────────────
    log(message, type = 'info') {
        const line = document.createElement('div');
        line.className = `line line-log log-${type}`;

        const prefix = document.createElement('span');
        const prefixMap = {
            info: '▸ INFO',
            success: '✓ OK',
            error: '✗ ERR',
            warn: '⚠ WARN'
        };
        prefix.className = `log-prefix prefix-${type}`;
        prefix.textContent = prefixMap[type] || '▸ INFO';
        line.appendChild(prefix);

        const content = document.createElement('span');
        content.textContent = message;
        line.appendChild(content);

        const currentLine = this.currentCommandEl.parentElement;
        this.outputContainerEl.insertBefore(line, currentLine);
        this.outputContainerEl.scrollTop = this.outputContainerEl.scrollHeight;
    }

    // ─── Progress Bar — Inline Visual ────────────────────────────
    showProgress(label = 'Processing') {
        const wrapper = document.createElement('div');
        wrapper.className = 'term-progress';
        wrapper.innerHTML = `
            <span class="log-prefix prefix-info" style="min-width:auto">${label}</span>
            <div class="term-progress-track">
                <div class="term-progress-fill" style="width: 0%"></div>
            </div>
            <span class="term-progress-label">0%</span>
        `;

        const currentLine = this.currentCommandEl.parentElement;
        this.outputContainerEl.insertBefore(wrapper, currentLine);
        this.outputContainerEl.scrollTop = this.outputContainerEl.scrollHeight;

        const fill = wrapper.querySelector('.term-progress-fill');
        const labelEl = wrapper.querySelector('.term-progress-label');

        return {
            update: (percent) => {
                const p = Math.min(100, Math.max(0, percent));
                fill.style.width = p + '%';
                labelEl.textContent = Math.round(p) + '%';
                this.outputContainerEl.scrollTop = this.outputContainerEl.scrollHeight;
            },
            complete: () => {
                fill.style.width = '100%';
                labelEl.textContent = '100%';
                fill.style.background = 'var(--accent)';
            }
        };
    }

    // ─── Separator Line ──────────────────────────────────────────
    addSeparator() {
        const sep = document.createElement('div');
        sep.className = 'line-separator';
        const currentLine = this.currentCommandEl.parentElement;
        this.outputContainerEl.insertBefore(sep, currentLine);
    }

    // ─── Clear Terminal ─────────────────────────────────────────
    clear() {
        // Keep only the active line
        const activeLine = this.currentCommandEl.parentElement;
        this.outputContainerEl.innerHTML = '';
        this.outputContainerEl.appendChild(activeLine);
        this.currentCommandEl.textContent = '';
        this.syncBranch();
        
        // Ensure focus
        this.currentCommandEl.focus();
    }

    // ─── Utilities ───────────────────────────────────────────────
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
