import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { movieService } from '../services/api';
import { useFetch } from '../hooks/useFetch';
import MovieCard from '../components/MovieCard';

export default function Home() {
  const { data: movies, loading } = useFetch(() => movieService.getAll(), []);
  const [currentIdx, setCurrentIdx] = useState(1);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Carousel is limited to the top 5 movies (making sure Spider-Man is always first/included)
  const slideMovies = movies
    ? [
        ...movies.filter(m => m.title.toLowerCase().includes('spider-man')),
        ...movies.filter(m => !m.title.toLowerCase().includes('spider-man'))
      ].slice(0, 5)
    : [];

  // Extended slides for infinite sliding loop: [Last, Slide1, Slide2, ..., SlideN, First]
  const extendedSlides = slideMovies.length > 0
    ? [slideMovies[slideMovies.length - 1], ...slideMovies, slideMovies[0]]
    : [];

  // Handle endless loop jump corrections when sitting on a cloned slide
  useEffect(() => {
    if (slideMovies.length === 0) return;
    if (currentIdx === 0) {
      const timer = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrentIdx(slideMovies.length);
      }, 1200); // Sync with transition time
      return () => clearTimeout(timer);
    }
    if (currentIdx === slideMovies.length + 1) {
      const timer = setTimeout(() => {
        setTransitionEnabled(false);
        setCurrentIdx(1);
      }, 1200); // Sync with transition time
      return () => clearTimeout(timer);
    }
  }, [currentIdx, slideMovies.length]);

  // Auto play carousel every 10 seconds, resets timer on user interaction
  useEffect(() => {
    if (slideMovies.length === 0) return;
    const timer = setInterval(() => {
      handleNext();
    }, 10000);
    return () => clearInterval(timer);
  }, [slideMovies.length, currentIdx]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-neutral-400">
        Loading CineBook...
      </div>
    );
  }

  const handlePrev = () => {
    if (slideMovies.length === 0) return;

    if (currentIdx <= 0) {
      // Jump instantly to last slide (length), then transition to length - 1
      setTransitionEnabled(false);
      setCurrentIdx(slideMovies.length);
      setTimeout(() => {
        setTransitionEnabled(true);
        setCurrentIdx(slideMovies.length - 1);
      }, 20);
    } else if (currentIdx === slideMovies.length + 1) {
      // Jump instantly to 1, then transition to 0
      setTransitionEnabled(false);
      setCurrentIdx(1);
      setTimeout(() => {
        setTransitionEnabled(true);
        setCurrentIdx(0);
      }, 20);
    } else {
      setTransitionEnabled(true);
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (slideMovies.length === 0) return;

    if (currentIdx >= slideMovies.length + 1) {
      // Jump instantly to 1, then transition to 2
      setTransitionEnabled(false);
      setCurrentIdx(1);
      setTimeout(() => {
        setTransitionEnabled(true);
        setCurrentIdx(2);
      }, 20);
    } else if (currentIdx === 0) {
      // Jump instantly to last slide (length), then transition to length + 1
      setTransitionEnabled(false);
      setCurrentIdx(slideMovies.length);
      setTimeout(() => {
        setTransitionEnabled(true);
        setCurrentIdx(slideMovies.length + 1);
      }, 20);
    } else {
      setTransitionEnabled(true);
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handleDotClick = (slideIdx: number) => {
    setTransitionEnabled(true);
    setCurrentIdx(slideIdx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      handleNext();
    }
    if (isRightSwipe) {
      handlePrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Exact subtitle details matching the BookMyShow screenshot for both Hero and Grid Cards
  const getSubDetails = (title: string) => {
    switch (title) {
      case 'Spider-Man: Brand New Day':
        return 'UA13+ | Action, Sci-Fi, Adventure';
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

  // Calculate active dot index
  const getActiveDotIdx = () => {
    if (slideMovies.length === 0) return 0;
    if (currentIdx === 0) return slideMovies.length - 1;
    if (currentIdx === slideMovies.length + 1) return 0;
    return currentIdx - 1;
  };
  const activeDotIdx = getActiveDotIdx();

  return (
    <div className="w-full">
      {/* Premium Hero Carousel (True Continuous Sliding Track, Limited to Top 5) */}
      {slideMovies.length > 0 && (
        <div className="relative w-full min-h-[440px] flex flex-col justify-start md:justify-center">
          
          {/* Left Arrow (Placed closer inward and slightly higher) */}
          <button
            onClick={handlePrev}
            className="hidden md:block absolute left-12 md:left-24 lg:left-32 top-[44%] -translate-y-1/2 z-10 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer select-none"
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6 md:w-8 md:h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
 
          {/* Right Arrow (Placed closer inward and slightly higher) */}
          <button
            onClick={handleNext}
            className="hidden md:block absolute right-12 md:right-24 lg:right-32 top-[44%] -translate-y-1/2 z-10 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer select-none"
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6 md:w-8 md:h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
 
          {/* Sliding Viewport Window */}
          <div 
            className="w-full overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="flex"
              style={{ 
                transform: `translateX(-${currentIdx * 100}%)`,
                transition: transitionEnabled ? 'transform 1200ms cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
              }}
            >
              {extendedSlides.map((movie, idx) => (
                <div 
                  key={`${movie.id}-${idx}`} 
                  className="w-full flex-shrink-0 relative flex items-center justify-center pt-10 pb-16 md:pt-14 md:pb-24"
                >
                  {/* Blurred Background Poster Backdrop inside the slide (so color backdrop slides along with the text!) */}
                  {movie.poster_url && (
                    <div className="absolute inset-0 select-none pointer-events-none overflow-hidden z-0">
                      <img
                        src={movie.poster_url}
                        alt=""
                        className="w-full h-full object-cover scale-150 opacity-[0.22] origin-center"
                        style={{ filter: 'blur(100px)' }}
                      />
                      {/* Deep edge gradient fading the blurred backdrop to solid white at the bottom */}
                      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-white via-white/80 to-transparent" />
                    </div>
                  )}
 
                  {/* Centered Hero Content Grid (Clicking anywhere opens booking details) */}
                  <Link
                    to={`/movies/${movie.id}`}
                    className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-center z-10 hover:no-underline block cursor-pointer"
                  >
                    {/* Mobile View: Slidable Card (exact match to user screenshot layout) */}
                    <div className="block md:hidden w-full max-w-md bg-white rounded-3xl overflow-hidden border border-neutral-100 shadow-lg shadow-neutral-200/50 flex flex-col mx-2">
                      <div className="w-full aspect-[16/10] overflow-hidden bg-neutral-100 relative">
                        {movie.poster_url ? (
                          <img
                            src={movie.poster_url}
                            alt={movie.title}
                            className="w-full h-full object-cover object-top"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-3xl">
                            🎬
                          </div>
                        )}
                      </div>
                      <div className="p-5 text-left bg-white space-y-1">
                        <h3 className="text-lg font-bold text-neutral-900 leading-tight">
                          {movie.title}
                        </h3>
                        <p className="text-xs font-semibold text-neutral-400">
                          {getSubDetails(movie.title).split('|')[0].trim()}
                        </p>
                      </div>
                    </div>
 
                    {/* Desktop View: Premium Split Columns */}
                    <div className="hidden md:flex w-full flex-row items-center justify-between gap-12">
                      {/* Left Movie Info Column */}
                      <div className="flex-1 text-left space-y-4 max-w-xl">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
                          {movie.title}
                        </h1>
                        
                        <div className="text-base md:text-lg lg:text-xl text-neutral-900 font-bold tracking-tight">
                          {getSubDetails(movie.title)}
                        </div>
 
                        {movie.description && (
                          <p className="text-sm md:text-base text-neutral-600 leading-relaxed font-normal">
                            {movie.description}
                          </p>
                        )}
 
                        <div className="pt-4">
                          <span
                            className="inline-block bg-neutral-950 hover:bg-neutral-800 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors duration-200"
                          >
                            Book now
                          </span>
                        </div>
                      </div>
 
                      {/* Right Movie Poster Card Column */}
                      <div className="shrink-0 w-64 md:w-80 lg:w-[350px] rounded-2xl overflow-hidden shadow-2xl shadow-neutral-400/50 bg-white">
                        {movie.poster_url ? (
                          <img
                            src={movie.poster_url}
                            alt={movie.title}
                            className="w-full h-auto block"
                          />
                        ) : (
                          <div className="aspect-[2/3] w-full bg-neutral-100 flex items-center justify-center text-neutral-400 text-4xl">
                            🎬
                          </div>
                        )}
                      </div>
                    </div>
 
                  </Link>
                </div>
              ))}
            </div>
          </div>
 
          {/* Centered Pagination Indicators below the slider viewport */}
          <div className="flex items-center justify-center gap-2 mt-2">
            {slideMovies.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleDotClick(idx + 1)}
                className={`transition-all duration-300 h-1.5 rounded-full cursor-pointer ${
                  activeDotIdx === idx ? 'w-5 bg-neutral-900' : 'w-1.5 bg-neutral-300 hover:bg-neutral-400'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      )}

      {/* Spacing adjustments */}
      <div className="pt-10"></div>

      {/* This Week's Releases Grid (Constrained Width) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-neutral-900 tracking-tight">
            This Week's Releases
          </h2>
          <Link to="/movies" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-6">
          {movies?.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
    </div>
  );
}
