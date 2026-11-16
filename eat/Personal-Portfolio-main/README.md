<div align="center">

  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People/Man%20Technologist%20Light%20Skin%20Tone.png" width="120" />

  # 3D Interactive Portfolio
  
  **A high-performance, immersive personal portfolio built for the modern web.**

  <p>
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-customization-guide">Customization Guide</a>
  </p>

  ![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)
  ![Three.js](https://img.shields.io/badge/Three.js-Black?style=for-the-badge&logo=three.js)
  ![Framer Motion](https://img.shields.io/badge/Framer_Motion-Motion-purple?style=for-the-badge&logo=framer)
  ![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

</div>

<br />

## 🌟 Overview

This project is a React-based portfolio template designed to stand out. It combines **3D interactive elements**, **glassmorphism UI**, and **fluid animations** to create an engaging user experience. It is fully responsive, accessible, and easily customizable for developers looking to showcase their work.

## ✨ Features

- **🎨 Immersive 3D Avatar**: Features a mouse-tracking 3D component using `@react-three/fiber` that brings the landing page to life.
- **🌗 Dynamic Theming**: Built-in Dark and Light mode with persistent state storage and smooth CSS transitions.
- **💨 Glassmorphism UI**: Modern aesthetic utilizing backdrop filters, semi-transparent layers, and vibrant background meshes.
- **📱 Fully Responsive**: Optimized touch controls and layouts for mobile, tablet, and desktop devices.
- **🎮 Built-in Minigames**:
  - **Memory Match**: A fully functional card flipping game.
  - **Snake**: A classic retro snake game optimized for React.
- **⚡ High Performance**: Utilizing `framer-motion` for hardware-accelerated animations and optimized assets.

## 🛠 Tech Stack

| Domain | Technology |
| :--- | :--- |
| **Core** | React 18, TypeScript |
| **Styling** | Tailwind CSS (v3.4) |
| **3D Engine** | Three.js, React Three Fiber, Drei |
| **Animations** | Framer Motion |
| **Icons** | Lucide React |
| **Routing** | React Router DOM v6 |

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/menansali/Personal-Portfolio.git
   cd Personal-Portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm start
   # or
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

---

## 🎨 Customization Guide

This portfolio is architected to be easily adaptable. Here is a map of where to change specific content:

### 1. Personal Information (Bio, Experience, Education)
Navigate to `pages/DetailPage.tsx`.
Look for the `contentMap` object.
- **About Me**: Edit the `PageType.Me` section.
- **Contact Info**: Edit the `PageType.Contact` section.

### 2. Projects
Navigate to `pages/DetailPage.tsx` and find the `ProjectsSection` component.
Update the array inside the component:
```typescript
{
  title: "Your Project Name",
  desc: "Description of what it does...",
  stack: ["React", "Node.js"],
  url: "https://github.com/yourusername/project"
}
```

### 3. Skills
Navigate to `pages/DetailPage.tsx` inside `contentMap[PageType.Skills]`.
Modify the categories and items arrays to match your expertise.

### 4. 3D Avatar Image
Navigate to `components/Avatar3D.tsx`.
Locate the `<AvatarImage />` component and change the `src` URL:
```jsx
<img 
  src="https://your-image-url.com/avatar.png" 
  alt="Avatar"
  // ...
/>
```
*Tip: Use a transparent PNG for the best effect.*

### 5. Social Links
- **GitHub Star Button**: Update the link in `components/Header.tsx`.
- **LinkedIn/Email**: Update the links and text in the `ContactSection` component within `pages/DetailPage.tsx`.

### 6. Colors & Fonts
The styling is handled via Tailwind CSS.
- **Global Config**: Edit the `tailwind.config` script block inside `index.html`.
- **Background Gradient**: Edit `components/BackgroundEffect.tsx` to change the glowing orb colors.

## 📂 Project Structure

```bash
├── components/          # Reusable UI components
│   ├── Avatar3D.tsx     # Three.js canvas setup
│   ├── MemoryGame.tsx   # Logic for the memory game
│   ├── SnakeGame.tsx    # Logic for the snake game
│   └── ...
├── pages/
│   ├── Home.tsx         # Landing page
│   └── DetailPage.tsx   # Handles Me, Projects, Skills, Contact views
├── App.tsx              # Routing and Theme State
├── types.ts             # TypeScript definitions
└── index.html           # Entry point & Tailwind Config
```

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<br />

<div align="center">
  <sub>Built with ❤️ by Menan Sali</sub>
</div>
