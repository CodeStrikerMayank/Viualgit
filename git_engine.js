class GitEngine {
    constructor() {
        this.history = [];
        this.stagingArea = new Set();
        this.workingDirectory = new Set();
        this.stash = [];
        this.branches = { 'main': { head: null, color: '#64ffda' } };
        this.currentBranch = 'main';
        this.head = null;
        this.remoteHead = null;
    }

    createFile(name, customId) {
        const file = { name, id: customId || Math.random().toString(36).substr(2, 9), content: '', status: 'untracked' };
        this.workingDirectory.add(file);
        return file;
    }

    stageFile(fileId) {
        const file = Array.from(this.workingDirectory).find(f => f.id === fileId);
        if (file) {
            file.status = 'staged';
            this.stagingArea.add(file);
            this.workingDirectory.delete(file);
        }
    }

    commit(message) {
        if (this.stagingArea.size === 0) return null;
        
        const commit = {
            hash: Math.random().toString(16).substr(2, 7),
            message,
            parent: this.branches[this.currentBranch].head,
            timestamp: Date.now(),
            files: Array.from(this.stagingArea).map(f => ({...f, status: 'committed'}))
        };

        this.history.push(commit);
        this.branches[this.currentBranch].head = commit.hash;
        this.stagingArea.clear();
        return commit;
    }

    createBranch(name) {
        if (this.branches[name]) return false;
        this.branches[name] = {
            head: this.branches[this.currentBranch].head,
            color: this.getRandomColor()
        };
        return true;
    }

    checkout(branchName) {
        if (!this.branches[branchName]) return false;
        this.currentBranch = branchName;
        return true;
    }

    stashPush() {
        if (this.workingDirectory.size === 0 && this.stagingArea.size === 0) return false;
        const snapshot = {
            working: Array.from(this.workingDirectory),
            staging: Array.from(this.stagingArea),
            timestamp: Date.now()
        };
        this.stash.push(snapshot);
        this.workingDirectory.clear();
        this.stagingArea.clear();
        return true;
    }

    stashPop() {
        if (this.stash.length === 0) return false;
        const snapshot = this.stash.pop();
        snapshot.working.forEach(f => this.workingDirectory.add(f));
        snapshot.staging.forEach(f => this.stagingArea.add(f));
        return true;
    }

    fetch() {
        // Simulate remote update
        this.remoteHead = Math.random().toString(16).substr(2, 7);
        return this.remoteHead;
    }

    merge(sourceBranch) {
        const sourceHead = this.branches[sourceBranch].head;
        const targetHead = this.branches[this.currentBranch].head;
        if (!sourceHead || sourceHead === targetHead) return false;
        
        const mergeCommit = {
            hash: Math.random().toString(16).substr(2, 7),
            message: `Merge branch '${sourceBranch}' into ${this.currentBranch}`,
            parent: [targetHead, sourceHead],
            timestamp: Date.now(),
            files: [] // Simplified for demo
        };
        
        this.history.push(mergeCommit);
        this.branches[this.currentBranch].head = mergeCommit.hash;
        return mergeCommit;
    }

    rebase(targetBranch) {
        if (!this.branches[targetBranch]) return false;
        this.branches[this.currentBranch].head = this.branches[targetBranch].head;
        return true;
    }

    reset() {
        if (this.history.length === 0) return false;
        this.history.pop();
        if (this.history.length > 0) {
            this.branches[this.currentBranch].head = this.history[this.history.length - 1].hash;
        } else {
            this.branches[this.currentBranch].head = null;
        }
        return true;
    }

    revert() {
        if (this.history.length === 0) return false;
        const lastCommit = this.history[this.history.length - 1];
        // Inject a dummy change to satisfy the commit requirement
        this.stagingArea.add({ name: `revert_${lastCommit.hash.substring(0,4)}`, id: Math.random().toString(), status: "staged" });
        return this.commit(`Revert "${lastCommit.message}"`);
    }

    cherryPick(hash) {
        const commit = this.history.find(c => c.hash === hash);
        if (!commit) return false;
        this.stagingArea.add({ name: `cherry_${hash.substring(0,4)}`, id: Math.random().toString(), status: "staged" });
        return this.commit(`Cherry-pick ${hash}`);
    }

    getRandomColor() {
        const colors = ['#f472b6', '#fbbf24', '#a78bfa', '#60a5fa', '#34d399'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}
