export interface Movie {
  id: number;
  title: string;
  genre: string;
  duration: number;
  language: string;
  release_date: string;
  poster_url: string | null;
  description: string | null;
  created_at: string;
}

export interface Show {
  id: number;
  movie_id: number;
  show_date: string;
  show_time: string;
  screen_number: number;
  price: string;
  created_at: string;
  movie_title?: string;
  poster_url?: string;
  genre?: string;
  duration?: number;
  language?: string;
  available_seats?: string;
}

export interface Seat {
  id: number;
  show_id: number;
  seat_row: string;
  seat_number: number;
  is_booked: boolean;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface Booking {
  id: number;
  token?: string;
  customer_id: number;
  show_id: number;
  total_amount: string;
  booking_date: string;
  status: string;
  created_at: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  movie_title?: string;
  show_date?: string;
  show_time?: string;
  screen_number?: number;
  ticket_price?: string;
  seats?: { seat_row: string; seat_number: number }[];
}

export interface TotalBookingsReport {
  total_bookings: string;
  total_revenue: string;
}

export interface RevenueByMovie {
  movie_id: number;
  movie_title: string;
  total_bookings: string;
  total_revenue: string;
}

export interface RevenueByShow {
  show_id: number;
  movie_title: string;
  show_date: string;
  show_time: string;
  screen_number: number;
  ticket_price: string;
  total_bookings: string;
  total_revenue: string;
}

export interface BookingRequest {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  show_id: number;
  seat_ids: number[];
}

