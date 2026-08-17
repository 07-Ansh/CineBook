import { Request, Response } from 'express';
import pool from '../db/pool';
import { ensureUpcomingShows } from '../services/showScheduler';

export const getAllShows = async (_req: Request, res: Response) => {
  try {
    await ensureUpcomingShows(3);
    const result = await pool.query(
      `SELECT s.id, s.movie_id, TO_CHAR(s.show_date, 'YYYY-MM-DD') AS show_date, s.show_time, s.screen_number, s.price, m.title AS movie_title, m.poster_url
       FROM shows s
       JOIN movies m ON m.id = s.movie_id
       ORDER BY s.show_date, s.show_time`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching shows:', error);
    res.status(500).json({ error: 'Failed to fetch shows' });
  }
};

export const getShowById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT s.id, s.movie_id, TO_CHAR(s.show_date, 'YYYY-MM-DD') AS show_date, s.show_time, s.screen_number, s.price, m.title AS movie_title, m.poster_url, m.genre, m.duration, m.language
       FROM shows s
       JOIN movies m ON m.id = s.movie_id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Show not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching show:', error);
    res.status(500).json({ error: 'Failed to fetch show' });
  }
};

export const getShowsByMovie = async (req: Request, res: Response) => {
  try {
    await ensureUpcomingShows(3);
    const { movieId } = req.params;
    const result = await pool.query(
      `SELECT s.id, s.movie_id, TO_CHAR(s.show_date, 'YYYY-MM-DD') AS show_date, s.show_time, s.screen_number, s.price, m.title AS movie_title,
              (SELECT COUNT(*) FROM seats se WHERE se.show_id = s.id AND se.is_booked = FALSE AND (se.held_until IS NULL OR se.held_until <= NOW())) AS available_seats
       FROM shows s
       JOIN movies m ON m.id = s.movie_id
       WHERE s.movie_id = $1 AND (s.show_date + s.show_time) >= (NOW() AT TIME ZONE 'Asia/Kolkata')
       ORDER BY s.show_date, s.show_time`,
      [movieId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching shows for movie:', error);
    res.status(500).json({ error: 'Failed to fetch shows' });
  }
};

export const createShow = async (req: Request, res: Response) => {
  try {
    const { movie_id, show_date, show_time, screen_number, price } = req.body;

    const result = await pool.query(
      `INSERT INTO shows (movie_id, show_date, show_time, screen_number, price)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [movie_id, show_date, show_time, screen_number, price]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating show:', error);
    res.status(500).json({ error: 'Failed to create show' });
  }
};

export const updateShow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { movie_id, show_date, show_time, screen_number, price } = req.body;

    const result = await pool.query(
      `UPDATE shows
       SET movie_id = $1, show_date = $2, show_time = $3, screen_number = $4, price = $5
       WHERE id = $6
       RETURNING *`,
      [movie_id, show_date, show_time, screen_number, price, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Show not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating show:', error);
    res.status(500).json({ error: 'Failed to update show' });
  }
};

export const deleteShow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM shows WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Show not found' });
    }

    res.json({ message: 'Show deleted successfully' });
  } catch (error) {
    console.error('Error deleting show:', error);
    res.status(500).json({ error: 'Failed to delete show' });
  }
};

