import type { Tram } from '../../types/jornades.types';

/* ──────────────────────────────────────────
   Interval merge algorithm for time ranges
   ────────────────────────────────────────── */

/** Sort + merge overlapping or adjacent trams */
export function mergeTrams(trams: Tram[]): Tram[] {
    if (trams.length <= 1) return trams;

    const sorted = [...trams].sort((a, b) => a.iniciMin - b.iniciMin);
    const merged: Tram[] = [{ ...sorted[0] }];

    for (let i = 1; i < sorted.length; i++) {
        const last = merged[merged.length - 1];
        const curr = sorted[i];

        if (curr.iniciMin <= last.fiMin) {
            // Overlapping or adjacent → extend
            last.fiMin = Math.max(last.fiMin, curr.fiMin);
        } else {
            merged.push({ ...curr });
        }
    }

    return merged;
}

/** Snap minutes to nearest increment */
export function snapMinutes(min: number, snap: number = 15): number {
    return Math.round(min / snap) * snap;
}

/** Clamp value between min and max */
export function clamp(val: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, val));
}

/** Convert pixel offset to minutes (0–1440) */
export function pxToMinutes(px: number, barWidth: number, snap: number = 15): number {
    const raw = (px / barWidth) * 1440;
    return clamp(snapMinutes(raw, snap), 0, 1440);
}
