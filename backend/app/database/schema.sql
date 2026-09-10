-- ============================================================================
-- Visitor Gate Pass System — PostgreSQL schema (5 tables, normalized)
-- ============================================================================
-- 1. users                — all accounts (Host / Visitor / Checker)
-- 2. events               — events created by hosts
-- 3. visitor_profiles     — extended details for visitor accounts (1:1 users)
-- 4. event_registrations  — visitor applications (no QR / check-in here)
-- 5. gate_passes           — QR gate pass + entry/exit log (1:1 registrations)
--
-- Apply with:
--   psql -U postgres -d vispass -f schema.sql
-- Or let the FastAPI backend create it automatically via
--   Base.metadata.create_all(bind=engine)
-- ============================================================================

-- 1 ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR NOT NULL UNIQUE,
    role            VARCHAR NOT NULL,          -- 'Host' | 'Visitor' | 'Checker'
    hashed_password VARCHAR NOT NULL,
    created_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')
);
CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);
CREATE INDEX IF NOT EXISTS ix_users_role  ON users (role);

-- 2 ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
    id          SERIAL PRIMARY KEY,
    host_id     INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    title       VARCHAR NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    event_date  DATE,
    location    VARCHAR NOT NULL DEFAULT '',
    capacity    INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')
);
CREATE INDEX IF NOT EXISTS ix_events_id      ON events (id);
CREATE INDEX IF NOT EXISTS ix_events_host_id ON events (host_id);
CREATE INDEX IF NOT EXISTS ix_events_title   ON events (title);

-- 3 ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS visitor_profiles (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    full_name    VARCHAR NOT NULL DEFAULT '',
    phone        VARCHAR NOT NULL DEFAULT '',
    organization VARCHAR NOT NULL DEFAULT '',
    created_at   TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')
);
CREATE INDEX IF NOT EXISTS ix_visitor_profiles_user_id ON visitor_profiles (user_id);

-- 4 ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_registrations (
    id             SERIAL PRIMARY KEY,
    event_id       INTEGER NOT NULL REFERENCES events (id) ON DELETE CASCADE,
    visitor_id     INTEGER REFERENCES users (id) ON DELETE SET NULL,
    visitor_name   VARCHAR NOT NULL,
    visitor_email  VARCHAR NOT NULL DEFAULT '',
    phone          VARCHAR NOT NULL DEFAULT '',
    organization   VARCHAR NOT NULL DEFAULT '',
    purpose        VARCHAR NOT NULL DEFAULT '',
    status         VARCHAR NOT NULL DEFAULT 'pending',  -- pending | accepted | rejected
    id_proof       VARCHAR,                             -- stored upload filename
    created_at     TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
    decided_at     TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX IF NOT EXISTS ix_event_registrations_event_id      ON event_registrations (event_id);
CREATE INDEX IF NOT EXISTS ix_event_registrations_visitor_id    ON event_registrations (visitor_id);
CREATE INDEX IF NOT EXISTS ix_event_registrations_visitor_email ON event_registrations (visitor_email);
CREATE INDEX IF NOT EXISTS ix_event_registrations_status        ON event_registrations (status);

-- 5 ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gate_passes (
    id              SERIAL PRIMARY KEY,
    registration_id INTEGER NOT NULL UNIQUE REFERENCES event_registrations (id) ON DELETE CASCADE,
    qr_code         VARCHAR NOT NULL UNIQUE,
    issued_at       TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
    checked_in      BOOLEAN NOT NULL DEFAULT FALSE,
    checked_in_at   TIMESTAMP WITHOUT TIME ZONE,
    checked_out     BOOLEAN NOT NULL DEFAULT FALSE,
    checked_out_at  TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX IF NOT EXISTS ix_gate_passes_registration_id ON gate_passes (registration_id);
CREATE INDEX IF NOT EXISTS ix_gate_passes_qr_code         ON gate_passes (qr_code);
