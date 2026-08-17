import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import pool from '../db/pool';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const createOrder = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const { amount, show_id, seat_ids } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!show_id || !seat_ids || !Array.isArray(seat_ids) || seat_ids.length === 0) {
      return res.status(400).json({ error: 'Invalid show or seat selection' });
    }

    await client.query('BEGIN');

    const seatCheck = await client.query(
      `SELECT id, is_booked, held_until FROM seats
       WHERE id = ANY($1::int[]) AND show_id = $2
       FOR UPDATE`,
      [seat_ids, show_id]
    );

    if (seatCheck.rows.length !== seat_ids.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'One or more seats are invalid' });
    }

    const unavailableSeats = seatCheck.rows.filter(
      seat => seat.is_booked || (seat.held_until && new Date(seat.held_until) > new Date())
    );

    if (unavailableSeats.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Selected seats are no longer available' });
    }

    await client.query(
      `UPDATE seats
       SET held_until = NOW() + INTERVAL '5 minutes'
       WHERE id = ANY($1::int[]) AND show_id = $2`,
      [seat_ids, show_id]
    );

    await client.query('COMMIT');

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    });

    res.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Order creation failed:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  } finally {
    client.release();
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      customer_name,
      customer_email,
      customer_phone,
      show_id,
      seat_ids,
    } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment signature verification failed' });
    }

    await client.query('BEGIN');

    const seatCheck = await client.query(
      `SELECT id, is_booked FROM seats WHERE id = ANY($1::int[]) AND show_id = $2 FOR UPDATE`,
      [seat_ids, show_id]
    );

    if (seatCheck.rows.length !== seat_ids.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'One or more seats are invalid' });
    }

    const taken = seatCheck.rows.filter(s => s.is_booked);
    if (taken.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Some seats were already booked' });
    }

    const showInfo = await client.query(
      `SELECT s.show_date, s.show_time, s.screen_number, s.price, m.title AS movie_title
       FROM shows s
       JOIN movies m ON m.id = s.movie_id
       WHERE s.id = $1`,
      [show_id]
    );
    if (showInfo.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Show not found' });
    }
    const show = showInfo.rows[0];

    const basePrice = parseFloat(show.price);
    const seatRowsResult = await client.query(
      'SELECT seat_row FROM seats WHERE id = ANY($1::int[]) AND show_id = $2',
      [seat_ids, show_id]
    );
    const serverTotalAmount = seatRowsResult.rows.reduce((acc: number, seat: { seat_row: string }) => {
      let multiplier = 1.0;
      if (seat.seat_row === 'J') multiplier = 1.5;
      if (seat.seat_row === 'I') multiplier = 1.25;
      if (['H', 'G', 'F'].includes(seat.seat_row)) multiplier = 1.15;
      if (['E', 'D', 'C', 'B'].includes(seat.seat_row)) multiplier = 1.0;
      if (seat.seat_row === 'A') multiplier = 0.9;
      return acc + basePrice * multiplier;
    }, 0);
    const roundedTotal = Math.round(serverTotalAmount * 100) / 100;

    let custResult = await client.query('SELECT id FROM customers WHERE email = $1', [customer_email]);
    let customerId: number;
    if (custResult.rows.length > 0) {
      customerId = custResult.rows[0].id;
    } else {
      custResult = await client.query(
        'INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING id',
        [customer_name, customer_email, customer_phone || '']
      );
      customerId = custResult.rows[0].id;
    }

    const seatInfoResult = await client.query(
      `SELECT seat_row, seat_number FROM seats WHERE id = ANY($1::int[]) ORDER BY seat_row, seat_number`,
      [seat_ids]
    );
    const seatsJson = JSON.stringify(seatInfoResult.rows);

    const bookingResult = await client.query(
      `INSERT INTO bookings (customer_id, show_id, total_amount, status, payment_id, movie_title, show_date, show_time, screen_number, ticket_price, seats)
       VALUES ($1, $2, $3, 'confirmed', $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [customerId, show_id, roundedTotal, razorpay_payment_id, show.movie_title, show.show_date, show.show_time, show.screen_number, show.price, seatsJson]
    );
    const bookingId = bookingResult.rows[0].id;

    for (const seatId of seat_ids) {
      await client.query(
        'INSERT INTO booking_seats (booking_id, seat_id) VALUES ($1, $2)',
        [bookingId, seatId]
      );
    }

    await client.query('UPDATE seats SET is_booked = TRUE, held_until = NULL WHERE id = ANY($1::int[])', [seat_ids]);

    await client.query('COMMIT');

    const fullBooking = await pool.query(
      `SELECT b.id, b.token, b.customer_id, b.show_id, b.total_amount, b.booking_date, b.status, b.payment_id,
              c.name AS customer_name, c.email AS customer_email, c.phone AS customer_phone,
              b.movie_title, TO_CHAR(b.show_date, 'YYYY-MM-DD') AS show_date,
              b.show_time, b.screen_number, b.ticket_price,
              b.seats
       FROM bookings b
       JOIN customers c ON c.id = b.customer_id
       WHERE b.id = $1`,
      [bookingId]
    );

    res.status(201).json(fullBooking.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Booking creation failed after payment' });
  } finally {
    client.release();
  }
};

export const releaseHold = async (req: Request, res: Response) => {
  try {
    const { show_id, seat_ids } = req.body;
    if (!show_id || !seat_ids || !Array.isArray(seat_ids) || seat_ids.length === 0) {
      return res.status(400).json({ error: 'Invalid selection' });
    }
    await pool.query(
      `UPDATE seats
       SET held_until = NULL
       WHERE id = ANY($1::int[]) AND show_id = $2 AND is_booked = FALSE`,
      [seat_ids, show_id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to release seat hold:', error);
    res.status(500).json({ error: 'Failed to release hold' });
  }
};

