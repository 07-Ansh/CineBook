import pool from '../db/pool';

export const SHOW_SCHEDULE = [
  { screen: 1, time: '10:00:00', price: 250.00 },
  { screen: 1, time: '16:00:00', price: 250.00 },
  { screen: 1, time: '21:30:00', price: 280.00 },
  { screen: 2, time: '12:30:00', price: 300.00 },
  { screen: 2, time: '18:15:00', price: 300.00 },
  { screen: 3, time: '14:15:00', price: 350.00 },
  { screen: 3, time: '20:00:00', price: 350.00 },
];

let isGenerating = false;

export async function ensureUpcomingShows(daysAhead = 3): Promise<void> {
  if (isGenerating) return;
  isGenerating = true;

  try {
    const moviesRes = await pool.query('SELECT id, title FROM movies ORDER BY id');
    const movies = moviesRes.rows;
    if (movies.length === 0) return;

    for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
      for (const movie of movies) {
        const existing = await pool.query(
          `SELECT COUNT(*) FROM shows 
           WHERE movie_id = $1 
           AND show_date = (CURRENT_DATE AT TIME ZONE 'Asia/Kolkata' + ($2 || ' days')::interval)::date`,
          [movie.id, dayOffset]
        );

        if (parseInt(existing.rows[0].count, 10) === 0) {
          for (const s of SHOW_SCHEDULE) {
            await pool.query(
              `INSERT INTO shows (movie_id, show_date, show_time, screen_number, price)
               VALUES ($1, (CURRENT_DATE AT TIME ZONE 'Asia/Kolkata' + ($2 || ' days')::interval)::date, $3, $4, $5)`,
              [movie.id, dayOffset, s.time, s.screen, s.price]
            );
          }
        }
      }
    }
  } catch (err) {
    console.error('Error scheduling shows:', err);
  } finally {
    isGenerating = false;
  }
}

