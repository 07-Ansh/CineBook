import type { Seat } from '../types';
import { formatSeat } from '../utils/format';

interface SeatGridProps {
  seats: Seat[];
  selectedIds: number[];
  onToggle: (seatId: number) => void;
  basePrice: number;
}

export default function SeatGrid({ seats, selectedIds, onToggle, basePrice }: SeatGridProps) {
  // Group seats by row
  const seatsByRow: Record<string, Seat[]> = {};
  for (const seat of seats) {
    if (!seatsByRow[seat.seat_row]) seatsByRow[seat.seat_row] = [];
    seatsByRow[seat.seat_row].push(seat);
  }

  // Row mappings and prices
  const categories = [
    { name: 'RECLINER', priceMultiplier: 1.5, rows: ['J'] },
    { name: 'PREMIUM XL', priceMultiplier: 1.25, rows: ['I'] },
    { name: 'PREMIUM', priceMultiplier: 1.15, rows: ['H', 'G', 'F'] },
    { name: 'EXECUTIVE', priceMultiplier: 1.0, rows: ['E', 'D', 'C', 'B'] },
    { name: 'NORMAL', priceMultiplier: 0.9, rows: ['A'] }
  ];

  // Helper to format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Render individual seat item
  const renderSeatButton = (seat: Seat, isWheelchair = false) => {
    const isSelected = selectedIds.includes(seat.id);
    const isBooked = seat.is_booked;

    let multiplier = 1.0;
    if (seat.seat_row === 'J') multiplier = 1.5;
    if (seat.seat_row === 'I') multiplier = 1.25;
    if (['H', 'G', 'F'].includes(seat.seat_row)) multiplier = 1.15;
    if (['E', 'D', 'C', 'B'].includes(seat.seat_row)) multiplier = 1.0;
    if (seat.seat_row === 'A') multiplier = 0.9;
    const seatPrice = basePrice * multiplier;

    let btnClass = 'w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all duration-150 cursor-pointer border ';
    
    if (isBooked) {
      btnClass += 'bg-blue-50/70 border-blue-100 text-blue-300 cursor-not-allowed';
    } else if (isSelected) {
      btnClass += 'bg-indigo-600 border-indigo-700 text-white shadow-md transform scale-105';
    } else {
      btnClass += 'bg-white border-neutral-200 text-neutral-600 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/10';
    }

    return (
      <button
        key={seat.id}
        disabled={isBooked}
        onClick={() => onToggle(seat.id)}
        className={btnClass}
        title={`${formatSeat(seat.seat_row, seat.seat_number)} - ${formatCurrency(seatPrice)}`}
      >
        {isWheelchair ? (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="12" cy="4" r="1.5" />
            <path d="m18 19 1-4-6-1V8h3" />
            <path d="M8 12a4 4 0 1 0 5.27 3.73" />
          </svg>
        ) : (
          seat.seat_number
        )}
      </button>
    );
  };

  // Render crossed-out placeholder
  const renderCrossPlaceholder = (key: string) => (
    <div key={key} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-neutral-300 text-xs font-medium select-none">
      ×
    </div>
  );

  return (
    <div className="w-full select-none overflow-x-auto pb-6">
      <div className="min-w-[640px] space-y-6 px-4">
        
        {categories.map((cat, catIdx) => {
          const categoryPrice = basePrice * cat.priceMultiplier;
          
          return (
            <div key={catIdx} className="space-y-4">
              {/* Category Header */}
              <div className="text-center">
                <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-widest bg-neutral-50 px-3 py-1 rounded-full border border-neutral-100">
                  {cat.name} : {formatCurrency(categoryPrice)}
                </span>
              </div>

              {/* Rows inside Category */}
              <div className="space-y-3">
                {cat.rows.map(row => {
                  const rawRowSeats = seatsByRow[row] || [];
                  const sortedSeats = [...rawRowSeats].sort((a, b) => b.seat_number - a.seat_number); // Descending layout e.g. 10 to 1

                  return (
                    <div key={row} className="flex items-center justify-center gap-4">
                      {/* Left Row Indicator */}
                      <span className="w-5 text-center text-xs font-bold text-neutral-400">{row}</span>

                      {/* Row Seats Grid Arrangement */}
                      <div className="flex items-center gap-1.5">
                        {row === 'J' && (
                          // RECLINER: 5 blocks of pairs (10 seats total)
                          <>
                            {sortedSeats[0] && renderSeatButton(sortedSeats[0])}
                            {sortedSeats[1] && renderSeatButton(sortedSeats[1])}
                            <div className="w-4" /> {/* Gap */}
                            {sortedSeats[2] && renderSeatButton(sortedSeats[2])}
                            {sortedSeats[3] && renderSeatButton(sortedSeats[3])}
                            <div className="w-4" /> {/* Gap */}
                            {sortedSeats[4] && renderSeatButton(sortedSeats[4])}
                            {sortedSeats[5] && renderSeatButton(sortedSeats[5])}
                            <div className="w-4" /> {/* Gap */}
                            {sortedSeats[6] && renderSeatButton(sortedSeats[6])}
                            {sortedSeats[7] && renderSeatButton(sortedSeats[7])}
                            <div className="w-4" /> {/* Gap */}
                            {sortedSeats[8] && renderSeatButton(sortedSeats[8])}
                            {sortedSeats[9] && renderSeatButton(sortedSeats[9])}
                          </>
                        )}

                        {row === 'I' && (
                          // PREMIUM XL: 2 blocks of 5
                          <>
                            {sortedSeats.slice(0, 5).map(s => renderSeatButton(s))}
                            {renderCrossPlaceholder('cross-j')}
                            {sortedSeats.slice(5, 10).map(s => renderSeatButton(s))}
                          </>
                        )}

                        {['H', 'G', 'F'].includes(row) && (
                          // PREMIUM: Left (2), Middle (6), Right (2)
                          <>
                            {sortedSeats[0] && renderSeatButton(sortedSeats[0])}
                            {sortedSeats[1] && renderSeatButton(sortedSeats[1])}
                            <div className="w-6" /> {/* Gap */}
                            {sortedSeats.slice(2, 8).map(s => renderSeatButton(s))}
                            <div className="w-6" /> {/* Gap */}
                            {sortedSeats[8] && renderSeatButton(sortedSeats[8])}
                            {sortedSeats[9] && renderSeatButton(sortedSeats[9])}
                          </>
                        )}

                        {row === 'E' && (
                          // EXECUTIVE Row E: middle seats crossed out placeholder
                          <>
                            {sortedSeats[0] && renderSeatButton(sortedSeats[0])}
                            {sortedSeats[1] && renderSeatButton(sortedSeats[1])}
                            <div className="w-6" /> {/* Gap */}
                            {Array.from({ length: 6 }).map((_, idx) => renderCrossPlaceholder(`cross-e-${idx}`))}
                            <div className="w-6" /> {/* Gap */}
                            {sortedSeats[8] && renderSeatButton(sortedSeats[8])}
                            {sortedSeats[9] && renderSeatButton(sortedSeats[9])}
                          </>
                        )}

                        {['D', 'C', 'B'].includes(row) && (
                          // EXECUTIVE Rows D,C,B: Left (2), Middle (6), Right (2)
                          <>
                            {sortedSeats[0] && renderSeatButton(sortedSeats[0])}
                            {sortedSeats[1] && renderSeatButton(sortedSeats[1])}
                            <div className="w-6" /> {/* Gap */}
                            {sortedSeats.slice(2, 8).map(s => renderSeatButton(s))}
                            <div className="w-6" /> {/* Gap */}
                            {sortedSeats[8] && renderSeatButton(sortedSeats[8])}
                            {sortedSeats[9] && renderSeatButton(sortedSeats[9])}
                          </>
                        )}

                        {row === 'A' && (
                          // NORMAL: 10 seats, middle seats rendered as wheelchair icons
                          <>
                            {sortedSeats[0] && renderSeatButton(sortedSeats[0])}
                            {sortedSeats[1] && renderSeatButton(sortedSeats[1])}
                            <div className="w-6" /> {/* Gap */}
                            {sortedSeats[2] && renderSeatButton(sortedSeats[2], true)} {/* Wheelchair */}
                            {sortedSeats[3] && renderSeatButton(sortedSeats[3], true)} {/* Wheelchair */}
                            {sortedSeats[4] && renderSeatButton(sortedSeats[4])}
                            {sortedSeats[5] && renderSeatButton(sortedSeats[5])}
                            <div className="w-6" /> {/* Gap */}
                            {sortedSeats.slice(6, 10).map(s => renderSeatButton(s))}
                          </>
                        )}
                      </div>

                      {/* Right Row Indicator */}
                      <span className="w-5 text-center text-xs font-bold text-neutral-400">{row}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Curved Screen projection indicator */}
        <div className="pt-8 text-center max-w-sm mx-auto relative flex flex-col items-center">
          <svg className="w-full h-10 drop-shadow-[0_4px_12px_rgba(99,102,241,0.2)]" viewBox="0 0 300 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="screen-glow" x1="150" y1="10" x2="150" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Glow fill representing screen projection light */}
            <path d="M 10 10 Q 150 25 290 10 L 290 40 L 10 40 Z" fill="url(#screen-glow)" />
            {/* Glow outer border */}
            <path d="M 10 10 Q 150 25 290 10" stroke="#818cf8" strokeOpacity="0.3" strokeWidth="6" strokeLinecap="round" />
            {/* Crisp screen line */}
            <path d="M 10 10 Q 150 25 290 10" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="text-[9px] text-neutral-400 font-extrabold uppercase tracking-widest mt-3">
            All eyes this way (Screen)
          </span>
        </div>

      </div>
    </div>
  );
}
