import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './db/pool';
import movieRoutes from './routes/movies';
import showRoutes from './routes/shows';
import seatRoutes from './routes/seats';
import bookingRoutes from './routes/bookings';
import customerRoutes from './routes/customers';
import reportRoutes from './routes/reports';
import paymentRoutes from './routes/payments';
import { ensureUpcomingShows } from './services/showScheduler';

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL || 'https://cinebook-16937.web.app',
  'http://localhost:5173',
  'http://localhost:4173',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/movies', movieRoutes);
app.use('/api/shows', showRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payments', paymentRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'CineBook API is running' });
});

const maintainShows = async () => {
  try {
    await pool.query(
      `DELETE FROM shows WHERE (show_date + show_time) < (NOW() AT TIME ZONE 'Asia/Kolkata')`
    );
    await ensureUpcomingShows(3);
  } catch (error) {
    console.error('Error maintaining shows schedule:', error);
  }
};

maintainShows();
setInterval(maintainShows, 10 * 60 * 1000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;

