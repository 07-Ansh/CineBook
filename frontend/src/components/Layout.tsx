import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { movieService } from '../services/api';
import type { Movie } from '../types';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/movies', label: 'Movies' },
  { to: '/bookings/history', label: 'My Bookings' },
];

const adminLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/movies', label: 'Movies' },
  { to: '/admin/shows', label: 'Shows' },
  { to: '/admin/bookings', label: 'Bookings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');
  const { user, loginWithGoogle, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedCity, setSelectedCity] = useState(() => localStorage.getItem('selectedCity') || 'Delhi NCR');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const cities = ['Delhi NCR', 'Mumbai', 'Bengaluru', 'Pune', 'Hyderabad', 'Chennai', 'Kolkata'];

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Fetch movies on mount to allow local client-side instant search
  useEffect(() => {
    movieService.getAll().then(setMovies).catch(console.error);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setShowMobileMenu(false);
    setShowDropdown(false);
    setShowCityDropdown(false);
    setShowProfileModal(false);
  }, [location.pathname]);

  // Handle click outside of dropdowns to close them
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectCity = (city: string) => {
    if (city !== 'Delhi NCR') {
      alert(`Coming soon to ${city}! Currently showing movies only in Delhi NCR.`);
      setShowCityDropdown(false);
      return;
    }
    setSelectedCity(city);
    localStorage.setItem('selectedCity', city);
    setShowCityDropdown(false);
  };

  const filteredMovies = searchQuery.trim()
    ? movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-100/80 shadow-sm relative z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Left: Logo & City Selector Group */}
            <div className="flex items-center gap-3.5 shrink-0">
              <Link to="/" className="flex items-center shrink-0">
                <img
                  src="/Assets/Logo/LOGO-TP.png"
                  alt="CineBook Logo"
                  className="h-20 w-auto object-contain transition-all hover:opacity-90 active:scale-95"
                />
              </Link>

              {/* City Selector Dropdown */}
              <div ref={cityDropdownRef} className="relative">
                <button
                  onClick={() => setShowCityDropdown(prev => !prev)}
                  className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-neutral-50 rounded-full text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-all cursor-pointer border border-neutral-100/40 hover:border-neutral-200"
                >
                  <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span>{selectedCity}</span>
                  <svg className={`w-2 h-2 text-neutral-400 transition-transform duration-200 ${showCityDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {/* City Dropdown Panel */}
                {showCityDropdown && (
                  <div className="absolute left-0 mt-2 w-44 bg-white border border-neutral-100 rounded-2xl shadow-xl z-50 py-1 divide-y divide-neutral-50">
                    <div className="px-4 py-1.5 text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Choose City</div>
                    <div className="py-1">
                      {cities.map(city => (
                        <button
                          key={city}
                          onClick={() => selectCity(city)}
                          className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-neutral-50 transition-colors cursor-pointer flex items-center justify-between ${selectedCity === city ? 'text-indigo-600 bg-indigo-50/40' : 'text-neutral-600'
                            }`}
                        >
                          <span>{city}</span>
                          {selectedCity === city && (
                            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Middle: Instant Search Bar (Desktop only) */}
            <div ref={dropdownRef} className="hidden md:block flex-1 max-w-sm md:max-w-md lg:max-w-lg mx-8 relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for movies..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-11 pr-10 py-2.5 bg-neutral-50 hover:bg-neutral-100/80 focus:bg-white border border-neutral-200 focus:border-indigo-500 rounded-full text-sm transition-all focus:outline-none placeholder-neutral-400 shadow-inner"
                />
                {/* Search Icon */}
                <svg
                  className="absolute left-4 top-3.5 w-4 h-4 text-neutral-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {/* Clear Icon */}
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setShowDropdown(false);
                    }}
                    className="absolute right-3.5 top-3 w-5 h-5 flex items-center justify-center rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-600 cursor-pointer transition-colors"
                  >
                    <span className="text-[11px] font-extrabold">×</span>
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown Panel */}
              {showDropdown && filteredMovies.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-neutral-100 rounded-2xl shadow-xl z-50 max-h-80 overflow-y-auto divide-y divide-neutral-50 py-1">
                  {filteredMovies.map(movie => (
                    <button
                      key={movie.id}
                      onClick={() => {
                        navigate(`/movies/${movie.id}`);
                        setSearchQuery('');
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 transition-colors text-left cursor-pointer"
                    >
                      <img
                        src={movie.poster_url || undefined}
                        alt=""
                        className="w-8 h-11 object-cover rounded-md border border-neutral-100 bg-neutral-50 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-neutral-800 truncate">{movie.title}</h4>
                        <p className="text-[10px] text-neutral-400 truncate mt-0.5">{movie.genre}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Desktop Links & Google Auth (Desktop only) */}
            <div className="hidden md:flex items-center gap-1 shrink-0">
              {(isAdmin ? adminLinks : navLinks).map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === link.to
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Toggle between Customer / Admin */}
              {user?.email === import.meta.env.VITE_ADMIN_EMAIL && (
                <div className="ml-4 border-l border-gray-200 pl-4 flex items-center">
                  <Link
                    to={isAdmin ? '/' : '/admin'}
                    className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
                  >
                    {isAdmin ? '← Customer' : 'Admin →'}
                  </Link>
                </div>
              )}

              {/* Google Auth Controls */}
              <div className="border-l border-gray-200 ml-4 pl-4 flex items-center">
                {user ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={user.photoURL || 'https://www.gravatar.com/avatar?d=mp'}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full border border-neutral-200 shadow-sm"
                    />
                    <span className="hidden lg:inline text-xs font-semibold text-neutral-700 max-w-[80px] truncate">
                      {user.displayName}
                    </span>
                    <button
                      onClick={logout}
                      className="text-xs font-bold text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={loginWithGoogle}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral-200 hover:border-neutral-300 rounded-full text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-all shadow-sm cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.23 2.764 1.34 6.8l3.926 2.965z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.49 12.275c0-.818-.073-1.609-.21-2.373H12v4.491h6.445a5.516 5.516 0 0 1-2.39 3.62l3.743 2.9A11.905 11.905 0 0 0 24 12c0-.1-.005-.195-.01-.29-.114.195-.23.386-.35.565z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M1.34 6.8a11.932 11.932 0 0 0 0 10.4l3.926-2.965a7.042 7.042 0 0 1 0-4.47L1.34 6.8z"
                      />
                      <path
                        fill="#34A853"
                        d="M5.266 14.235a7.077 7.077 0 0 1-3.926 2.965C3.23 21.236 7.27 24 12 24c3.12 0 5.864-1.127 8.01-3.055l-3.743-2.9a7.065 7.065 0 0 1-11.001-3.81z"
                      />
                    </svg>
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Search toggle */}
            <div className="flex md:hidden items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowMobileMenu(prev => !prev)}
                className="p-2 rounded-full hover:bg-neutral-50 text-neutral-500 hover:text-neutral-700 transition-colors focus:outline-none cursor-pointer"
                aria-label="Toggle Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Search Dropdown Panel */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-neutral-100 bg-white py-3 px-4 shadow-inner">
            {/* Mobile Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-10 py-2 bg-neutral-50 border border-neutral-200 rounded-full text-xs focus:outline-none focus:border-indigo-500"
              />
              <svg className="absolute left-3.5 top-2.5 w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-2.5 w-4 h-4 flex items-center justify-center rounded-full bg-neutral-200 text-neutral-600 text-[10px] font-extrabold cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>

            {/* Autocomplete list in mobile drawer */}
            {searchQuery.trim() && filteredMovies.length > 0 && (
              <div className="mt-2 border border-neutral-100 rounded-2xl divide-y divide-neutral-50 bg-white max-h-60 overflow-y-auto shadow-sm">
                {filteredMovies.map(movie => (
                  <button
                    key={movie.id}
                    type="button"
                    onClick={() => {
                      navigate(`/movies/${movie.id}`);
                      setSearchQuery('');
                      setShowMobileMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-xs font-semibold hover:bg-neutral-50 text-neutral-700 flex items-center gap-3 cursor-pointer"
                  >
                    <img src={movie.poster_url || undefined} alt="" className="w-6 h-8 object-cover rounded-md border border-neutral-100 bg-neutral-50" />
                    <span>{movie.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className={
        (location.pathname === '/' || location.pathname === '' || /^\/movies\/\d+\/?$/.test(location.pathname)) 
          ? "w-full pt-0 pb-28 md:pb-12 min-h-[75vh]" 
          : "max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-28 md:pb-12 min-h-[75vh]"
      }>
        {children}
      </main>

      {/* Footer */}
      {location.pathname === '/' || location.pathname === '' ? (
        // Simple Centered Footer for Main Page
        <footer className="hidden md:block w-full py-12 border-t border-neutral-200/60 bg-neutral-50 text-xs md:text-sm font-semibold text-neutral-400 pb-28 md:pb-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
              {/* Left Column: Brand & Creator */}
              <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
                <img
                  src="/Assets/Logo/LOGO-TP.png"
                  alt="CineBook Logo"
                  className="h-16 md:h-20 w-auto object-contain transition-all hover:scale-[1.03] active:scale-95 duration-300"
                />
                <p className="text-[11px] md:text-[13px] text-neutral-400 font-semibold mt-1">
                  Made with <span className="text-red-500 animate-pulse">❤️</span> by{' '}
                  <a
                    href="https://ansh.one"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-800 font-extrabold hover:text-indigo-600 transition-colors underline decoration-indigo-500/30"
                  >
                    Ansh Sharma
                  </a>
                </p>
                <p className="text-[10px] md:text-[11px] text-neutral-400/70 font-semibold italic">
                  A personal full-stack showcase project
                </p>
                <div className="flex items-center gap-2.5 text-[10px] md:text-xs text-neutral-400 font-bold mt-1">
                  <a
                    href="https://github.com/07-Ansh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-600 transition-colors underline decoration-indigo-500/15"
                  >
                    GitHub
                  </a>
                  <span className="text-neutral-300">•</span>
                  <a
                    href="https://ansh.one"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-indigo-600 transition-colors underline decoration-indigo-500/15"
                  >
                    Portfolio
                  </a>
                </div>
              </div>

              {/* Right Column: Policies & Disclaimer */}
              <div className="flex flex-col items-center md:items-end gap-3 text-center md:text-right md:max-w-lg md:pt-8">
                <div className="flex justify-center md:justify-end gap-6 text-[11px] md:text-[13px] font-bold text-neutral-500">
                  <Link to="/terms" className="hover:text-indigo-600 transition-colors">Terms & Conditions</Link>
                  <Link to="/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
                </div>
                <p className="text-[11px] md:text-[13px] text-neutral-400 font-semibold">
                  &copy; {new Date().getFullYear()} CineBook. All rights reserved.
                </p>
                <p className="text-[10px] md:text-[11.5px] text-neutral-400/80 leading-relaxed font-semibold">
                  By accessing this page, you confirm that you have read, understood, and agreed to our Terms of Service, Privacy Policy, and Content Guidelines.
                </p>

              </div>
            </div>
          </div>
        </footer>
      ) : (
        // Detailed Grid Footer for Other Pages
        <footer className="hidden md:block w-full py-10 md:py-16 bg-neutral-50 border-t border-neutral-200/60 text-xs font-semibold text-neutral-400 pb-28 md:pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
            {/* Main Footer Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
              {/* Column 1: Brand & Tagline (span 6) */}
              <div className="md:col-span-6 flex flex-col items-center md:items-start gap-3 text-center md:text-left">
                <img
                  src="/Assets/Logo/LOGO-TP.png"
                  alt="CineBook Logo"
                  className="h-20 md:h-24 w-auto object-contain mx-auto md:mx-0 transition-all hover:scale-[1.03] active:scale-95 duration-300 shrink-0"
                />
                <div className="space-y-2">
                  <p className="text-[12px] text-neutral-500 font-bold leading-relaxed max-w-sm mx-auto md:mx-0">
                    Your ultimate destination for seamless cinema ticket bookings. Explore releases, schedule shows, and reserve seats instantly.
                  </p>
                  <p className="text-[11px] text-neutral-400 font-semibold">
                    Made with <span className="text-red-500 animate-pulse">❤️</span> by{' '}
                    <a
                      href="https://ansh.one"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-700 font-extrabold hover:text-indigo-600 transition-colors underline decoration-neutral-300"
                    >
                      Ansh Sharma
                    </a>
                  </p>
                </div>
              </div>

              {/* Column 2 & 3: Legal + Connect — side by side on mobile */}
              <div className="md:contents grid grid-cols-2 gap-6 md:gap-0">
                {/* Column 2: Legal */}
                <div className="md:col-span-3 text-center md:text-center space-y-3 md:pt-5">
                  <h4 className="text-[11px] uppercase tracking-widest font-black text-neutral-900">Legal</h4>
                  <ul className="space-y-2.5">
                    <li>
                      <Link to="/terms" className="text-neutral-500 hover:text-indigo-600 font-bold transition-colors">
                        Terms &amp; Conditions
                      </Link>
                    </li>
                    <li>
                      <Link to="/privacy" className="text-neutral-500 hover:text-indigo-600 font-bold transition-colors">
                        Privacy Policy
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 3: Connect */}
                <div className="md:col-span-3 text-center md:text-right space-y-3 md:pt-5">
                  <h4 className="text-[11px] uppercase tracking-widest font-black text-neutral-900">Connect</h4>
                  <ul className="space-y-2.5">
                    <li>
                      <a
                        href="https://ansh.one"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-500 hover:text-indigo-600 font-bold transition-colors"
                      >
                        Contact Us
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://github.com/07-Ansh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-500 hover:text-indigo-600 font-bold transition-colors"
                      >
                        GitHub Portfolio
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

            </div>

            <div className="border-t border-neutral-200/40 pt-8">
              {/* Disclaimer & Copyright */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 text-center md:text-left">
                <p className="text-[10px] text-neutral-400 leading-relaxed font-semibold max-w-2xl">
                  By accessing this page, you confirm that you have read, understood, and agreed to our Terms of Service, Privacy Policy, and Content Guidelines. All rights reserved.
                </p>
                <div className="flex flex-col items-center md:items-end gap-1.5 shrink-0">
                  <p className="text-[10.5px] text-neutral-400 font-semibold">
                    &copy; {new Date().getFullYear()} CineBook.
                  </p>
                  <span className="text-[9px] font-bold text-neutral-400/70 italic">
                    A personal full-stack showcase project
                  </span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Mobile Bottom Dock Bar — hidden on seat selection/booking confirmation pages and on print */}
      <div className={`fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-neutral-200/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] px-4 py-2.5 pb-5 flex justify-around items-center transition-transform duration-300 print:hidden ${(/^\/shows\/\d+\/seats/.test(location.pathname) || /^\/bookings\/\d+$/.test(location.pathname)) ? 'translate-y-full pointer-events-none' : 'translate-y-0'}`}>
        {user?.email === import.meta.env.VITE_ADMIN_EMAIL ? (
          // Admin User Dock
          isAdmin ? (
            // Admin Mode Options
            <>
              {/* Admin Dashboard */}
              <Link
                to="/admin"
                className={`flex flex-col items-center gap-1 transition-colors ${
                  location.pathname === '/admin' ? 'text-indigo-600' : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25a2.25 2.25 0 01-2.25 2.25h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                <span className="text-[9px] font-extrabold uppercase tracking-wider">Dashboard</span>
              </Link>

              {/* Admin Movies */}
              <Link
                to="/admin/movies"
                className={`flex flex-col items-center gap-1 transition-colors ${
                  location.pathname === '/admin/movies' ? 'text-indigo-600' : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6h16.5M3.75 12h16.5M3.75 18h16.5M9 3.75v16.5M15 3.75v16.5" />
                </svg>
                <span className="text-[9px] font-extrabold uppercase tracking-wider">Movies</span>
              </Link>

              {/* Admin Shows */}
              <Link
                to="/admin/shows"
                className={`flex flex-col items-center gap-1 transition-colors ${
                  location.pathname === '/admin/shows' ? 'text-indigo-600' : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </svg>
                <span className="text-[9px] font-extrabold uppercase tracking-wider">Shows</span>
              </Link>

              {/* Admin Bookings */}
              <Link
                to="/admin/bookings"
                className={`flex flex-col items-center gap-1 transition-colors ${
                  location.pathname === '/admin/bookings' ? 'text-indigo-600' : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-[9px] font-extrabold uppercase tracking-wider">Bookings</span>
              </Link>

              {/* Profile Icon */}
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="flex flex-col items-center gap-1.5 text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <img
                    src={user?.photoURL || 'https://www.gravatar.com/avatar?d=mp'}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover border border-neutral-200 shadow-sm"
                  />
                </div>
                <span className="text-[9px] font-extrabold uppercase tracking-wider truncate max-w-[65px]">
                  Profile
                </span>
              </button>
            </>
          ) : (
            // Customer Mode for Admin: Keep the normal customer dock!
            <>
              {/* Home Link */}
              <Link
                to="/"
                className={`flex flex-col items-center gap-1 transition-colors ${
                  location.pathname === '/' ? 'text-indigo-600' : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                <span className="text-[9px] font-extrabold uppercase tracking-wider">Home</span>
              </Link>

              {/* Movies Link */}
              <Link
                to="/movies"
                className={`flex flex-col items-center gap-1 transition-colors ${
                  location.pathname === '/movies' ? 'text-indigo-600' : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6h16.5M3.75 12h16.5M3.75 18h16.5M9 3.75v16.5M15 3.75v16.5" />
                </svg>
                <span className="text-[9px] font-extrabold uppercase tracking-wider">Movies</span>
              </Link>

              {/* My Bookings Link */}
              <Link
                to="/bookings/history"
                className={`flex flex-col items-center gap-1 transition-colors ${
                  location.pathname === '/bookings/history' ? 'text-indigo-600' : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-[9px] font-extrabold uppercase tracking-wider">Bookings</span>
              </Link>

              {/* Profile Icon */}
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="flex flex-col items-center gap-1.5 text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <img
                    src={user?.photoURL || 'https://www.gravatar.com/avatar?d=mp'}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover border border-neutral-200 shadow-sm"
                  />
                </div>
                <span className="text-[9px] font-extrabold uppercase tracking-wider truncate max-w-[65px]">
                  Profile
                </span>
              </button>
            </>
          )
        ) : (
          // Regular Customer / Anonymous User Dock
          <>
            {/* Home Link */}
            <Link
              to="/"
              className={`flex flex-col items-center gap-1 transition-colors ${
                location.pathname === '/' ? 'text-indigo-600' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span className="text-[9px] font-extrabold uppercase tracking-wider">Home</span>
            </Link>

            {/* Movies Link */}
            <Link
              to="/movies"
              className={`flex flex-col items-center gap-1 transition-colors ${
                location.pathname === '/movies' ? 'text-indigo-600' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6h16.5M3.75 12h16.5M3.75 18h16.5M9 3.75v16.5M15 3.75v16.5" />
              </svg>
              <span className="text-[9px] font-extrabold uppercase tracking-wider">Movies</span>
            </Link>

            {/* My Bookings Link */}
            <Link
              to="/bookings/history"
              className={`flex flex-col items-center gap-1 transition-colors ${
                location.pathname === '/bookings/history' ? 'text-indigo-600' : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-[9px] font-extrabold uppercase tracking-wider">Bookings</span>
            </Link>

            {/* Profile Button */}
            {user ? (
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="flex flex-col items-center gap-1.5 text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <img
                    src={user.photoURL || 'https://www.gravatar.com/avatar?d=mp'}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover border border-neutral-200 shadow-sm"
                  />
                </div>
                <span className="text-[9px] font-extrabold uppercase tracking-wider truncate max-w-[65px]">
                  {user.displayName?.split(' ')[0] || 'Profile'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={loginWithGoogle}
                className="flex flex-col items-center gap-1 text-neutral-400 hover:text-indigo-600 cursor-pointer"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <span className="text-[9px] font-extrabold uppercase tracking-wider">Profile</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Profile Details Sheet Modal */}
      {showProfileModal && user && (
        <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xs rounded-3xl p-6 relative shadow-xl border border-gray-100 animate-scale-up text-center space-y-5">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowProfileModal(false)}
              className="absolute right-4 top-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full p-1.5 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            <span className="text-[10px] uppercase tracking-widest font-extrabold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
              Your Profile
            </span>

            {/* User Details */}
            <div className="space-y-3 mt-2">
              <img
                src={user.photoURL || 'https://www.gravatar.com/avatar?d=mp'}
                alt="Profile Avatar"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full border-2 border-indigo-100 shadow-sm mx-auto object-cover"
              />
              <div>
                <h3 className="text-base font-black text-gray-900 leading-tight">
                  {user.displayName || 'Unknown User'}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold mt-1 select-all break-all">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              {user?.email === import.meta.env.VITE_ADMIN_EMAIL && (
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    navigate(isAdmin ? '/' : '/admin');
                  }}
                  className="w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-extrabold rounded-2xl transition-colors uppercase tracking-wider cursor-pointer"
                >
                  {isAdmin ? 'Switch to Customer View' : 'Switch to Admin Panel'}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  logout();
                  setShowProfileModal(false);
                }}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-extrabold rounded-2xl transition-colors uppercase tracking-wider cursor-pointer"
              >
                Sign Out
              </button>
            </div>

            {/* Footer Info — visible in profile modal on mobile */}
            <div className="pt-4 border-t border-neutral-100 space-y-3">
              <p className="text-[10px] text-neutral-400 font-semibold">
                Made with <span className="text-red-500 animate-pulse">❤️</span> by{' '}
                <a
                  href="https://ansh.one"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-700 font-extrabold hover:text-indigo-600 transition-colors underline decoration-neutral-300"
                >
                  Ansh Sharma
                </a>
              </p>
              <div className="flex justify-center gap-5 text-[10px] font-bold text-neutral-400">
                <Link
                  to="/terms"
                  onClick={() => setShowProfileModal(false)}
                  className="hover:text-indigo-600 transition-colors"
                >
                  Terms &amp; Conditions
                </Link>
                <Link
                  to="/privacy"
                  onClick={() => setShowProfileModal(false)}
                  className="hover:text-indigo-600 transition-colors"
                >
                  Privacy Policy
                </Link>
              </div>
              <p className="text-[9.5px] text-neutral-400 font-semibold">
                &copy; {new Date().getFullYear()} CineBook. All rights reserved.
              </p>
              <p className="text-[9px] text-neutral-400/70 font-semibold italic">
                A personal full-stack showcase project
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
