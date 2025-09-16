# Space Portfolio (Three.js + Vite)

An interactive 3D portfolio scene built with Three.js and Vite. Pilot a spaceship through space, orbit a sun, and visit planets that link to About, Projects, and Contact pages.

## Demo
- Dev server (local): http://localhost:5173

## Tech Stack
- Three.js (WebGL rendering)
- Vite (fast dev server and bundler)

## Quick Start

1) Install dependencies

```bash
npm install
```

2) Start the development server (hot reload)

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

3) Build for production

```bash
npm run build
```

4) Preview the production build

```bash
npm start
```

## Project Structure

```
space/
├─ assets/                # Textures, images
├─ models/                # 3D models (GLB)
├─ planets/               # Static HTML pages (about, contact, projects)
├─ index.html             # Entry HTML
├─ main.js                # Three.js scene, controls, navigation
├─ vite.config.js         # Vite build options (manualChunks for three)
├─ package.json           # Scripts and dependencies
└─ README.md
```

## Features
- Real-time 3D scene using Three.js
- Central sun with lighting and orbiting planets
- Spacecraft GLB model with optional animation support
- Smooth keyboard navigation and inertial movement
- Proximity-based page navigation (fly near a planet to open its page)

## Controls
- Move forward/back: W / S or Arrow Up / Arrow Down
- Rotate left/right: A / D or Arrow Left / Arrow Right
- Vertical nudge: Scroll wheel (short impulse up/down)
- Stop server: Ctrl + C in the terminal

## Assets
- Spaceship model: `models/spaceship.glb`
- Planet textures: `assets/planet1.jpg`, `assets/planet2.jpg`, `assets/planet3.jpg`
- Sun texture (remote): `https://space-assets-1.s3.amazonaws.com/sun_texture.jpg`

If you want to use only local assets, replace the remote sun texture URL in `main.js` with a local file and drop it in `assets/`.

## Notes and Troubleshooting
- Node version: use an active LTS (e.g., 18+). If you hit install/build issues, try updating Node.
- If the dev server doesn’t open automatically, visit http://localhost:5173 manually.
- To expose on your LAN: `npm run dev -- --host`
- Projects page filename: the code redirects to `./planets/project.html` but the file is `projects.html`. Update the path in `main.js` or rename the file to avoid a 404.
- If textures/models do not load, verify relative paths are correct and that the dev server is running via Vite (not file:// URLs).

## License
This project is for personal/portfolio use. Add a license file if you intend to share or open-source.
