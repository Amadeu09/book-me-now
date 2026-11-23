/** "Ara mateix", "Fa 5 min", "Fa 3 h" o la data curta. */
type ClauTemps = 'avisosAra' | 'avisosFaMin' | 'avisosFaHores';

export function tempsRelatiu(iso: string, t: (k: ClauTemps) => string, lang: string): string {
  const seg = (Date.now() - new Date(iso).getTime()) / 1000;
  if (seg < 60) return t('avisosAra');
  if (seg < 3600) return t('avisosFaMin').replace('{n}', String(Math.floor(seg / 60)));
  if (seg < 86400) return t('avisosFaHores').replace('{n}', String(Math.floor(seg / 3600)));
  return new Date(iso).toLocaleDateString(lang === 'es' ? 'es-ES' : 'ca-ES', { day: 'numeric', month: 'short' });
}
