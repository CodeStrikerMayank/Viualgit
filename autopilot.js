class Autopilot {
    constructor() {
        this.isRunning = false;
    }

    async start(mode) {
        if (this.isRunning) return;
        this.isRunning = true;
        
        if (mode === 'advanced') {
            await this.startAdvanced();
        } else {
            await this.startBasic();
        }
        
        this.isRunning = false;
    }

    async startBasic() {
        const { terminal: term, renderer, graph, wires, camera, audio } = window.app;

        await term.typewriterLog("Starting Basic Mission...", "info");
        renderer.addFile();
        await this.sleep(1000);
        
        await term.type("git add .");
        camera.panToStage('staging-area');
        wires.firePulse('working-directory', 'staging-area');
        audio.playMove();
        await renderer.moveAll('working', 'staging');
        
        await term.type("git commit -m \"basic update\"");
        camera.panToStage('local-repo');
        wires.firePulse('staging-area', 'local-repo');
        audio.playMove();
        await renderer.moveAll('staging', 'local');
        graph.addCommit();
        
        await term.type("git push origin main");
        camera.panToStage('remote-repo');
        wires.firePulse('local-repo', 'remote-repo');
        audio.playMove();
        await renderer.moveAll('local', 'remote');
        audio.playSuccess();
        await term.typewriterLog("Basic mission completed.", "success");
        camera.reset();
    }

    async startAdvanced() {
        const { terminal: term, renderer, graph, wires, camera, audio, particles } = window.app;

        await term.typewriterLog("Starting Advanced Mission: The Feature Flow", "info");
        
        // 1. Initial State
        renderer.addFile();
        await term.type("git add .");
        camera.panToStage('staging-area');
        wires.firePulse('working-directory', 'staging-area');
        audio.playMove();
        await renderer.moveAll('working', 'staging');
        await term.type("git commit -m \"chore: setup project\"");
        camera.panToStage('local-repo');
        wires.firePulse('staging-area', 'local-repo');
        audio.playMove();
        await renderer.moveAll('staging', 'local');
        graph.addCommit();
        await this.sleep(1000);

        // 2. Pull Remote Changes
        await term.type("git pull origin main");
        camera.panToStage('local-repo');
        wires.firePulse('remote-repo', 'local-repo');
        audio.playMove();
        await term.typewriterLog("Remote: updating a2b3c4d..e5f6g7h", "info");
        graph.addCommit(); 
        await this.sleep(1500);

        // 3. Branching
        await term.type("git checkout -b feat/advanced-visuals");
        graph.addBranch("feat/advanced-visuals");
        await this.sleep(1000);

        // 4. Feature Work
        renderer.addFile();
        await term.type("git add .");
        camera.panToStage('staging-area');
        wires.firePulse('working-directory', 'staging-area');
        audio.playMove();
        await renderer.moveAll('working', 'staging');
        await term.type("git commit -m \"feat: implement data wires\"");
        camera.panToStage('local-repo');
        wires.firePulse('staging-area', 'local-repo');
        audio.playMove();
        await renderer.moveAll('staging', 'local');
        graph.addCommit();
        await this.sleep(1500);

        // 5. Merging back to Main
        await term.type("git checkout main");
        graph.currentBranch = 'main';
        await this.sleep(1000);
        
        await term.type("git merge feat/advanced-visuals");
        await term.typewriterLog("Fast-forward merge completed.", "success");
        graph.addMerge("feat/advanced-visuals", "main");
        await this.sleep(1500);

        // 6. Push All (THE CLIMAX)
        await term.type("git push origin main");
        camera.panToStage('remote-repo');
        if (particles) particles.overload();
        wires.firePulse('local-repo', 'remote-repo');
        audio.playMove();
        await renderer.moveAll('local', 'remote');
        audio.playSuccess();
        await term.typewriterLog("Advanced mission completed. Masterpiece status reached.", "success");
        camera.reset();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
