const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

export function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

/**
 * Returns the rotation index for `currentDate` given a cycle anchored at `refDate`.
 * Works for any number of rotations (A, A/B, A/B/C, ...).
 * Uses Math.round to absorb DST boundary drift (±1h across a week).
 */
export function getRotacioIdx(
  rotacionsOrdenades: { index: number }[],
  refDate: Date,
  currentDate: Date,
): number {
  const numRotacions = rotacionsOrdenades.length;
  if (numRotacions === 0) return 0;
  const mondayRef = getMondayOfWeek(refDate);
  const mondayCurrent = getMondayOfWeek(currentDate);
  const setmanes = Math.round((mondayCurrent.getTime() - mondayRef.getTime()) / MS_PER_WEEK);
  return ((setmanes % numRotacions) + numRotacions) % numRotacions;
}
