import 'dotenv/config';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';

// ─── Idempotent migration SQL ─────────────────────────────────────────────────
// Uses IF NOT EXISTS so running this again NEVER drops or overwrites existing data.
const MIGRATION_SQL = `
-- 1. Movies
CREATE TABLE IF NOT EXISTS movies (
    id           SERIAL PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    genre        VARCHAR(100) NOT NULL,
    duration     INTEGER NOT NULL CHECK (duration > 0),
    language     VARCHAR(50)  NOT NULL,
    release_date DATE NOT NULL,
    poster_url   TEXT,
    description  TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Shows
CREATE TABLE IF NOT EXISTS shows (
    id            SERIAL PRIMARY KEY,
    movie_id      INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    show_date     DATE NOT NULL,
    show_time     TIME NOT NULL,
    screen_number INTEGER NOT NULL CHECK (screen_number > 0),
    price         NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shows_movie_id ON shows(movie_id);
CREATE INDEX IF NOT EXISTS idx_shows_date     ON shows(show_date);

-- 3. Seats
CREATE TABLE IF NOT EXISTS seats (
    id          SERIAL PRIMARY KEY,
    show_id     INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    seat_row    CHAR(1)  NOT NULL CHECK (seat_row BETWEEN 'A' AND 'J'),
    seat_number INTEGER  NOT NULL CHECK (seat_number BETWEEN 1 AND 10),
    is_booked   BOOLEAN  NOT NULL DEFAULT FALSE,
    held_until  TIMESTAMP,
    UNIQUE (show_id, seat_row, seat_number)
);

CREATE INDEX IF NOT EXISTS idx_seats_show_id      ON seats(show_id);
CREATE INDEX IF NOT EXISTS idx_seats_availability ON seats(show_id, is_booked);

-- 4. Customers
CREATE TABLE IF NOT EXISTS customers (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL,
    phone      VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- 5. Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id            SERIAL PRIMARY KEY,
    customer_id   INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    show_id       INTEGER REFERENCES shows(id) ON DELETE SET NULL, -- Allow nullable show_id
    total_amount  NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    booking_date  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status        VARCHAR(20) NOT NULL DEFAULT 'confirmed'
                     CHECK (status IN ('confirmed', 'cancelled')),
    movie_title   VARCHAR(200) NOT NULL,
    show_date     DATE NOT NULL,
    show_time     TIME NOT NULL,
    screen_number INTEGER NOT NULL,
    ticket_price  NUMERIC(10, 2) NOT NULL,
    seats         JSON NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_show_id     ON bookings(show_id);

-- 6. Booking Seats (junction)
CREATE TABLE IF NOT EXISTS booking_seats (
    id         SERIAL PRIMARY KEY,
    booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    seat_id    INTEGER REFERENCES seats(id) ON DELETE SET NULL, -- Allow nullable seat_id when shows are deleted
    UNIQUE (booking_id, seat_id)
);

CREATE INDEX IF NOT EXISTS idx_booking_seats_booking_id ON booking_seats(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_seats_seat_id    ON booking_seats(seat_id);

-- 7. Auto-generate seats trigger (CREATE OR REPLACE is always safe to re-run)
CREATE OR REPLACE FUNCTION generate_seats_for_show()
RETURNS TRIGGER AS $$
DECLARE
    row_letter CHAR(1);
    seat_num   INTEGER;
BEGIN
    FOR row_letter IN SELECT unnest(ARRAY['A','B','C','D','E','F','G','H','I','J'])
    LOOP
        FOR seat_num IN 1..10
        LOOP
            INSERT INTO seats (show_id, seat_row, seat_number, is_booked)
            VALUES (NEW.id, row_letter, seat_num, FALSE);
        END LOOP;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop & recreate trigger (idempotent)
DROP TRIGGER IF EXISTS trg_generate_seats ON shows;
CREATE TRIGGER trg_generate_seats
    AFTER INSERT ON shows
    FOR EACH ROW
    EXECUTE FUNCTION generate_seats_for_show();

-- Ensure held_until column exists on seats table
ALTER TABLE seats ADD COLUMN IF NOT EXISTS held_until TIMESTAMP;

-- 8. Enable Row Level Security on all tables
--    Our backend connects as the postgres superuser (bypasses RLS).
--    This blocks Supabase's public Data API from exposing raw table data.
ALTER TABLE movies        ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows         ENABLE ROW LEVEL SECURITY;
ALTER TABLE seats         ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_seats ENABLE ROW LEVEL SECURITY;
`;

async function migrate() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('supabase')
      ? { rejectUnauthorized: false }
      : false,
  });

  const client = await pool.connect();
  try {
    console.log('🗄️  Running database migrations...');
    await client.query(MIGRATION_SQL);
    console.log('✅  Migrations applied successfully — no data was dropped.');
  } catch (err) {
    console.error('❌  Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
