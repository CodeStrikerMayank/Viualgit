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
        
        if (window.app && window.app.git) {
            window.app.git.createFile(fileName, fileId);
        }
        
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
        
        fileObj.element.classList.add('moving');
        targetContainer.appendChild(fileObj.element);
        const endRect = fileObj.element.getBoundingClientRect();
        
        const deltaX = startRect.left - endRect.left;
        const deltaY = startRect.top - endRect.top;
        
        // GSAP Implementation for Silk-Smooth Rendering
        gsap.fromTo(fileObj.element, 
            { x: deltaX, y: deltaY, scale: 1.1, opacity: 0.8 },
            { 
                duration: 0.8, 
                x: 0, 
                y: 0, 
                scale: 1, 
                opacity: 1,
                ease: "expo.out",
                onComplete: () => {
                    fileObj.element.classList.remove('moving');
                    fileObj.stage = targetStageName;
                    
                    const stageEl = targetContainer.parentElement;
                    gsap.to(stageEl, {
                        duration: 0.1,
                        x: 2,
                        repeat: 3,
                        yoyo: true,
                        onComplete: () => gsap.set(stageEl, { x: 0 })
                    });
                }
            }
        );

        await new Promise(resolve => setTimeout(resolve, 850));
    }
}
