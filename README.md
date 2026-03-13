<div align="center">

# AI Image Upscaler Website (Neural Upscaler)

A modern **React + FastAPI** web app that upscales images with **Real-ESRGAN** via **Replicate Cloud GPUs**, using **Azure Blob Storage** for private uploads + public results.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-API-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)
![Azure](https://img.shields.io/badge/Azure-Blob_Storage-0078D4?logo=microsoftazure&logoColor=white)
![Replicate](https://img.shields.io/badge/Replicate-Cloud_GPU-000000?logo=replicate&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

</div>



## 📸 Overview

This repo is split into two projects:

- **Frontend** (`frontend/`): React (Vite) UI for uploading an image + polling job status
- **Backend** (`backend/`): FastAPI server that:
  - validates uploads
  - stores raw images in **private Azure** container (`uploads`)
  - runs **Real-ESRGAN** on **Replicate**
  - stores final outputs in **public Azure** container (`results`)
  - exposes a polling endpoint the frontend can call until the result is ready



## ✨ Features

- ⚡ **Seamless UI** (React + Vite) for uploading and previewing results
- 🔁 **Async polling workflow**
  - `POST /api/upscale` returns a `job_id`
  - frontend polls `GET /api/result/{job_id}` until it returns `{ status: "ready", url }`
- ☁️ **Azure Blob Storage integration**
  - private container for raw uploads (`uploads`)
  - public container for processed results (`results`)
- 🚀 **Replicate Cloud GPU processing**
  - no local CUDA / no heavy model installs required
- 🔒 **Basic file safety checks**
  - MIME allow-list (JPG/PNG/WEBP)
  - randomized safe filenames (UUID)
  - file size limit (see `backend/core/config.py`)



## 🧰 Tech Stack

### 🎨 Frontend (`frontend/`)
- React
- Vite
- Tailwind (via `@tailwindcss/vite`)

### 🧠 Backend (`backend/`)
- FastAPI
- Uvicorn
- `replicate` (Real-ESRGAN via Replicate)
- `azure-storage-blob` (async client)
- `python-dotenv`
- `aiohttp`



## 🏗️ Project Structure

```text
.
├── backend/
│   ├── main.py
│   ├── api/
│   ├── core/
│   └── services/
├── frontend/
│   ├── vite.config.js
│   ├── package.json
│   └── src/
└── requirements.txt
```



## ☁️ vs 🏠 Crucial: Local Network vs Cloud Deployment

This project is designed so you can choose **where the backend runs**:

### ✅ Option A — Run everything on your local network (no backend cloud deploy)
This is the simplest path if you **do not** want to deploy to Vercel/Render/etc.

- Run **FastAPI locally** (on your LAN machine)
- Run **React dev server locally** (or build + host it locally)
- The frontend calls the backend at:

```js
http://localhost:8000/api/...
```

> **Important:** As currently implemented, the frontend API base URL is hardcoded to `http://localhost:8000` in `frontend/src/services/apiService.js`.
>
> If you want to use this from another device on your LAN (phone/tablet), you’ll need to change that URL to your machine’s LAN IP (example: `http://192.168.1.50:8000`) and also update CORS in the backend to allow the frontend origin.

### ✅ Option B — Deploy the backend to the cloud
If you deploy the backend (Render/Fly.io/Azure/etc.), you’ll also need to update:

- **CORS** in `backend/main.py` (`allow_origins=[ ... ]`)
- The frontend API calls (currently hardcoded to localhost)

> Tip: a common production pattern is to replace the hardcoded URL with a Vite env var (e.g. `VITE_API_BASE_URL`). This repo currently does **not** use a `VITE_*` env var for the API URL.



## 🔑 Environment Variables

The backend loads environment variables via `python-dotenv` (`load_dotenv()` is called in `backend/services/storage.py`).

Create a `.env` file (recommended at repo root when running locally), based on this example:

```bash
# .env.example

AZURE_CONNECTION_STRING="DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net"
REPLICATE_API_TOKEN="r8_..."
```

### Azure containers required
Your storage account should have:
- `uploads` (private)
- `results` (public / blob access)



## 🚀 Installation & Running Locally

### ✅ 1) Clone the repository

```bash
git clone https://github.com/Dendroculus/image-upscaler-website.git
cd image-upscaler-website
```



## 🧠 Backend (FastAPI)

### ✅ 2) Create + activate a virtual environment

#### macOS / Linux
```bash
python3 -m venv .venv
source .venv/bin/activate
```

#### Windows (PowerShell)
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### ✅ 3) Install Python dependencies

```bash
pip install -r requirements.txt
```

### ✅ 4) Add your `.env`
Create a `.env` file (at repo root) and add:

- `AZURE_CONNECTION_STRING`
- `REPLICATE_API_TOKEN`

### ✅ 5) Run the API server

Your FastAPI app instance is `app` in `backend/main.py`, so run:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

- API base: `http://localhost:8000`
- Endpoints:
  - `POST http://localhost:8000/api/upscale`
  - `GET  http://localhost:8000/api/result/{job_id}`



## 🎨 Frontend (React + Vite)

### ✅ 6) Install dependencies

```bash
cd frontend
npm install
```

### ✅ 7) Start the dev server

```bash
npm run dev
```

Vite will print the local URL (typically):
- `http://localhost:5173`



## 🔁 How the Upscale Flow Works

1. Frontend uploads an image + model type
2. Backend:
   - validates and sanitizes upload
   - uploads raw file to Azure private container (`uploads`)
   - starts a FastAPI `BackgroundTasks` job
3. Background task:
   - downloads raw bytes from Azure
   - sends to Replicate Real-ESRGAN
   - downloads the resulting image
   - uploads final PNG to Azure public container (`results`)
4. Frontend polls until the backend detects the Azure result exists and returns the public URL



## 🧪 Notes / Troubleshooting

### 🧩 CORS errors
CORS is configured in `backend/main.py` to allow:
- `http://localhost:5173`

If your frontend runs on another origin (LAN IP, different port, deployed URL), update `allow_origins`.

### 📦 Azure “Cloud storage is not configured.”
If you see:
- `Cloud storage is not configured.`

Then `AZURE_CONNECTION_STRING` isn’t being loaded (or isn’t set).

### 🧵 Replicate auth
The Replicate Python client reads `REPLICATE_API_TOKEN` from the environment. Make sure it’s set in your `.env` or shell session.



## 🛡️ License

MIT (see `LICENSE` if present in the repo).



## 🙏 Credits

- **Real-ESRGAN** (upscaling model)
- **Replicate** (GPU inference hosting)
- **FastAPI** + **React/Vite** for the web stack