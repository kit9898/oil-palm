from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import subprocess
import pandas as pd
import os
import shutil

app = FastAPI(title="PalmTree AI API", version="1.0")

# 1. 解决跨域问题 (CORS) - 极其重要！允许你的 React 前端访问这个 API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 生产环境中这里应该填前端的真实 IP (例如 http://localhost:3000)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. 静态文件代理 - 让前端能直接通过 URL 访问画好框的图片
DATA_DIR = "./data"
os.makedirs(DATA_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=DATA_DIR), name="static")

@app.post("/api/v1/detect")
async def run_detection(
    file: UploadFile = File(...), 
    confidence: float = Form(0.5)
):
    try:
        # 1. 保存前端传来的图片
        input_path = os.path.join(DATA_DIR, "input_drone.jpg")
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        cwd_abs = os.path.abspath(".")

        # 2. 运行 AI 推理 (Step 1)
        # 注意：在真实的服务器上，subprocess 是阻塞的。以后可以升级为 Celery 异步队列。
        infer_cmd = [
            "sudo", "docker", "run", "--runtime", "nvidia", "--rm",
            "-v", f"{cwd_abs}/data:/workspace/data",
            "optimal-ipb-jetson",
            "python3", "/workspace/inference.py",
            "--model", "/workspace/data/Google-Resnet101.h5",
            "--image", "/workspace/data/input_drone.jpg",
            "--output", "/workspace/data/result.csv",
            "--confidence", str(confidence)
        ]
        infer_res = subprocess.run(infer_cmd, capture_output=True, text=True)
        if infer_res.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Inference Failed: {infer_res.stderr}")

        # 3. 运行画框脚本 (Step 2)
        draw_cmd = [
            "sudo", "docker", "run", "--rm",
            "-v", f"{cwd_abs}/data:/workspace/data",
            "optimal-ipb-jetson",
            "python3", "/workspace/data/draw_boxes.py",
            "--image", "/workspace/data/input_drone.jpg",
            "--csv", "/workspace/data/result.csv",
            "--output", "/workspace/data/annotated_drone.jpg"
        ]
        draw_res = subprocess.run(draw_cmd, capture_output=True, text=True)
        if draw_res.returncode != 0:
            raise HTTPException(status_code=500, detail=f"Drawing Failed: {draw_res.stderr}")

        # 4. 解析 CSV 数据
        csv_path = os.path.join(DATA_DIR, "result.csv")
        df = pd.read_csv(csv_path)
        total_palms = len(df)
        avg_conf = float(df["confidence"].mean()) if not df.empty else 0.0

        # 5. 返回结果给前端
        return {
            "status": "success",
            "total_palms": total_palms,
            "avg_confidence": round(avg_conf, 3),
            "annotated_image_url": "http://localhost:8000/static/annotated_drone.jpg",
            "csv_download_url": "http://localhost:8000/static/result.csv"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))