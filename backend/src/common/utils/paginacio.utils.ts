/** Límit de files per pàgina perquè una petició no pugui demanar tota la taula. */
export const MAX_FILES_PAGINA = 100;

/** Normalitza page/rows rebuts per query: page ≥ 1 i 1 ≤ rows ≤ MAX_FILES_PAGINA. */
export function normalitzarPaginacio(page: number, rows: number, perDefecte = 10): { page: number; rows: number } {
  const p = Number.isFinite(Number(page)) ? Math.max(1, Math.floor(Number(page))) : 1;
  const r = Number.isFinite(Number(rows)) && Number(rows) > 0
    ? Math.min(MAX_FILES_PAGINA, Math.floor(Number(rows)))
    : perDefecte;
  return { page: p, rows: r };
}
