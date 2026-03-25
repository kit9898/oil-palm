# PalmArchitect React Frontend

This is the high-fidelity React dashboard for the Oil Palm Detection project. It is built using **Vite** and **Tailwind CSS**.

## 📦 Installation
1. Install the required Node.js packages:
   ```bash
   npm install
   ```

## 🚀 Running the App
Start the development server:
```bash
npm run dev
```

## 📂 Folder Structure
- `/src/views/`: 
  - `UploadView.jsx`: Initial landing page for image selection and confidence setting.
  - `ProcessingOverlay.jsx`: Sophisticated glassmorphism loader shown during AI inference.
  - `ResultsView.jsx`: Interactive dashboard showing the detection count, confidence, and annotated image.
- `/src/App.jsx`: Main entry point and state coordinator (manages API calls).
- `/src/index.css`: Global styles including custom Google Font (Inter) and Tailwind primitives.

## 🛰️ API Configuration
The frontend communicates with the backend at `http://localhost:8000`. 
If your backend is running on a different IP (e.g., a standalone Jetson), you must update the `fetch()` URL in `src/App.jsx`.

## 🛠️ Tech Stack
- **React 19**
- **Vite 8** (Lightning-fast builds)
- **Tailwind CSS 3** (Styling)
- **Material Symbols** (Iconology)
- **Google Fonts** (Typography)
