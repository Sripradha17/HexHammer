// A very simple spaced-repetition schedule ("Leitner boxes").
//   Box 1 = see the card again tomorrow
//   Box 2 = in 3 days
//   Box 3 = in 7 days
// Knew it: move up one box (max 3). Missed it: back to box 1.
//
// I will rebuild nextBox by hand at the end of Level 1 (Rebuild Lab).

export const DAYS_FOR_BOX: Record<number, number> = { 1: 1, 2: 3, 3: 7 };

export function nextBox(currentBox: number, knewIt: boolean): number {
  if (!knewIt) {
    return 1;
  }
  if (currentBox >= 3) {
    return 3;
  }
  return currentBox + 1;
}

// The start of the day (midnight) that is `days` days after `from`.
export function startOfDayPlus(days: number, from: Date = new Date()): Date {
  return new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);
}

// When should a card in this box come back?
export function nextReviewDate(box: number, from: Date = new Date()): Date {
  return startOfDayPlus(DAYS_FOR_BOX[box], from);
}

// A card is "due today" if its review time is before tomorrow starts.
export function isDueToday(nextReviewAt: Date, now: Date = new Date()): boolean {
  return nextReviewAt < startOfDayPlus(1, now);
}
