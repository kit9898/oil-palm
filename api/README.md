# PalmArchitect FastAPI Backend

This directory contains the FastAPI-based backend service for the Oil Palm Detection project.

## 📦 Installation
1. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

## 🚀 Running the Server
Start the server using `uvicorn`:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 🛰️ API Endpoints

### 1. Health Check
- **URL**: `/api/v1/health`
- **Method**: `GET`
- **Returns**: `{"status": "ok", "message": "API is running"}`

### 2. Detect Palms
- **URL**: `/api/v1/detect`
- **Method**: `POST`
- **Payload**: `Multipart/FormData`
  - `file`: (UploadFile) The `.jpg` image to be scanned.
  - `confidence`: (float) The confidence threshold (0.1 to 1.0).
- **Process**: 
  - Generates a unique timestamp to rename files.
  - Executes `docker run --runtime nvidia ...`.
  - Parses results from the generated CSV.
- **Returns**: 
  - `status`: "success"
  - `total_palms`: (int) Number of palms detected.
  - `avg_confidence`: (float) Mean confidence score.
  - `annotated_image_url`: URL of the image with bounding boxes.
  - `csv_download_url`: URL for downloading coordinates.
  - `raw_image_url`: URL of the original uploaded image.

## 🛠️ Requirements
- `fastapi`
- `uvicorn`
- `pandas`
- `python-multipart`
