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

        // Ensure we wait for the stagger delay
        if (delay > 0) await new Promise(r => setTimeout(r, delay));

        const startRect = fileObj.element.getBoundingClientRect();
        
        // Change DOM parent
        fileObj.element.classList.add('moving');
        targetContainer.appendChild(fileObj.element);
        
        const endRect = fileObj.element.getBoundingClientRect();
        
        // Calculate delta for "inverse" animation (FLIP technique)
        const deltaX = startRect.left - endRect.left;
        const deltaY = startRect.top - endRect.top;
        
        // GSAP Implementation for Silk-Smooth Rendering
        gsap.fromTo(fileObj.element, 
            { x: deltaX, y: deltaY, scale: 1.05, opacity: 0.8 },
            { 
                duration: 0.7, 
                x: 0, 
                y: 0, 
                scale: 1, 
                opacity: 1,
                ease: "back.out(1.2)",
                onStart: () => {
                    fileObj.stage = targetStageName; // Ensure stage is set to final
                },
                onComplete: () => {
                    fileObj.element.classList.remove('moving');
                    gsap.set(fileObj.element, { clearProps: "all" });

                    // Visual impact on the stage container
                    const stageEl = targetContainer.parentElement;
                    gsap.to(stageEl, {
                        duration: 0.1,
                        y: 2,
                        repeat: 1,
                        yoyo: true,
                        onComplete: () => gsap.set(stageEl, { clearProps: "transform" })
                    });

                    if (window.app.wires) window.app.wires.drawPaths();
                }
            }
        );
    }
}
