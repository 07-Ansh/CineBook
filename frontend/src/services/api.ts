import axios from 'axios';
import { getAuth } from 'firebase/auth';
import type { Movie, Show, Seat, Booking, BookingRequest, TotalBookingsReport, RevenueByMovie, RevenueByShow } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api`
    : '/api',
});

api.interceptors.request.use(async (config) => {
  try {
    const auth = getAuth();
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('Failed to attach auth token:', err);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const movieService = {
  getAll: () => api.get<Movie[]>('/movies').then(res => res.data),
  getById: (id: number) => api.get<Movie>(`/movies/${id}`).then(res => res.data),
  create: (data: Omit<Movie, 'id' | 'created_at'>) => api.post<Movie>('/movies', data).then(res => res.data),
  update: (id: number, data: Omit<Movie, 'id' | 'created_at'>) => api.put<Movie>(`/movies/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/movies/${id}`).then(res => res.data),
};

export const showService = {
  getAll: () => api.get<Show[]>('/shows').then(res => res.data),
  getById: (id: number) => api.get<Show>(`/shows/${id}`).then(res => res.data),
  getByMovie: (movieId: number) => api.get<Show[]>(`/shows/movie/${movieId}`).then(res => res.data),
  create: (data: { movie_id: number; show_date: string; show_time: string; screen_number: number; price: number }) =>
    api.post<Show>('/shows', data).then(res => res.data),
  update: (id: number, data: { movie_id: number; show_date: string; show_time: string; screen_number: number; price: number }) =>
    api.put<Show>(`/shows/${id}`, data).then(res => res.data),
  delete: (id: number) => api.delete(`/shows/${id}`).then(res => res.data),
};

export const seatService = {
  getByShow: (showId: number) => api.get<Seat[]>(`/seats/show/${showId}`).then(res => res.data),
};

export const bookingService = {
  create: (data: BookingRequest) => api.post<Booking>('/bookings', data).then(res => res.data),
  getById: (id: number, token: string) =>
    api.get<Booking>(`/bookings/${id}`, { params: { token } }).then(res => res.data),
  getByCustomer: (email: string) => api.get<Booking[]>(`/bookings/customer/${encodeURIComponent(email)}`).then(res => res.data),
  getAll: () => api.get<Booking[]>('/bookings').then(res => res.data),
  delete: (id: number) => api.delete(`/bookings/${id}`).then(res => res.data),
};

export const reportService = {
  getTotalBookings: () => api.get<TotalBookingsReport>('/reports/total-bookings').then(res => res.data),
  getRevenueByMovie: () => api.get<RevenueByMovie[]>('/reports/revenue-by-movie').then(res => res.data),
  getRevenueByShow: () => api.get<RevenueByShow[]>('/reports/revenue-by-show').then(res => res.data),
  getAvailableSeats: () => api.get('/reports/available-seats').then(res => res.data),
  getBookedSeats: () => api.get('/reports/booked-seats').then(res => res.data),
};

export default api;

