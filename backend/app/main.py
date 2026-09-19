import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import admin, checker, events, profile, registrations, reports, users
from app.core.config import CORS_ORIGINS, UPLOAD_DIR
from app.database.core import engine, Base
# Import models so all 5 tables are registered on Base before create_all.
import app.models  # noqa: F401

# Create database tables
Base.metadata.create_all(bind=engine)

# Ensure uploads directory exists before mounting static files
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(title="Visitor Gate Pass API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(events.router, prefix="/events", tags=["events"])
app.include_router(registrations.router, prefix="/api", tags=["registrations"])
app.include_router(reports.router, prefix="/reports", tags=["reports"])
app.include_router(profile.router, prefix="/users", tags=["profile"])
app.include_router(checker.router, prefix="/api/checker", tags=["checker"])

# Serve uploaded ID proof files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to Visitor Gate Pass API"}
