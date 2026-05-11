class Autopilot {
    constructor() {
        this.isRunning = false;
    }

    async start() {
        if (this.isRunning) return;
        this.isRunning = true;
        
        const term = window.app.terminal;
        const renderer = window.app.renderer;
        const graph = window.app.graph;

        // Sequence 1: Initial Commit on Main
        term.log("Initializing project...", "info");
        renderer.addFile();
        await this.sleep(1000);
        
        await term.type("git add .");
        await renderer.moveAll('working', 'staging');
        
        await term.type("git commit -m \"initial commit\"");
        await renderer.moveAll('staging', 'local');
        graph.addCommit();
        await this.sleep(1000);

        // Sequence 2: Branching out
        await term.type("git checkout -b feature/ui-overhaul");
        term.log("Switched to a new branch 'feature/ui-overhaul'", "success");
        graph.addBranch("feature/ui-overhaul");
        await this.sleep(1500);

        // Sequence 3: Work on Feature Branch
        renderer.addFile();
        await this.sleep(800);
        await term.type("git add .");
        await renderer.moveAll('working', 'staging');
        
        await term.type("git commit -m \"feat: add new visual layers\"");
        await renderer.moveAll('staging', 'local');
        graph.addCommit();
        await this.sleep(1000);

        // Sequence 4: Push Feature
        await term.type("git push origin feature/ui-overhaul");
        await renderer.moveAll('local', 'remote');
        term.log("Branch 'feature/ui-overhaul' set up to track remote", "success");
        
        term.log("Autopilot sequence completed. Look at that beautiful Git Tree!", "success");
        this.isRunning = false;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
