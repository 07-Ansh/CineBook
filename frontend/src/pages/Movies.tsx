import { movieService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import MovieCard from '../components/MovieCard';

export default function Movies() {
  const { data: movies, loading, error } = useFetch(() => movieService.getAll(), []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">All Movies</h1>

      {loading && <div className="text-center py-12 text-gray-400">Loading movies...</div>}
      {error && <div className="text-center py-12 text-red-500">{error}</div>}

      {movies && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {movies && movies.length === 0 && (
        <div className="text-center py-12 text-gray-400">No movies available.</div>
      )}
    </div>
  );
}
