// ============================================================
// Formatting utilities
// ============================================================

/**
 * Format a date string to a readable format.
 * e.g. "2024-03-01" → "Mar 1, 2024"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a time string (HH:mm) to a 12-hour format.
 * e.g. "14:00" → "2:00 PM"
 */
export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Format a number as currency (INR).
 * e.g. 250 → "₹250.00"
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${num.toFixed(2)}`;
}

/**
 * Format a seat label.
 * e.g. { seat_row: "A", seat_number: 1 } → "A1"
 */
export function formatSeat(row: string, number: number): string {
  return `${row}${number}`;
}

/**
 * Format duration in minutes to a readable string.
 * e.g. 152 → "2h 32m"
 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
