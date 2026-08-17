import { Request, Response } from 'express';
import pool from '../db/pool';

export const getAllMovies = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM movies ORDER BY release_date DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
};

export const getMovieById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM movies WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching movie:', error);
    res.status(500).json({ error: 'Failed to fetch movie' });
  }
};

export const createMovie = async (req: Request, res: Response) => {
  try {
    const { title, genre, duration, language, release_date, poster_url, description } = req.body;

    const result = await pool.query(
      `INSERT INTO movies (title, genre, duration, language, release_date, poster_url, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, genre, duration, language, release_date, poster_url, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating movie:', error);
    res.status(500).json({ error: 'Failed to create movie' });
  }
};

export const updateMovie = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, genre, duration, language, release_date, poster_url, description } = req.body;

    const result = await pool.query(
      `UPDATE movies
       SET title = $1, genre = $2, duration = $3, language = $4,
           release_date = $5, poster_url = $6, description = $7
       WHERE id = $8
       RETURNING *`,
      [title, genre, duration, language, release_date, poster_url, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating movie:', error);
    res.status(500).json({ error: 'Failed to update movie' });
  }
};

export const deleteMovie = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM movies WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json({ message: 'Movie deleted successfully' });
  } catch (error) {
    console.error('Error deleting movie:', error);
    res.status(500).json({ error: 'Failed to delete movie' });
  }
};

