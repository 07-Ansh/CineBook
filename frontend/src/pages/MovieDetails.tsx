import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { movieService, showService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import { formatTime, formatCurrency } from '../utils/format';

interface MetadataType {
  cert: string;
  duration: string;
  languages: string;
  genres: string;
  year: string;
}

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>();
  const movieId = Number(id);

  const { data: movie, loading: movieLoading } = useFetch(() => movieService.getById(movieId), [movieId]);
  const { data: shows, loading: showsLoading } = useFetch(() => showService.getByMovie(movieId), [movieId]);

  const uniqueDateStrings = shows
    ? Array.from(
        new Set(
          shows.map(s => (typeof s.show_date === 'string' ? s.show_date.split('T')[0] : ''))
        )
      )
        .filter(Boolean)
        .sort()
    : [];

  const parsedDates = uniqueDateStrings.map(dateStr => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      key: dateStr,
      dayNum: String(day),
      dayName: days[d.getDay()],
      month: months[month - 1]
    };
  });

  const dates = parsedDates;

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFiltersDropdown, setShowFiltersDropdown] = useState<boolean>(false);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [timeRange, setTimeRange] = useState<string>('All');

  useEffect(() => {
    if (uniqueDateStrings.length > 0 && (!selectedDate || !uniqueDateStrings.includes(selectedDate))) {
      setSelectedDate(uniqueDateStrings[0]);
    }
  }, [shows, uniqueDateStrings, selectedDate]);

  if (movieLoading) return <div className="text-center py-12 text-gray-400">Loading...</div>;
  if (!movie) return <div className="text-center py-12 text-red-500">Movie not found.</div>;

  const getMetadata = (title: string): MetadataType => {
    switch (title) {
      case 'Spider-Man: Brand New Day':
        return { cert: 'UA13+', duration: '2h 10m', languages: 'English', genres: 'Action, Sci-Fi, Adventure', year: '2026' };
      case 'Alpha':
        return { cert: 'UA16+', duration: '2h 0m', languages: 'English', genres: 'Action, Spy', year: '2026' };
      case 'Dhamaal 4':
        return { cert: 'UA13+', duration: '2h 10m', languages: 'Hindi', genres: 'Comedy', year: '2026' };
      case 'Evil Dead Burn':
        return { cert: 'A', duration: '1h 45m', languages: 'English, Hindi', genres: 'Horror, Thriller', year: '2026' };
      case 'Moana (2026)':
        return { cert: 'UA7+', duration: '1h 56m', languages: 'English, Hindi', genres: 'Adventure, Animation, Fantasy', year: '2026' };
      case 'The Invite':
        return { cert: 'A', duration: '1h 52m', languages: 'English', genres: 'Thriller, Mystery', year: '2026' };
      case 'Lenin':
        return { cert: 'UA16+', duration: '2h 20m', languages: 'Telugu', genres: 'Drama, Biography', year: '2026' };
      case 'Sarpanch':
        return { cert: 'UA16+', duration: '2h 15m', languages: 'Punjabi', genres: 'Drama, Family', year: '2026' };
      case 'Idhayam Murali':
        return { cert: 'UA13+', duration: '2h 12m', languages: 'Tamil', genres: 'Drama, Romance', year: '2026' };
      case 'I, Nobody':
        return { cert: 'UA13+', duration: '2h 5m', languages: 'Malayalam', genres: 'Drama, Comedy', year: '2026' };
      case 'Aajo Ardhangini':
        return { cert: 'UA16+', duration: '2h 18m', languages: 'Bengali', genres: 'Drama, Social', year: '2026' };
      default:
        return { cert: 'UA13+', duration: '2h 5m', languages: 'English', genres: 'Drama', year: '2026' };
    }
  };

  const meta = getMetadata(movie.title);

  const filterOptions = [
    '3D', 'IMAX 3D', 'After 5 PM', 'Recliners', 'Wheelchair Friendly', 'Premium Seats'
  ];

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const getTheatreName = (screenNum: number) => {
    switch (screenNum) {
      case 1:
        return 'Cinepolis: Mall of India, Noida';
      case 2:
        return 'PVR: Logix Gold Class, Sector 32';
      case 3:
        return 'INOX: Insignia Premium, Galleria';
      default:
        return `CineBook Multiplex Screen ${screenNum}`;
    }
  };

  const filteredShows = shows ? shows.filter(show => {
    const showDateStr = typeof show.show_date === 'string' ? show.show_date.split('T')[0] : '';
    const matchesDate = showDateStr === selectedDate;
    
    let matchesLanguage = true;
    if (selectedLanguage !== 'All' && show.language) {
      matchesLanguage = show.language.toLowerCase().includes(selectedLanguage.toLowerCase());
    } else if (selectedLanguage !== 'All' && movie.language) {
      matchesLanguage = movie.language.toLowerCase().includes(selectedLanguage.toLowerCase());
    }

    let matchesFeatures = true;
    if (activeFilters.includes('3D') && show.screen_number !== 1) matchesFeatures = false;
    if (activeFilters.includes('IMAX 3D') && show.screen_number !== 2) matchesFeatures = false;
    if (activeFilters.includes('After 5 PM')) {
      const [hour] = show.show_time.split(':').map(Number);
      if (hour < 17) matchesFeatures = false;
    }
    if (activeFilters.includes('Recliners') && show.screen_number !== 2 && show.screen_number !== 3) matchesFeatures = false;
    if (activeFilters.includes('Wheelchair Friendly') && show.screen_number !== 1 && show.screen_number !== 3) matchesFeatures = false;
    if (activeFilters.includes('Premium Seats') && show.screen_number !== 2) matchesFeatures = false;

    let matchesPrice = true;
    if (Number(show.price) > maxPrice) matchesPrice = false;

    let matchesTime = true;
    const [hour] = show.show_time.split(':').map(Number);
    if (timeRange === 'Morning' && hour >= 12) matchesTime = false;
    if (timeRange === 'Afternoon' && (hour < 12 || hour >= 17)) matchesTime = false;
    if (timeRange === 'Evening' && hour < 17) matchesTime = false;
    
    return matchesDate && matchesLanguage && matchesFeatures && matchesPrice && matchesTime;
  }) : [];

  return (
    <div className="w-full space-y-8">
      <div className="relative w-full overflow-hidden py-10 md:py-14 border-b border-neutral-100 flex items-center justify-center">
        {movie.poster_url && (
          <div className="absolute inset-0 select-none pointer-events-none overflow-hidden z-0">
            <img
              src={movie.poster_url}
              alt=""
              className="w-full h-full object-cover scale-150 opacity-[0.22] origin-center"
              style={{ filter: 'blur(100px)' }}
            />
            <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-white via-white/80 to-transparent" />
          </div>
        )}

        <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center sm:items-start gap-8 z-10">
          <div className="w-40 sm:w-48 shrink-0 rounded-2xl overflow-hidden shadow-xl border border-neutral-100 bg-white">
            {movie.poster_url ? (
              <img src={movie.poster_url} alt={movie.title} className="w-full h-auto block" />
            ) : (
              <div className="aspect-[2/3] w-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-5xl">🎬</div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">
              {movie.title} <span className="text-neutral-400 font-normal text-2xl">({meta.year})</span>
            </h1>

            <div className="flex items-center justify-center sm:justify-start gap-2.5 text-sm text-neutral-800 font-semibold">
              <span className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded text-xs tracking-wider">{meta.cert}</span>
              <span className="text-neutral-300 font-normal">|</span>
              <span>{meta.duration}</span>
            </div>

            <div className="text-sm text-neutral-600 font-medium">
              {meta.languages}
            </div>

            <div className="text-sm text-neutral-500">
              {meta.genres}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8 pb-10">
        <div className="bg-white border-y border-neutral-100 py-3.5 flex items-center gap-4 overflow-x-auto scrollbar-none select-none w-full">
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex flex-col items-center justify-center text-[10px] font-bold text-neutral-400 border-r border-neutral-200 pr-4 leading-tight">
              <span>{dates[0]?.month}</span>
            </div>

            <div className="flex items-center gap-3">
              {dates.map(date => {
                const isSelected = selectedDate === date.key;
                return (
                  <button
                    key={date.key}
                    onClick={() => setSelectedDate(date.key)}
                    className={`flex flex-col items-center justify-center w-12 py-2 rounded-2xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-900 text-white font-bold shadow-md shadow-neutral-950/20'
                        : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-sm font-semibold leading-none">{date.dayNum}</span>
                    <span className="text-[10px] font-medium mt-1 leading-none uppercase">{date.dayName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-8 w-px bg-neutral-200 shrink-0 mx-2" />

          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setShowFiltersDropdown(!showFiltersDropdown)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors cursor-pointer ${
                showFiltersDropdown || maxPrice < 1000 || timeRange !== 'All'
                  ? 'bg-neutral-900 border-neutral-900 text-white'
                  : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              <span>Filters</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-1.5 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 outline-none cursor-pointer"
            >
              <option value="All">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>

            {filterOptions.map(filter => {
              const isActive = activeFilters.includes(filter);
              return (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-neutral-900 border-neutral-900 text-white'
                      : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {showFiltersDropdown && (
          <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-5 flex flex-wrap gap-8 items-start text-xs font-semibold text-neutral-700 select-none">
            <div className="space-y-2.5">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Filter By Price</span>
              <div className="flex gap-2">
                {[
                  { label: 'All Prices', val: 1000 },
                  { label: 'Under ₹250', val: 249 },
                  { label: 'Under ₹400', val: 399 }
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setMaxPrice(opt.val)}
                    className={`px-3.5 py-2 rounded-xl border transition-colors cursor-pointer ${
                      maxPrice === opt.val
                        ? 'bg-neutral-900 border-neutral-900 text-white font-bold'
                        : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">Filter By Show Time</span>
              <div className="flex gap-2">
                {[
                  { label: 'All Shows', val: 'All' },
                  { label: 'Morning (Before 12 PM)', val: 'Morning' },
                  { label: 'Afternoon (12 PM - 5 PM)', val: 'Afternoon' },
                  { label: 'Evening (After 5 PM)', val: 'Evening' }
                ].map(opt => (
                  <button
                    key={opt.val}
                    onClick={() => setTimeRange(opt.val)}
                    className={`px-3.5 py-2 rounded-xl border transition-colors cursor-pointer ${
                      timeRange === opt.val
                        ? 'bg-neutral-900 border-neutral-900 text-white font-bold'
                        : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-6 py-2.5 px-4 bg-neutral-50 rounded-xl text-[11px] font-semibold text-neutral-600 select-none">
          <div className="flex items-center gap-1.5">
            <span className="text-neutral-400">●</span>
            <span>English subtitle</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-green-500">●</span>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-amber-500">●</span>
            <span>Filling fast</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-red-500">●</span>
            <span>Almost full</span>
          </div>
        </div>

        <div className="space-y-6 pt-4">
          {showsLoading ? (
            <div className="text-neutral-400 text-center py-8">Loading available shows...</div>
          ) : filteredShows.length > 0 ? (
            <div className="border border-neutral-100 rounded-2xl overflow-hidden bg-white shadow-sm divide-y divide-neutral-100">
              {Array.from(new Set(filteredShows.map(s => s.screen_number))).map(screenNum => {
                const theatreShows = filteredShows.filter(s => s.screen_number === screenNum);
                const theatreName = getTheatreName(screenNum);

                return (
                  <div key={screenNum} className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="md:w-72 shrink-0 space-y-1">
                      <h3 className="font-bold text-neutral-800 text-sm">
                        {theatreName}
                      </h3>
                      <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                        <span>Screen {screenNum}</span>
                        <span>•</span>
                        <span className="text-indigo-600 font-extrabold">IMAX 3D</span>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-wrap gap-3">
                      {theatreShows.map(show => {
                        const leftSeats = show.available_seats !== undefined ? Number(show.available_seats) : 100;
                        let legendColor = 'text-green-600 border-neutral-200 hover:bg-neutral-50';
                        if (leftSeats <= 10) {
                          legendColor = 'text-red-600 border-red-200 bg-red-50/20 hover:bg-red-50/50';
                        } else if (leftSeats <= 30) {
                          legendColor = 'text-amber-600 border-amber-200 bg-amber-50/20 hover:bg-amber-50/50';
                        }

                        return (
                          <Link
                            key={show.id}
                            to={`/shows/${show.id}/seats`}
                            className={`flex flex-col items-center justify-center border px-5 py-2.5 rounded-xl transition-all text-center min-w-[100px] cursor-pointer group ${legendColor}`}
                          >
                            <span className="text-sm font-bold tracking-tight">{formatTime(show.show_time)}</span>
                            <span className="text-[10px] opacity-60 font-semibold mt-1 group-hover:opacity-100">
                              {formatCurrency(show.price)}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-neutral-400 py-16 text-center border border-dashed border-neutral-200 rounded-2xl">
              No shows scheduled for {dates.find(d => d.key === selectedDate)?.dayNum} {dates.find(d => d.key === selectedDate)?.month}.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

