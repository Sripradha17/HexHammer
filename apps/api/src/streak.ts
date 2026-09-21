// Streak helpers. Dates are plain strings like "2026-09-21" in local time,
// which are easy to store, compare and read.

// Turns a Date into "YYYY-MM-DD" using the local calendar day.
export function toDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// "2026-03-01" -> "2026-02-28"
export function previousDay(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  return toDateString(new Date(year, month - 1, day - 1));
}

// How many days in a row did I practice?
// If I have not practiced today yet, yesterday still counts, so the streak is not lost until tomorrow.
export function calculateStreak(days: string[], today: string): number {
  const practiced = new Set(days);

  let cursor = practiced.has(today) ? today : previousDay(today);
  let streak = 0;

  while (practiced.has(cursor)) {
    streak = streak + 1;
    cursor = previousDay(cursor);
  }
  return streak;
}
