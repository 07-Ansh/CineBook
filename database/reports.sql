-- ============================================================
-- Movie Ticket Booking System — Report Queries
-- ============================================================

-- ------------------------------------------------------------
-- 1. Total Bookings
-- ------------------------------------------------------------
-- Returns the total number of bookings and total revenue.
SELECT
    COUNT(*)            AS total_bookings,
    SUM(total_amount)   AS total_revenue
FROM bookings
WHERE status = 'confirmed';


-- ------------------------------------------------------------
-- 2. Revenue by Movie
-- ------------------------------------------------------------
-- Total revenue and booking count grouped by movie.
SELECT
    m.id            AS movie_id,
    m.title         AS movie_title,
    COUNT(b.id)     AS total_bookings,
    COALESCE(SUM(b.total_amount), 0) AS total_revenue
FROM movies m
LEFT JOIN shows s ON s.movie_id = m.id
LEFT JOIN bookings b ON b.show_id = s.id AND b.status = 'confirmed'
GROUP BY m.id, m.title
ORDER BY total_revenue DESC;


-- ------------------------------------------------------------
-- 3. Revenue by Show
-- ------------------------------------------------------------
-- Revenue and seat stats for each show.
SELECT
    s.id            AS show_id,
    m.title         AS movie_title,
    s.show_date,
    s.show_time,
    s.screen_number,
    s.price         AS ticket_price,
    COUNT(b.id)     AS total_bookings,
    COALESCE(SUM(b.total_amount), 0) AS total_revenue
FROM shows s
JOIN movies m ON m.id = s.movie_id
LEFT JOIN bookings b ON b.show_id = s.id AND b.status = 'confirmed'
GROUP BY s.id, m.title, s.show_date, s.show_time, s.screen_number, s.price
ORDER BY s.show_date, s.show_time;


-- ------------------------------------------------------------
-- 4. Available Seats per Show
-- ------------------------------------------------------------
-- Count of available (unbooked) seats for each show.
SELECT
    s.id            AS show_id,
    m.title         AS movie_title,
    s.show_date,
    s.show_time,
    s.screen_number,
    COUNT(se.id)    AS available_seats
FROM shows s
JOIN movies m ON m.id = s.movie_id
JOIN seats se ON se.show_id = s.id
WHERE se.is_booked = FALSE
GROUP BY s.id, m.title, s.show_date, s.show_time, s.screen_number
ORDER BY s.show_date, s.show_time;


-- ------------------------------------------------------------
-- 5. Booked Seats per Show
-- ------------------------------------------------------------
-- List of booked seats with booking details for each show.
SELECT
    s.id            AS show_id,
    m.title         AS movie_title,
    s.show_date,
    s.show_time,
    se.seat_row,
    se.seat_number,
    c.name          AS customer_name,
    b.booking_date
FROM shows s
JOIN movies m ON m.id = s.movie_id
JOIN seats se ON se.show_id = s.id
JOIN booking_seats bs ON bs.seat_id = se.id
JOIN bookings b ON b.id = bs.booking_id AND b.status = 'confirmed'
JOIN customers c ON c.id = b.customer_id
WHERE se.is_booked = TRUE
ORDER BY s.id, se.seat_row, se.seat_number;


-- ------------------------------------------------------------
-- 6. Customer Booking History
-- ------------------------------------------------------------
-- All bookings for a specific customer (replace $1 with customer email).
-- Usage: Pass customer email as parameter.
SELECT
    b.id            AS booking_id,
    m.title         AS movie_title,
    s.show_date,
    s.show_time,
    s.screen_number,
    b.total_amount,
    b.booking_date,
    b.status,
    STRING_AGG(se.seat_row || se.seat_number::TEXT, ', ' ORDER BY se.seat_row, se.seat_number) AS seats
FROM bookings b
JOIN shows s ON s.id = b.show_id
JOIN movies m ON m.id = s.movie_id
JOIN customers c ON c.id = b.customer_id
JOIN booking_seats bs ON bs.booking_id = b.id
JOIN seats se ON se.id = bs.seat_id
WHERE c.email = 'rahul@example.com'  -- Replace with $1 for parameterized query
GROUP BY b.id, m.title, s.show_date, s.show_time, s.screen_number, b.total_amount, b.booking_date, b.status
ORDER BY b.booking_date DESC;
