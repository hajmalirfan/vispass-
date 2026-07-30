from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import users
from app.database.core import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Visitor Gate Pass API")

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router, prefix="/users", tags=["users"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Visitor Gate Pass API"}
