class DOMRenderer {
    constructor() {
        this.stages = {
            working: document.querySelector('#working-directory .file-list'),
            staging: document.querySelector('#staging-area .file-list'),
            local: document.querySelector('#local-repo .file-list'),
            remote: document.querySelector('#remote-repo .file-list')
        };
        this.fileCount = 0;
        this.files = [];
    }

    addFile() {
        this.fileCount++;
        const fileId = `file-${this.fileCount}`;
        const fileName = `feature_${this.fileCount}.js`;
        
        const fileEl = document.createElement('div');
        fileEl.className = 'file-card';
        fileEl.id = fileId;
        fileEl.innerHTML = `
            <div class="file-icon"></div>
            <span class="file-name">${fileName}</span>
        `;
        
        this.stages.working.appendChild(fileEl);
        this.files.push({ id: fileId, name: fileName, element: fileEl, stage: 'working' });
        
        // Add a subtle entrance animation
        fileEl.style.opacity = '0';
        fileEl.style.transform = 'translateY(10px)';
        requestAnimationFrame(() => {
            fileEl.style.transition = 'all 0.4s ease';
            fileEl.style.opacity = '1';
            fileEl.style.transform = 'translateY(0)';
        });

        return fileId;
    }

    async moveAll(fromStage, toStage) {
        const filesToMove = this.files.filter(f => f.stage === fromStage);
        if (filesToMove.length === 0) return;

        const promises = filesToMove.map(file => this.moveFile(file.id, toStage));
        await Promise.all(promises);
    }

    async moveFile(fileId, targetStageName) {
        const fileObj = this.files.find(f => f.id === fileId);
        if (!fileObj) return;

        const targetContainer = this.stages[targetStageName];
        const startRect = fileObj.element.getBoundingClientRect();
        
        // Prepare for FLIP animation
        fileObj.element.classList.add('moving');
        
        // Append to target to get end position
        targetContainer.appendChild(fileObj.element);
        const endRect = fileObj.element.getBoundingClientRect();
        
        // Invert
        const deltaX = startRect.left - endRect.left;
        const deltaY = startRect.top - endRect.top;
        
        fileObj.element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        fileObj.element.style.transition = 'none';
        
        // Play
        requestAnimationFrame(() => {
            fileObj.element.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease';
            fileObj.element.style.transform = 'translate(0, 0)';
            
            // Clean up after animation
            setTimeout(() => {
                fileObj.element.classList.remove('moving');
                fileObj.element.style.transform = '';
                fileObj.element.style.transition = '';
                fileObj.stage = targetStageName;

                // Trigger Impact Effect
                const stageEl = targetContainer.parentElement;
                stageEl.classList.add('impact');
                setTimeout(() => stageEl.classList.remove('impact'), 500);
            }, 800);
        });

        await new Promise(resolve => setTimeout(resolve, 900));
    }
}
