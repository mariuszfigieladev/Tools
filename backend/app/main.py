import json
import pathlib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Portfolio API",
    description="Backend service for Mariusz Figiel's portfolio website",
    version="1.0.0"
)

# CORS configuration - crucial for Stage 2 (React integration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production/Docker stage we will restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths to data files
DATA_DIR = pathlib.Path(__file__).parent / "data"
PROFILE_FILE = DATA_DIR / "profile.json"
PROJECTS_FILE = DATA_DIR / "projects.json"

def load_json_data(file_path: pathlib.Path):
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"Data file {file_path.name} not found.")
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)
    
@app.get("/")
async def root():
    return {
        "message": "Welcome to my Portfolio API",
        "docs": "Go to /docs to see available endpoints"
    }

@app.get("/api/profile", tags=["Profile"])
async def get_profile():
    """
    Returns full profile data for 'About Me', 'Contact', and 'Skills' sections.
    """
    return load_json_data(PROFILE_FILE)

@app.get("/api/projects")
async def get_projects():
    path = pathlib.Path(__file__).parent / "data" / "projects.json"
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health", tags=["Monitoring"])
async def health_check():
    """
    Simple health check endpoint - highly useful for Stage 4 (Grafana/Prometheus).
    """
    return {"status": "healthy"}