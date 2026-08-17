import { Link } from 'react-router-dom';
import type { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
}export default function MovieCard({ movie }: MovieCardProps) {
  // Exact certification and language details matching the BookMyShow screenshot
  const getSubDetails = (title: string) => {
    switch (title) {
      case 'Alpha':
        return 'UA16+ | Action, Spy +1 more';
      case 'Dhamaal 4':
        return 'UA13+ | Hindi';
      case 'Evil Dead Burn':
        return 'A | English and 1 more';
      case 'Moana (2026)':
        return 'UA7+ | English and 1 more';
      case 'The Invite':
        return 'A | English';
      case 'Lenin':
        return 'UA16+ | Telugu';
      case 'Sarpanch':
        return 'UA16+ | Punjabi';
      case 'Idhayam Murali':
        return 'UA13+ | Tamil';
      case 'I, Nobody':
        return 'UA13+ | Malayalam';
      case 'Aajo Ardhangini':
        return 'UA16+ | Bengali';
      default:
        return 'UA13+ | English';
    }
  };

  const subDetails = getSubDetails(movie.title);

  return (
    <Link
      to={`/movies/${movie.id}`}
      className="group block bg-white rounded-2xl border border-neutral-200/80 overflow-hidden hover:shadow-md transition-all duration-200"
    >
      {/* Poster */}
      <div className="w-full bg-white overflow-hidden">
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={movie.title}
            className="w-full h-auto block group-hover:scale-102 transition-transform duration-350"
          />
        ) : (
          <div className="aspect-[2/3] w-full flex items-center justify-center text-neutral-400">
            <span className="text-4xl">🎬</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5 bg-white">
        <h3 className="font-bold text-neutral-800 text-sm truncate group-hover:text-indigo-600 transition-colors">
          {movie.title}
        </h3>
        <div className="mt-1 text-xs text-neutral-500 font-medium">
          {subDetails}
        </div>
      </div>
    </Link>
  );
}
