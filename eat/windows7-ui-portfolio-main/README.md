<div align="center">
  <img src="public/win7/Windows%20Defender/MsMpRes_103.ico" alt="Logo" width="80" height="80">
  <h3 align="center">Win7 Web Portfolio</h3>

  <p align="center">
    A nostalgic, fully functional Windows 7 clone in the browser built to showcase advanced frontend engineering.
    <br />
    <a href="https://windows7-ui-portfolio-e2sz.vercel.app"><strong>View Demo »</strong></a>
    <br />
  </p>
</div>

---

## 🚀 About The Project

This project is an interactive developer portfolio designed to replicate the classic Windows 7 desktop environment. It serves as a technical showcase of complex state management, custom UI engineering, and modern web development practices.

Instead of a standard scrolling website, visitors can explore my experience and projects by interacting with a fully functional operating system within their browser.

### ✨ Key Features

* **Custom Window Manager:** Complete windowing system supporting dragging, resizing, maximizing, minimizing, and Z-index stacking (bringing windows to front).
* **Global State Management:** Powered by Zustand to seamlessly manage the taskbar, open applications, and desktop icons.
* **Classic Applications Built from Scratch:**
  * 🃏 **Solitaire:** Fully playable card game with Fisher-Yates shuffling, drag-and-drop validation, and win detection.
  * ♟️ **Chess:** Interactive chess engine with a playable AI opponent.
  * 🎨 **MS Paint:** A functional drawing canvas supporting colors, brush sizes, and erasing.
  * 📄 **Wordpad (Resume):** A rich-text styled viewer for my professional resume.
  * 📁 **Windows Explorer:** A file manager interface showcasing my GitHub projects.
* **Authentic Aero UI:** Pixel-perfect CSS styling, complete with start menu animations, taskbar previews, and system tray functionalities.
* **Performance Optimized:** Built on Next.js with strict TypeScript typing, ensuring zero cascading renders and fast load times.

### 🛠️ Built With

* [Next.js (App Router)](https://nextjs.org/)
* [React 19](https://reactjs.org/)
* [TypeScript](https://www.typescriptlang.org/)
* [Zustand](https://github.com/pmndrs/zustand) (State Management)
* [Lucide React](https://lucide.dev/) (Icons)

---

## 💻 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Node.js (v18.17 or higher recommended)
* npm or yarn

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/elladeniya-dev/windows7-ui-portfolio.git
   ```
2. Navigate to the project directory
   ```sh
   cd winxp-portfolio
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Start the development server
   ```sh
   npm run dev
   ```
5. Open your browser and visit `http://localhost:3000`

---

## 📂 Project Structure

* `/app` - Next.js routing, layouts, and global CSS.
* `/components/desktop` - Core OS components (Taskbar, Start Menu, Window Manager, Icons).
* `/components/apps` - Individual application components (Solitaire, Paint, Internet Explorer, etc.).
* `/store` - Zustand stores for managing global desktop state.
* `/public` - Static assets, sounds, and authentic Windows 7 icons.

---

## 👨‍💻 About Me

**Gividu Elladeniya** - *Full-Stack Developer*

I am a dedicated Full-Stack Developer and Information Technology undergraduate with a passion for building scalable, secure, and user-focused web applications.

* [LinkedIn](https://www.linkedin.com/in/gividuelladeniya)
* [GitHub](https://github.com/elladeniya-dev)

---

## ⚠️ Disclaimer

This is a fan-made, open-source portfolio project and is **not** affiliated with, endorsed by, or sponsored by Microsoft Corporation. 

Windows, the Windows logo, and classic application designs are registered trademarks of Microsoft Corporation. All icons and sound assets belong to their respective owners and are used here purely for non-commercial, educational, and portfolio demonstration purposes.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information. (Note: This license applies only to the source code written for this project, not to any Microsoft trademarks or assets).