import os

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf"}

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:postgres@localhost:5432/vispass")
SECRET_KEY = os.getenv("SECRET_KEY", "vispass-super-secret-jwt-key-2026-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Mailtrap (forgot-password OTP emails)
MAILTRAP_API_TOKEN = os.getenv("MAILTRAP_API_TOKEN", "")
MAILTRAP_SENDER_EMAIL = os.getenv("MAILTRAP_SENDER_EMAIL", "hello@demomailtrap.co")
MAILTRAP_SENDER_NAME = os.getenv("MAILTRAP_SENDER_NAME", "VisPass Support")
OTP_EXPIRE_MINUTES = int(os.getenv("OTP_EXPIRE_MINUTES", "10"))
