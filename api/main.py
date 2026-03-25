from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import subprocess
import pandas as pd
import os
import shutil
from datetime import datetime

app = FastAPI(title="PalmTree AI API", version="1.0")

# 1. CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Static file proxy
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
os.makedirs(DATA_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=DATA_DIR), name="static")

@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "message": "API is running"}

@app.post("/api/v1/detect")
async def run_detection(
    request: Request,
    file: UploadFile = File(...), 
    confidence: float = Form(0.5)
):
    try:
        # Generate unique filenames based on current timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        raw_filename = f"raw_{timestamp}.jpg"
        result_filename = f"result_{timestamp}.csv"
        label_filename = f"label_{timestamp}.jpg"

        # 1. Save frontend image with unique name
        input_path = os.path.join(DATA_DIR, raw_filename)
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        cwd_abs = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        
        # 2. Run AI Inference via Jetson Docker
        infer_cmd = [
            "docker", "run", "--runtime", "nvidia", "--rm",
            "-v", f"{cwd_abs}/data:/workspace/data",
            "-v", f"{cwd_abs}/inference.py:/workspace/inference.py",  # MOUNT SCRIPT TO BYPASS CACHE
            "optimal-ipb-jetson",
            "python3", "/workspace/inference.py",
            "--model", "/workspace/data/Google-Resnet101.h5",
            "--image", f"/workspace/data/{raw_filename}",
            "--output", f"/workspace/data/{result_filename}",
            "--confidence", str(confidence)
        ]
        infer_res = subprocess.run(infer_cmd, capture_output=True, text=True)
        if infer_res.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Inference Failed: {infer_res.stderr}")

        # 3. Run drawing script via Jetson Docker
        draw_cmd = [
            "docker", "run", "--rm",
            "-v", f"{cwd_abs}/data:/workspace/data",
            "optimal-ipb-jetson",
            "python3", "/workspace/data/draw_boxes.py",
            "--image", f"/workspace/data/{raw_filename}",
            "--csv", f"/workspace/data/{result_filename}",
            "--output", f"/workspace/data/{label_filename}"
        ]
        draw_res = subprocess.run(draw_cmd, capture_output=True, text=True)
        if draw_res.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Drawing Failed: {draw_res.stderr}")

        # 4. Parse CSV Data
        csv_path = os.path.join(DATA_DIR, result_filename)
        df = pd.read_csv(csv_path)
        total_palms = len(df)
        avg_conf = float(df["confidence"].mean()) if not df.empty and "confidence" in df.columns else 0.0

        base_url = str(request.base_url).rstrip("/")
        return {
            "status": "success",
            "total_palms": total_palms,
            "avg_confidence": round(avg_conf, 3),
            "annotated_image_url": f"{base_url}/static/{label_filename}",
            "csv_download_url": f"{base_url}/static/{result_filename}",
            "raw_image_url": f"{base_url}/static/{raw_filename}"
        }

    except Exception as e:
        print(f"Error during detection: {e}")
        raise HTTPException(status_code=500, detail=str(e))
