export type PeriodeCites = 'avui' | 'dema' | 'setmana';

/** YYYY-MM-DD en hora local. */
export function diaISO(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Rang de dies (inclusiu) que cobreix cada període. */
export function rangPeriode(periode: PeriodeCites, ara: Date = new Date()): { inici: string; fi: string } {
    const avui = new Date(ara.getFullYear(), ara.getMonth(), ara.getDate());
    if (periode === 'avui') return { inici: diaISO(avui), fi: diaISO(avui) };
    const dema = new Date(avui);
    dema.setDate(dema.getDate() + 1);
    if (periode === 'dema') return { inici: diaISO(dema), fi: diaISO(dema) };
    const setmana = new Date(avui);
    setmana.setDate(setmana.getDate() + 6);
    return { inici: diaISO(avui), fi: diaISO(setmana) };
}

export function horaCurta(iso: string, locale: string): string {
    return new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

export function diaCurt(iso: string, locale: string): string {
    return new Date(iso).toLocaleDateString(locale, { weekday: 'short', day: 'numeric' });
}

/** "15–19 de des. · 5 dies" o "2 de des." */
export function rangAbsencia(inici: string, fi: string, locale: string, textDies: (n: number) => string): string {
    const fmt = (s: string) => new Date(s).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
    if (inici.substring(0, 10) === fi.substring(0, 10)) return fmt(inici);
    const dies = Math.round((new Date(fi).getTime() - new Date(inici).getTime()) / 86_400_000) + 1;
    return `${fmt(inici)} – ${fmt(fi)} · ${textDies(dies)}`;
}

export function salutacio(hora: number): 'greetingMorning' | 'greetingAfternoon' | 'greetingEvening' {
    if (hora < 13) return 'greetingMorning';
    if (hora < 20) return 'greetingAfternoon';
    return 'greetingEvening';
}
