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
        // Find files that are CURRENTLY in the fromStage
        const filesToMove = this.files.filter(f => f.stage === fromStage);
        if (filesToMove.length === 0) return;

        // Mark them as 'transitioning' immediately so they aren't picked up by other calls
        filesToMove.forEach(f => f.stage = `moving_to_${toStage}`);

        // Move with a slight stagger for a more organic, stable feel
        for (let i = 0; i < filesToMove.length; i++) {
            this.moveFile(filesToMove[i].id, toStage, i * 100);
        }

        // Wait for the longest animation to finish (roughly)
        await new Promise(resolve => setTimeout(resolve, 850 + (filesToMove.length * 100)));
    }

    async moveFile(fileId, targetStageName, delay = 0) {
        const fileObj = this.files.find(f => f.id === fileId);
        if (!fileObj) return;

        const targetContainer = this.stages[targetStageName];
        if (!targetContainer) return;

        if (delay > 0) await new Promise(r => setTimeout(r, delay));

        const startRect = fileObj.element.getBoundingClientRect();
        
        fileObj.element.classList.add('moving');
        targetContainer.appendChild(fileObj.element);
        
        const endRect = fileObj.element.getBoundingClientRect();
        
        const deltaX = startRect.left - endRect.left;
        const deltaY = startRect.top - endRect.top;
        
        // Dynamic rotation based on movement direction
        const rotation = deltaX > 0 ? -15 : 15;
        
        gsap.fromTo(fileObj.element, 
            { 
                x: deltaX, 
                y: deltaY, 
                rotation: rotation,
                scale: 1.2, 
                opacity: 0.6,
                zIndex: 1000 
            },
            { 
                duration: 0.8, 
                x: 0, 
                y: 0, 
                rotation: 0,
                scale: 1, 
                opacity: 1,
                ease: "expo.out",
                onStart: () => {
                    fileObj.stage = targetStageName;
                },
                onComplete: () => {
                    fileObj.element.classList.remove('moving');
                    fileObj.element.classList.add('just-landed');
                    
                    // Cleanup landing class after animation
                    setTimeout(() => {
                        fileObj.element.classList.remove('just-landed');
                    }, 600);

                    gsap.set(fileObj.element, { clearProps: "all" });

                    // Stage Impact Feedback
                    const stageEl = targetContainer.parentElement;
                    stageEl.classList.add('impact');
                    setTimeout(() => stageEl.classList.remove('impact'), 400);

                    if (window.app.wires) window.app.wires.drawPaths();
                    if (window.app.audio) window.app.audio.playMove();
                }
            }
        );
    }
}
