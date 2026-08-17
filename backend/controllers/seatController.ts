import { Request, Response } from 'express';
import pool from '../db/pool';

export const getSeatsByShow = async (req: Request, res: Response) => {
  try {
    const { showId } = req.params;
    const result = await pool.query(
      `SELECT id, show_id, seat_row, seat_number,
              (is_booked OR (held_until IS NOT NULL AND held_until > NOW())) AS is_booked
       FROM seats
       WHERE show_id = $1
       ORDER BY seat_row, seat_number`,
      [showId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching seats:', error);
    res.status(500).json({ error: 'Failed to fetch seats' });
  }
};

