# Git Odyssey // Neural Command Center

**Git Odyssey** is an interactive, cinematic Git workflow visualizer equipped with Neural AI assistance. It is designed to demystify version control through real-time state visualization and automated pipeline execution.

## 🚀 Features

* **Real-time Visualization:** Watch files move between the Working Directory, Staging Area, Local Repository, and Remote Repository.
* **Neural Shell v2.1:** A premium CRT-cinematic terminal with a rich prompt (`odyssey@neural:~/project [main] $`), live status bar (branch, process, clock), and categorized logging.
* **Cinematic Screen Play:** The background intelligently dims (`.cinematic-dim`) while the terminal is actively typing commands, focusing your attention on the execution flow.
* **Info Modal:** A sleek, glassmorphism modal providing system details and versioning, keeping the main header compact and clutter-free to ensure a perfect single-screen fit.
* **Neural Pipeline:** Click the 'Engage' button to watch the AI autonomously execute complex Git workflows (`add`, `commit`, `push`) complete with real-time progress bars.

## 🎨 UI/UX Improvements (v2.1)

Recent updates focused on optimizing the interface for a seamless, cinematic experience:

1. **Single Frame Layout:** The header was condensed and the layout bound to `100vh` to prevent vertical scrolling. Everything fits perfectly on one screen.
2. **Compact Header:** The large titles were moved into an `Info` modal, leaving a sleek header bar with essential actions.
3. **Cinematic Dimming:** Added a dynamic blur and dim effect to the stage containers whenever the terminal is actively processing a command.
4. **Enhanced Typewriter Effect:** The terminal typing speed now varies to mimic realistic human/AI input bursts and pauses.

## 💻 Tech Stack

* **Frontend:** Vanilla JavaScript, HTML5, CSS3
* **Animation:** GSAP 3 (GreenSock Animation Platform)
* **Design Aesthetic:** Glassmorphism, Neon Cyberpunk, Dark Mode

## 🛠️ Usage

1. Open `index.html` in your modern web browser.
2. Click **+ New Source File** to create a file in the Working Directory.
3. Click the **Engage (Play)** button in the top header to trigger the Neural Flow pipeline.
4. Watch the terminal execute the commands while the files animate through the Git stages.

## 👨‍💻 Creator
Built to elevate Git education through high-fidelity visual feedback and cinematic design.
