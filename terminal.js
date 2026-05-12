class Terminal {
    constructor(currentCommandId, outputContainerId) {
        this.currentCommandEl = document.getElementById(currentCommandId);
        this.outputContainerEl = document.getElementById(outputContainerId);
        this.typingSpeed = 15; // ms per character (faster for AI)
        this.isTyping = false;
        this.commandCallback = null;

        this.initEventListeners();
    }

    initEventListeners() {
        this.currentCommandEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const cmd = this.currentCommandEl.textContent;
                if (this.isTyping) return;
                
                this.finalizeCommand(cmd);
                if (this.commandCallback) {
                    this.commandCallback(cmd);
                }
            }
        });

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

    async type(text) {
        if (this.isTyping) return;
        this.isTyping = true;
        this.currentCommandEl.setAttribute('contenteditable', 'false');
        this.currentCommandEl.textContent = '';

        for (let i = 0; i < text.length; i++) {
            this.currentCommandEl.textContent += text[i];
            if (window.app && window.app.audio) window.app.audio.playType();

            // Variable speed for realism (bursts and pauses)
            let charDelay = this.typingSpeed + Math.random() * 40;
            if (text[i] === ' ') charDelay += 50;
            if (text[i] === '-') charDelay += 30;

            await this.sleep(charDelay);
        }

        await this.sleep(400);
        this.finalizeCommand(text);
        this.isTyping = false;
        this.currentCommandEl.setAttribute('contenteditable', 'true');
    }

    finalizeCommand(text) {
        // Create a new line in the terminal history
        const line = document.createElement('div');
        line.className = 'line';
        line.innerHTML = `<span class="prompt">$</span> <span>${text}</span>`;
        
        // Insert before the current active line
        const currentLine = this.currentCommandEl.parentElement;
        this.outputContainerEl.insertBefore(line, currentLine);
        
        // Clear current command line
        this.currentCommandEl.textContent = '';
        
        // Scroll to bottom
        this.outputContainerEl.scrollTop = this.outputContainerEl.scrollHeight;
    }

    async typewriterLog(message, type = 'info') {
        const line = document.createElement('div');
        line.className = 'line';
        line.style.color = type === 'error' ? '#ff5f56' : (type === 'success' ? '#64FFDA' : '#8892B0');

        const prefix = document.createElement('span');
        prefix.textContent = '> ';
        line.appendChild(prefix);

        const content = document.createElement('span');
        line.appendChild(content);

        const currentLine = this.currentCommandEl.parentElement;
        this.outputContainerEl.insertBefore(line, currentLine);

        for (let i = 0; i < message.length; i++) {
            content.textContent += message[i];
            if (window.app && window.app.audio) window.app.audio.playType();
            await this.sleep(10 + Math.random() * 15);
        }

        this.outputContainerEl.scrollTop = this.outputContainerEl.scrollHeight;
    }

    log(message, type = 'info') {
        const line = document.createElement('div');
        line.className = 'line';
        line.style.color = type === 'error' ? '#ff5f56' : (type === 'success' ? '#64FFDA' : '#8892B0');
        line.textContent = message;
        
        const currentLine = this.currentCommandEl.parentElement;
        this.outputContainerEl.insertBefore(line, currentLine);
        this.outputContainerEl.scrollTop = this.outputContainerEl.scrollHeight;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
