"""Migrate live Postgres DB from 4 tables to normalized 5 tables.

- Creates gate_passes (Table 5/5) if missing.
- Copies qr_code / checked_in / checked_in_at / checked_out / checked_out_at
  from event_registrations into gate_passes (one row per accepted registration).
- Drops the old denormalized columns from event_registrations.
- Adds missing FK constraints / defaults for a clean Postgres schema.

Safe to run multiple times (idempotent).

Usage:
    cd backend
    python migrate_to_5_tables.py
"""
from sqlalchemy import text

from app.database.core import engine


def _columns(conn, table: str) -> set[str]:
    rows = conn.execute(
        text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_schema='public' AND table_name=:t"
        ).bindparams(t=table)
    ).all()
    return {r[0] for r in rows}


def migrate() -> None:
    with engine.begin() as conn:
        # Ensure new model tables exist (users/events/profiles/registrations untouched).
        from app.database.core import Base
        import app.models  # noqa: F401 — register all 5 tables

        Base.metadata.create_all(bind=conn)

        # create_all() never ALTERs existing tables, so backfill any columns
        # the new models added (e.g. users.created_at on a live DB).
        def ensure_column(table: str, ddl: str) -> None:
            col = ddl.split()[0].strip('"')
            existing = _columns(conn, table)
            if col not in existing:
                conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {ddl}"))
                print(f"Added {table}.{col}.")

        ensure_column("users", "created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')")
        ensure_column("events", "created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')")
        ensure_column("visitor_profiles", "created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')")
        ensure_column("event_registrations", "created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')")
        ensure_column("event_registrations", "decided_at TIMESTAMP WITHOUT TIME ZONE")

        reg_cols = _columns(conn, "event_registrations")
        has_old_qr = "qr_code" in reg_cols

        if has_old_qr:
            # Backfill gate_passes from legacy columns.
            conn.execute(
                text(
                    """
                    INSERT INTO gate_passes
                        (registration_id, qr_code, issued_at,
                         checked_in, checked_in_at, checked_out, checked_out_at)
                    SELECT id, qr_code, COALESCE(decided_at, created_at, NOW()),
                           COALESCE(checked_in, FALSE), checked_in_at,
                           COALESCE(checked_out, FALSE), checked_out_at
                    FROM event_registrations
                    WHERE qr_code IS NOT NULL
                    ON CONFLICT (registration_id) DO NOTHING
                    """
                )
            )
            # Drop legacy columns now that data lives in gate_passes.
            for col in ("qr_code", "checked_in", "checked_in_at", "checked_out", "checked_out_at"):
                if col in reg_cols:
                    conn.execute(text(f"ALTER TABLE event_registrations DROP COLUMN {col}"))
            print("Migrated legacy QR/check-in columns -> gate_passes.")
        else:
            print("event_registrations already normalized (no legacy columns).")

        tables = conn.execute(
            text("SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename")
        ).all()
        print("Tables:", [t[0] for t in tables])


if __name__ == "__main__":
    migrate()
