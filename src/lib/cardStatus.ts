/** Whole days a card is past its due date; 0 when not late. */
export function daysLate(dueDate?: string | null) {
  if (!dueDate) return 0;
  const ms = Date.now() - new Date(dueDate).getTime();
  return ms > 0 ? Math.max(1, Math.floor(ms / 86_400_000)) : 0;
}
