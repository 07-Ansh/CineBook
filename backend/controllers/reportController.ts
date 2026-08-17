import { Request, Response } from 'express';
import pool from '../db/pool';

export const getTotalBookings = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) AS total_bookings, COALESCE(SUM(total_amount), 0) AS total_revenue
       FROM bookings WHERE status = 'confirmed'`
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching total bookings:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
};

export const getRevenueByMovie = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT m.id AS movie_id, m.title AS movie_title,
              COUNT(b.id) AS total_bookings,
              COALESCE(SUM(b.total_amount), 0) AS total_revenue
       FROM movies m
       LEFT JOIN bookings b ON b.movie_title = m.title AND b.status = 'confirmed'
       GROUP BY m.id, m.title
       ORDER BY total_revenue DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching revenue by movie:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
};

export const getRevenueByShow = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT s.id AS show_id, m.title AS movie_title,
              TO_CHAR(s.show_date, 'YYYY-MM-DD') AS show_date, s.show_time, s.screen_number, s.price AS ticket_price,
              COUNT(b.id) AS total_bookings,
              COALESCE(SUM(b.total_amount), 0) AS total_revenue
       FROM shows s
       JOIN movies m ON m.id = s.movie_id
       LEFT JOIN bookings b ON b.show_id = s.id AND b.status = 'confirmed'
       GROUP BY s.id, m.title, s.show_date, s.show_time, s.screen_number, s.price
       ORDER BY s.show_date, s.show_time`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching revenue by show:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
};

export const getAvailableSeats = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT s.id AS show_id, m.title AS movie_title,
              TO_CHAR(s.show_date, 'YYYY-MM-DD') AS show_date, s.show_time, s.screen_number,
              COUNT(se.id) AS available_seats
       FROM shows s
       JOIN movies m ON m.id = s.movie_id
       JOIN seats se ON se.show_id = s.id
       WHERE se.is_booked = FALSE
       GROUP BY s.id, m.title, s.show_date, s.show_time, s.screen_number
       ORDER BY s.show_date, s.show_time`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching available seats:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
};

export const getBookedSeats = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT s.id AS show_id, m.title AS movie_title,
              TO_CHAR(s.show_date, 'YYYY-MM-DD') AS show_date, s.show_time,
              se.seat_row, se.seat_number,
              c.name AS customer_name, b.booking_date
       FROM shows s
       JOIN movies m ON m.id = s.movie_id
       JOIN seats se ON se.show_id = s.id
       JOIN booking_seats bs ON bs.seat_id = se.id
       JOIN bookings b ON b.id = bs.booking_id AND b.status = 'confirmed'
       JOIN customers c ON c.id = b.customer_id
       WHERE se.is_booked = TRUE
       ORDER BY s.id, se.seat_row, se.seat_number`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching booked seats:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
};

