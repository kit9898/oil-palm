# Oil Palm Detection Project

An advanced precision agriculture system that uses computer vision (RetinaNet) to detect and count oil palm trees from aerial imagery. The project features a modern React (Vite + Tailwind) dashboard and a robust FastAPI backend running on NVIDIA Jetson hardware.

## 🚀 Project Architecture

- **Frontend**: React-based "Palm Architect" dashboard for uploading images, configuring confidence thresholds, and visualizing detected palms with interactive results.
- **Backend**: FastAPI server (`api/`) that coordinates file storage, invokes the AI model container, and serves processed results.
- **AI Inference**: A Dockerized RetinaNet model (`optimal-ipb-jetson`) optimized for NVIDIA Jetson GPU (Orin Nano / NX).

---

## 🛠️ Setup and Installation

### 1. Prerequisites
- **Hardware**: NVIDIA Jetson (with JetPack 5.x+) or a Linux machine with NVIDIA GPU.
- **Software**: Docker with NVIDIA Container Toolkit installed.
- **Permissions**: Add your user to the docker group:
  ```bash
  sudo usermod -aG docker $USER
  # IMPORTANT: Log out and back in for the change to take effect!
  ```

### 2. Backend Setup
1. Navigate to the project root:
   ```bash
   pip install -r api/requirements.txt
   ```
2. Start the FastAPI server (it runs on port 8000 by default):
   ```bash
   uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
   ```

### 3. Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   npm install
   ```
2. Start the development server (runs on port 5173 by default):
   ```bash
   npm run dev
   ```

---

## 🛰️ How to Use

1. **Upload**: Open the dashboard at `http://localhost:5173`. Select or drag-and-drop a high-resolution aerial `.jpg`.
2. **Configure**: Use the slider to set the **AI Confidence Threshold** (usually 0.5 is a good start).
3. **Detect**: Click "Run Detection".
4. **Result**: 
   - The backend creates unique, timestamped files (e.g., `raw_20260324.jpg`, `result_20260324.csv`, `label_20260324.jpg`).
   - The UI displays the total count, average confidence, and the annotated image with red bounding boxes.
5. **Export**: Click "Export Detail" to download the `.csv` containing the exact GPS/pixel coordinates of every detected tree.

---

## 📂 File Structure

- `/api/main.py`: The "brain" of the app. It handles uploads and triggers Docker commands.
- `/data/`: All history is stored here. Files are named uniquely using timestamps.
- `/data/Google-Resnet101.h5`: The primary AI weights file.
- `/frontend/src/views/`: Contains the UI screens for Upload, Processing, and Results.
- `inference.py`: The script that runs *inside* the Docker container to perform the actual neural network math.
- `draw_boxes.py`: The script that paints red boxes on your raw photos based on AI findings.

---

## ⚠️ Important Notes
- **Docker Group**: If the backend cannot talk to Docker, ensure you have run `newgrp docker` or restarted your session after adding your user to the group.
- **GPU Runtime**: The backend expects `docker run --runtime nvidia`. If you are debugging on a non-GPU machine, you may need to edit `api/main.py` temporarily.
