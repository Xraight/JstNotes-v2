import { Flashcard } from '../types';

/**
 * SuperMemo SM-2 Spaced Repetition Algorithm
 * Quality score q:
 * 1: Complete blackout / Again
 * 2: Incorrect response; the correct one remembered / Hard
 * 3: Correct response recalled with serious difficulty / Good
 * 4: Correct response after a hesitation / Easy
 * 5: Perfect recall / Mastered
 */
export function calculateSM2(
  card: Flashcard,
  quality: number // 1 to 5
): { interval: number; repetition: number; easeFactor: number; dueDate: string } {
  const q = Math.max(1, Math.min(5, quality));
  let { interval, repetition, easeFactor } = card;

  if (easeFactor === undefined || isNaN(easeFactor)) {
    easeFactor = 2.5;
  }

  // Calculate new Ease Factor (EF)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEaseFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }

  let newRepetition = repetition;
  let newInterval = interval;

  if (q < 3) {
    // Failure / Again
    newRepetition = 0;
    newInterval = 1;
  } else {
    // Success
    if (newRepetition === 0) {
      newInterval = 1;
    } else if (newRepetition === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
    newRepetition += 1;
  }

  // Compute next due date
  const now = new Date();
  const nextDate = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);
  const dueDate = nextDate.toISOString().split('T')[0];

  return {
    interval: newInterval,
    repetition: newRepetition,
    easeFactor: parseFloat(newEaseFactor.toFixed(2)),
    dueDate,
  };
}

export function isCardDue(card: Flashcard, currentDateStr?: string): boolean {
  const today = currentDateStr || new Date().toISOString().split('T')[0];
  return !card.dueDate || card.dueDate <= today;
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}
