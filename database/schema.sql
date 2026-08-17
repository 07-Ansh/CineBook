CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TABLE IF EXISTS booking_seats CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS seats CASCADE;
DROP TABLE IF EXISTS shows CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS movies CASCADE;

CREATE TABLE movies (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(200) NOT NULL,
    genre       VARCHAR(100) NOT NULL,
    duration    INTEGER NOT NULL CHECK (duration > 0),
    language    VARCHAR(50) NOT NULL,
    release_date DATE NOT NULL,
    poster_url  TEXT,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE shows (
    id            SERIAL PRIMARY KEY,
    movie_id      INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    show_date     DATE NOT NULL,
    show_time     TIME NOT NULL,
    screen_number INTEGER NOT NULL CHECK (screen_number > 0),
    price         NUMERIC(10, 2) NOT NULL CHECK (price > 0),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shows_movie_id ON shows(movie_id);
CREATE INDEX idx_shows_date ON shows(show_date);

CREATE TABLE seats (
    id          SERIAL PRIMARY KEY,
    show_id     INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    seat_row    CHAR(1) NOT NULL CHECK (seat_row BETWEEN 'A' AND 'J'),
    seat_number INTEGER NOT NULL CHECK (seat_number BETWEEN 1 AND 10),
    is_booked   BOOLEAN NOT NULL DEFAULT FALSE,
    held_until  TIMESTAMP,
    UNIQUE (show_id, seat_row, seat_number)
);

CREATE INDEX idx_seats_show_id ON seats(show_id);
CREATE INDEX idx_seats_availability ON seats(show_id, is_booked);

CREATE TABLE customers (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(100) NOT NULL,
    email   VARCHAR(150) NOT NULL,
    phone   VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_email ON customers(email);

CREATE TABLE bookings (
    id            SERIAL PRIMARY KEY,
    token         UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    customer_id   INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    show_id       INTEGER NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    total_amount  NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    booking_date  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status        VARCHAR(20) NOT NULL DEFAULT 'confirmed'
                    CHECK (status IN ('confirmed', 'cancelled')),
    payment_id    VARCHAR(100),
    movie_title   VARCHAR(200),
    show_date     DATE,
    show_time     TIME,
    screen_number INTEGER,
    ticket_price  NUMERIC(10, 2),
    seats         TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_show_id ON bookings(show_id);

CREATE TABLE booking_seats (
    id          SERIAL PRIMARY KEY,
    booking_id  INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    seat_id     INTEGER NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
    UNIQUE (booking_id, seat_id)
);

CREATE INDEX idx_booking_seats_booking_id ON booking_seats(booking_id);
CREATE INDEX idx_booking_seats_seat_id ON booking_seats(seat_id);

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

CREATE TRIGGER trg_generate_seats
    AFTER INSERT ON shows
    FOR EACH ROW
    EXECUTE FUNCTION generate_seats_for_show();

