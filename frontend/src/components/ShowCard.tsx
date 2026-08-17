import { Link } from 'react-router-dom';
import type { Show } from '../types';
import { formatDate, formatTime, formatCurrency } from '../utils/format';

interface ShowCardProps {
  show: Show;
}

export default function ShowCard({ show }: ShowCardProps) {
  return (
    <Link
      to={`/shows/${show.id}/seats`}
      className="block bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900">
            {formatDate(show.show_date)}
          </div>
          <div className="text-lg font-semibold text-indigo-600">
            {formatTime(show.show_time)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Screen {show.screen_number}</div>
          <div className="font-semibold text-gray-900">{formatCurrency(show.price)}</div>
          {show.available_seats !== undefined && (
            <div className="text-sm text-gray-500">
              {show.available_seats} seats left
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
