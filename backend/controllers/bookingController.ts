import { Request, Response } from 'express';
import pool from '../db/pool';

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const result = await pool.query(
      `SELECT b.id, b.token, b.customer_id, b.show_id, b.total_amount, b.booking_date, b.status, b.payment_id,
              c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
              b.movie_title, TO_CHAR(b.show_date, 'YYYY-MM-DD') AS show_date, b.show_time, b.screen_number, b.ticket_price,
              b.seats
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
       WHERE b.id = $1 AND b.token = $2`,
      [id, token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

export const getBookingsByCustomer = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const result = await pool.query(
      `SELECT b.id, b.token, b.customer_id, b.show_id, b.total_amount, b.booking_date, b.status, b.payment_id,
              c.name AS customer_name, c.email AS customer_email,
              b.movie_title, TO_CHAR(b.show_date, 'YYYY-MM-DD') AS show_date, b.show_time, b.screen_number, b.ticket_price,
              b.seats
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
       WHERE c.email = $1
       ORDER BY b.booking_date DESC`,
      [email]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const getAllBookings = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT b.id, b.customer_id, b.show_id, b.total_amount, b.booking_date, b.status, b.payment_id,
              c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
              b.movie_title, TO_CHAR(b.show_date, 'YYYY-MM-DD') AS show_date, b.show_time, b.screen_number, b.ticket_price,
              b.seats
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
       ORDER BY b.booking_date DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

export const deleteBooking = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const bookingId = Number(id);

    await client.query('BEGIN');

    await client.query(
      `UPDATE seats 
       SET is_booked = FALSE 
       WHERE id IN (
         SELECT seat_id 
         FROM booking_seats 
         WHERE booking_id = $1
       )`,
      [bookingId]
    );

    const result = await client.query('DELETE FROM bookings WHERE id = $1 RETURNING id', [bookingId]);

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Booking not found' });
    }

    await client.query('COMMIT');
    res.json({ message: 'Booking deleted successfully', id: bookingId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  } finally {
    client.release();
  }
};

