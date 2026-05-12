class AIController {
    constructor() {
        this.isRunning = false;
        this.stopRequested = false;
        this.currentMission = 'basic';
        this.config = {
            speed: 5,
            teachingMode: false
        };
        this.pipelines = {
            basic: ['add', 'commit', 'push'],
            moderate: ['branch', 'add', 'commit', 'merge', 'push'],
            advanced: ['fetch', 'pull', 'stash', 'branch', 'add', 'commit', 'pop', 'merge', 'push']
        };
        this.explanations = {
            add: "Moves changes from the Working Directory to the Staging Area. It tells Git which files you want to include in the next snapshot.",
            commit: "Saves the staged snapshot to the Local Repository. It creates a permanent record of your changes with a unique hash.",
            push: "Uploads your Local Repository commits to a Remote Repository (like GitHub), sharing your work with others.",
            fetch: "Downloads metadata from the Remote Repository. It updates your local record of what's happening on the server without changing your files.",
            pull: "Combination of 'fetch' and 'merge'. It downloads changes from the remote server and integrates them directly into your current branch.",
            branch: "Creates a new parallel line of development. This allows you to work on new features without breaking the main code.",
            merge: "Combines history from two branches. Usually used to bring a finished feature branch back into the 'main' branch.",
            stash: "Temporarily 'hides' your uncommitted changes. This gives you a clean working directory so you can switch tasks quickly.",
            pop: "Restores your stashed changes. Use this when you're ready to continue working on what you temporarily hid.",
            checkout: "Switches the current branch HEAD to a different branch or commit.",
            rebase: "Moves the base of your current branch onto another branch, creating a cleaner, linear history.",
            reset: "Undoes changes by moving the branch pointer back to a previous commit.",
            revert: "Creates a NEW commit that exactly undoes a previous commit, keeping the history safe and visible.",
            cherry: "Selects a specific commit from one branch and 'pastes' it onto your current branch."
        };
        this.waitingForStep = false;
        this.workingLogs = {
            'add': ["Scanning working directory...", "Detecting file changes...", "Generating index entries...", "Verifying file integrity...", "Staging blobs to index...", "Index updated successfully."],
            'commit': ["Parsing staging area...", "Calculating tree hashes...", "Creating tree objects...", "Generating commit metadata...", "Writing commit object...", "Updating branch HEAD pointer...", "Commit finalized."],
            'push': ["Connecting to remote origin...", "Establishing secure synapse...", "Verifying remote credentials...", "Calculating object deltas...", "Compressing packfiles (100%)...", "Writing remote refs...", "Remote synchronized."],
            'pull': ["Fetching metadata from origin...", "Negotiating common commits...", "Unpacking remote objects...", "Scanning for merge conflicts...", "Auto-merging changes into local...", "Local repository updated."],
            'branch': ["Analyzing repository history...", "Allocating new branch pointer...", "Mapping neural fork path...", "Validating branch name...", "Branch reference established."],
            'merge': ["Identifying common ancestor...", "Calculating three-way merge...", "Applying recursive strategy...", "Resolving delta overlaps...", "Writing merge tree...", "Merge commit generated."],
            'stash': ["Capturing local state snapshot...", "Serializing modified files...", "Pushing to stash neural-stack...", "Clearing working tree...", "Workspace stabilized."],
            'pop': ["Retrieving stash index...", "Replaying serialized changes...", "Merging with working tree...", "Cleaning up stash stack...", "Stash reapplied."],
            'rebase': ["Rewinding branch history...", "Identifying divergent commits...", "Replaying commits onto target base...", "Resolving upstream conflicts...", "Linear history reconstructed."],
            'checkout': ["Searching for branch reference...", "Updating index and working tree...", "Synchronizing local state...", "Switched to target branch."]
        };
        this.initUI();
    }

    initUI() {
        // Protocol selection
        document.querySelectorAll('.mission-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mission-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentMission = btn.dataset.pipeline;
            });
        });

        // Config inputs
        const speedInput = document.getElementById('ai-speed');
        if (speedInput) {
            speedInput.addEventListener('input', (e) => {
                this.config.speed = parseInt(e.target.value);
            });
        }

        const teachingToggle = document.getElementById('ai-teaching');
        if (teachingToggle) {
            teachingToggle.addEventListener('change', (e) => {
                this.config.teachingMode = e.target.checked;
                this.updateExplanation("Teaching Mode Activated", "Engagement will now pause after each command. Press ENTER in the terminal to proceed.");
            });
        }

        // Global Enter key for Teaching Mode
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.waitingForStep) {
                this.waitingForStep = false;
            }
        });

        // Master Engage Button
        const masterEngage = document.getElementById('master-engage-btn');
        if (masterEngage) {
            masterEngage.addEventListener('click', () => {
                if (this.isRunning) {
                    this.stopRequested = true;
                    masterEngage.classList.remove('running');
                } else {
                    this.execute();
                }
            });
        }

        // Execute Button in Modal
        const execBtn = document.getElementById('execute-neural-btn');
        if (execBtn) {
            execBtn.addEventListener('click', () => {
                if (this.isRunning) {
                    this.stopRequested = true;
                    execBtn.textContent = "Stopping...";
                } else {
                    this.execute();
                }
            });
        }

        const clearBtn = document.getElementById('clear-sequence-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                window.app.terminal.log("System reset requested...", "info");
                location.reload();
            });
        }
    }

    updateExplanation(cmd, text) {
        const title = document.getElementById('expl-cmd-name');
        const body = document.getElementById('expl-content');
        if (title) title.textContent = cmd.toUpperCase();
        if (body) body.textContent = text;
        
        const overlay = document.getElementById('ai-insight-overlay');
        if (overlay) {
            overlay.style.display = 'block';
            gsap.fromTo(overlay, 
                { borderColor: '#fff', boxShadow: '0 0 20px rgba(255,255,255,0.5)' }, 
                { borderColor: 'var(--glass-border)', boxShadow: '0 0 10px rgba(0,0,0,0.3)', duration: 0.8 }
            );
        }
    }

    async execute() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.stopRequested = false;
        
        const execBtn = document.getElementById('execute-neural-btn');
        const masterEngage = document.getElementById('master-engage-btn');
        const teachPrompt = document.getElementById('teaching-prompt');
        const sequence = this.pipelines[this.currentMission];

        if (execBtn) {
            execBtn.textContent = "Stop Neural Flow";
            execBtn.style.background = "#ff5f56";
        }
        if (masterEngage) masterEngage.classList.add('running');
        
        document.getElementById('neural-modal').classList.remove('active');
        document.body.classList.remove('modal-open');
        
        const { terminal: term, audio, particles, camera } = window.app;
        term.log(`>> MISSION INITIATED: ${this.currentMission.toUpperCase()} <<`, "success");

        const delay = (11 - this.config.speed) * 200;
        let i = 0;

        for (const cmd of sequence) {
            if (this.stopRequested) break;
            
            // Show Explanation
            this.updateExplanation(cmd, this.explanations[cmd] || "No documentation found for this synapse.");

            if (this.config.teachingMode) {
                if (teachPrompt) teachPrompt.style.display = 'block';
                term.log(`[TEACHING] Awaiting command release: ${cmd.toUpperCase()}`, "info");
                this.waitingForStep = true;
                while (this.waitingForStep && !this.stopRequested) {
                    await new Promise(r => setTimeout(r, 100));
                }
                if (teachPrompt) teachPrompt.style.display = 'none';
            }

            if (this.stopRequested) break;

            term.log(`[STEP ${i + 1}/${sequence.length}] Executing: ${cmd.toUpperCase()}`, "info");
            await this.runDirective(cmd);
            await new Promise(r => setTimeout(r, delay));
            i++;
        }

        term.log(">> MISSION COMPLETED <<", "success");
        this.updateExplanation("Protocol Terminated", "All neural synapses successfully fired. System stabilized.");
        particles.overload();
        audio.playSuccess();
        camera.reset();
        
        this.isRunning = false;
        this.stopRequested = false;
        if (execBtn) {
            execBtn.textContent = "Engage Neural Flow";
            execBtn.style.background = "var(--accent)";
        }
        if (masterEngage) {
            masterEngage.classList.remove('running');
            masterEngage.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
        }
    }

    async runDirective(cmd) {
        const { terminal: term, renderer, graph, wires, ui, audio, git } = window.app;

        // Determine actual git command string
        let gitCmdString = "";
        switch(cmd) {
            case 'add': gitCmdString = "git add ."; break;
            case 'commit': gitCmdString = `git commit -m "neural sync"`; break;
            case 'push': gitCmdString = `git push origin ${graph.currentBranch}`; break;
            case 'pull': gitCmdString = `git pull origin ${graph.currentBranch}`; break;
            case 'fetch': gitCmdString = "git fetch origin"; break;
            case 'stash': gitCmdString = "git stash"; break;
            case 'pop': gitCmdString = "git stash pop"; break;
            case 'rebase': gitCmdString = "git rebase main"; break;
            case 'reset': gitCmdString = "git reset --hard HEAD~1"; break;
            case 'revert': gitCmdString = "git revert HEAD"; break;
            default: gitCmdString = `git ${cmd}`; break;
        }

        // Type the command first
        await term.type(gitCmdString);

        // Then output working logs
        const logs = this.workingLogs[cmd] || ["Executing neural command...", "Processing neural pathways...", "Command complete."];
        for (const log of logs) {
            await term.typewriterLog(log, log.match(/success|complete|finalized|established|generated|updated|synchronized|stabilized|reapplied|reconstructed/) ? 'success' : 'info');
            await new Promise(r => setTimeout(r, 100 + Math.random() * 200));
        }

        switch(cmd) {
            case 'add':
                if (renderer.files.filter(f => f.stage === 'working').length === 0) {
                    renderer.addFile();
                }
                const workingFiles = renderer.files.filter(f => f.stage === 'working');
                if (workingFiles.length > 0) {
                    workingFiles.forEach(f => git.stageFile(f.id));
                    wires.firePulse('working-directory', 'staging-area');
                    audio.playMove();
                    await renderer.moveAll('working', 'staging');
                }
                break;
            case 'commit':
                if (git.stagingArea.size === 0) {
                    term.typewriterLog(">> SMART ASSIST: Auto-staging files for commit <<", "info");
                    await this.runDirective('add');
                }
                const commit = git.commit("neural sync");
                if (commit) {
                    wires.firePulse('staging-area', 'local-repo');
                    audio.playMove();
                    await renderer.moveAll('staging', 'local');
                    graph.addCommit(commit.hash);
                } else {
                    term.typewriterLog("Nothing to commit", "info");
                }
                break;
            case 'push':
                if (graph.commits.length === 0) {
                    term.typewriterLog(">> SMART ASSIST: Creating commit before push <<", "info");
                    await this.runDirective('commit');
                }
                wires.firePulse('local-repo', 'remote-repo');
                audio.playMove();
                await renderer.moveAll('local', 'remote');
                break;
            case 'pull':
                wires.firePulse('remote-repo', 'local-repo');
                audio.playMove();
                term.typewriterLog("Remote changes integrated", "success");
                graph.addCommit();
                break;
            case 'fetch':
                wires.firePulse('remote-repo', 'local-repo');
                audio.playMove();
                term.typewriterLog("Remote refs updated", "info");
                break;
            case 'branch':
                const bName = "feat-" + Math.floor(Math.random()*1000);
                git.createBranch(bName);
                graph.addBranch(bName);
                ui.updateBranch(bName);
                break;
            case 'checkout':
                const branches = Object.keys(git.branches);
                const target = branches[Math.floor(Math.random() * branches.length)];
                git.checkout(target);
                graph.currentBranch = target;
                ui.updateBranch(target);
                break;
            case 'merge':
                if (graph.currentBranch !== 'main') {
                    const source = graph.currentBranch;
                    graph.currentBranch = 'main';
                    ui.updateBranch('main');
                    graph.addMerge(source, 'main');
                    term.typewriterLog(`Merged ${source} into main`, "success");
                } else {
                    term.typewriterLog("Already on main branch", "info");
                }
                break;
            case 'stash':
                if (git.stashPush()) {
                    audio.playMove();
                    renderer.files.forEach(f => {
                        if (f.stage === 'working' || f.stage === 'staging') {
                            gsap.to(f.element, { opacity: 0, scale: 0.5, duration: 0.4 });
                        }
                    });
                    term.typewriterLog("Changes stashed", "info");
                } else {
                    term.typewriterLog(">> SMART ASSIST: Creating files to stash <<", "info");
                    renderer.addFile();
                    await this.runDirective('stash');
                }
                break;
            case 'pop':
                if (git.stashPop()) {
                    audio.playMove();
                    renderer.files.forEach(f => {
                        if (f.stage === 'working' || f.stage === 'staging') {
                            gsap.to(f.element, { opacity: 1, scale: 1, duration: 0.4 });
                        }
                    });
                    term.typewriterLog("Stash popped", "success");
                } else {
                    term.typewriterLog("No stash entries found", "error");
                }
                break;
            case 'rebase':
                if (git.rebase('main')) {
                    term.typewriterLog("Rebased onto main", "success");
                    graph.addCommit(); 
                }
                break;
            case 'reset':
                if (git.reset()) {
                    term.typewriterLog("Reset to previous commit", "success");
                    audio.playType();
                } else {
                    term.typewriterLog("Nothing to reset", "error");
                }
                break;
            case 'revert':
                if (git.revert()) {
                    term.typewriterLog("Reverted previous commit", "success");
                    wires.firePulse('staging-area', 'local-repo');
                    audio.playMove();
                    await renderer.moveAll('staging', 'local');
                    graph.addCommit();
                } else {
                    term.typewriterLog("Nothing to revert", "error");
                }
                break;
            case 'cherry':
                const history = git.history;
                if (history.length > 0) {
                    const hash = history[Math.floor(Math.random() * history.length)].hash;
                    if (git.cherryPick(hash)) {
                        term.typewriterLog(`Cherry-picked ${hash}`, "success");
                        wires.firePulse('staging-area', 'local-repo');
                        audio.playMove();
                        await renderer.moveAll('staging', 'local');
                        graph.addCommit();
                    }
                } else {
                    term.typewriterLog("No commits to cherry-pick", "error");
                }
                break;
        }
    }
}
