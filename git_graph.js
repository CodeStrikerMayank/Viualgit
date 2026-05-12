class GitGraph {
    constructor(svgId) {
        this.svg = document.getElementById(svgId);
        this.commits = [];
        this.branches = {
            'main': { x: 40, color: '#64ffda', currentY: 40 }
        };
        this.currentBranch = 'main';
        this.nodeRadius = 6;
        this.verticalSpacing = 40;
    }

    addCommit(customId = null) {
        const branch = this.branches[this.currentBranch];
        const commit = {
            id: customId || Math.random().toString(16).slice(2, 8),
            x: branch.x,
            y: branch.currentY,
            branch: this.currentBranch
        };

        // Draw line from previous commit if it exists
        const lastCommit = this.commits.filter(c => c.branch === this.currentBranch).pop();
        if (lastCommit) {
            this.drawLine(lastCommit.x, lastCommit.y, commit.x, commit.y, branch.color);
        } else if (this.currentBranch !== 'main') {
            // New branch - draw line from trunk
            const trunkCommit = this.commits.filter(c => c.branch === 'main').pop();
            if (trunkCommit) {
                this.drawCurve(trunkCommit.x, trunkCommit.y, commit.x, commit.y, branch.color);
            }
        }

        this.drawNode(commit.x, commit.y, branch.color);
        
        this.commits.push(commit);
        branch.currentY += this.verticalSpacing;
        
        this.scrollToBottom();
    }

    addBranch(name) {
        if (this.branches[name]) return;
        
        const branchCount = Object.keys(this.branches).length;
        const trunkCommit = this.commits.filter(c => c.branch === 'main').pop();
        const startY = trunkCommit ? trunkCommit.y + this.verticalSpacing : 40;

        this.branches[name] = {
            x: 40 + (branchCount * 40),
            color: this.getRandomColor(),
            currentY: startY
        };
        this.currentBranch = name;
        this.addCommit(); // First commit on new branch
    }

    addMerge(sourceBranch, targetBranch) {
        const sourceCommit = this.commits.filter(c => c.branch === sourceBranch).pop();
        const targetBranchObj = this.branches[targetBranch];
        
        // Create merge commit on target branch
        const mergeCommit = {
            id: 'merge-' + Math.random().toString(16).slice(2, 6),
            x: targetBranchObj.x,
            y: targetBranchObj.currentY,
            branch: targetBranch
        };

        const prevTargetCommit = this.commits.filter(c => c.branch === targetBranch).pop();
        if (prevTargetCommit) {
            this.drawLine(prevTargetCommit.x, prevTargetCommit.y, mergeCommit.x, mergeCommit.y, targetBranchObj.color);
        }

        // Draw merge curve from source
        if (sourceCommit) {
            this.drawCurve(sourceCommit.x, sourceCommit.y, mergeCommit.x, mergeCommit.y, this.branches[sourceBranch].color);
        }

        this.drawNode(mergeCommit.x, mergeCommit.y, targetBranchObj.color);
        this.commits.push(mergeCommit);
        targetBranchObj.currentY += this.verticalSpacing;
    }

    drawNode(x, y, color) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", x);
        circle.setAttribute("cy", y);
        circle.setAttribute("r", this.nodeRadius);
        circle.setAttribute("fill", color);
        circle.setAttribute("filter", "drop-shadow(0 0 5px " + color + ")");
        
        // Add entrance animation
        circle.style.opacity = "0";
        circle.style.transform = "scale(0)";
        circle.style.transformOrigin = `${x}px ${y}px`;
        circle.style.transition = "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        
        this.svg.appendChild(circle);
        requestAnimationFrame(() => {
            circle.style.opacity = "1";
            circle.style.transform = "scale(1)";
        });
    }

    drawLine(x1, y1, x2, y2, color) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", color);
        line.setAttribute("stroke-width", "2");
        line.setAttribute("stroke-dasharray", "1000");
        line.setAttribute("stroke-dashoffset", "1000");
        
        this.svg.appendChild(line);
        
        // Animate line drawing
        line.style.transition = "stroke-dashoffset 0.8s ease-in-out";
        requestAnimationFrame(() => {
            line.style.strokeDashoffset = "0";
        });
    }

    drawCurve(x1, y1, x2, y2, color) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const d = `M ${x1} ${y1} C ${x1} ${y1 + 20}, ${x2} ${y2 - 20}, ${x2} ${y2}`;
        path.setAttribute("d", d);
        path.setAttribute("stroke", color);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("stroke-dasharray", "1000");
        path.setAttribute("stroke-dashoffset", "1000");
        
        this.svg.appendChild(path);
        
        path.style.transition = "stroke-dashoffset 0.8s ease-in-out";
        requestAnimationFrame(() => {
            path.style.strokeDashoffset = "0";
        });
    }

    getRandomColor() {
        const colors = ['#f472b6', '#fbbf24', '#a78bfa', '#60a5fa', '#34d399'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    scrollToBottom() {
        const container = this.svg.parentElement;
        container.scrollTop = container.scrollHeight;
    }
}
