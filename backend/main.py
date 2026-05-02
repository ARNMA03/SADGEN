from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from database import engine
import models
from routers import auth, admin, student, professor
import os

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sadgen Enrollment Portal API",
    description="Automated Block Enrollment System — HCI2 Prototype",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Simplified for deployment, restrict in real production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(student.router)
app.include_router(professor.router)

@app.get("/api/health", tags=["Health"])
def root():
    return {"status": "ok", "app": "Sadgen Enrollment Portal", "version": "1.0.0"}

# Serve Frontend
# Make sure the frontend directory exists relative to backend
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
