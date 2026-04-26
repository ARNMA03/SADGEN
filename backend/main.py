from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth, admin, student, professor

# Create all tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Efficio Enrollment Portal API",
    description="Automated Block Enrollment System — HCI2 Prototype",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://127.0.0.1:5173", 
        "http://localhost:3000", "http://127.0.0.1:3000",
        "http://localhost:5500", "http://127.0.0.1:5500",
        "http://localhost:8080", "http://127.0.0.1:8080",
        "null"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(student.router)
app.include_router(professor.router)

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "app": "Efficio Enrollment Portal", "version": "1.0.0"}
