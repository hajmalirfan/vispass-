"""PostgreSQL-first database setup.

Uses connection pooling + pre-ping so dropped Postgres connections are
recycled instead of raising stale-connection errors.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import DATABASE_URL

connect_args = {}
engine_kwargs: dict = {"pool_pre_ping": True}

if DATABASE_URL.startswith("sqlite"):
    # Local fallback / tests only — Postgres is the primary target.
    connect_args = {"check_same_thread": False}
else:
    # Sensible Postgres pool defaults for a small FastAPI service.
    engine_kwargs.update({"pool_size": 5, "max_overflow": 10, "pool_recycle": 1800})

engine = create_engine(DATABASE_URL, connect_args=connect_args, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
