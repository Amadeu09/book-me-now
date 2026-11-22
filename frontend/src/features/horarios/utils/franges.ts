/** Utilitats per editar franges horàries com a text HH:MM. */

export interface FrangaText {
    inici: string;
    fi: string;
}

export interface FrangaMin {
    iniciMin: number;
    fiMin: number;
}

export function minutsAText(min: number): string {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Accepta "9", "9:5", "09:30", "0930", "24:00". Retorna null si no és vàlid. */
export function textAMinuts(text: string): number | null {
    const net = text.trim();
    let h: number;
    let m: number;
    const ambDosPunts = /^(\d{1,2})(?::(\d{1,2}))?$/.exec(net);
    const compacte = /^(\d{2})(\d{2})$/.exec(net);
    if (compacte) {
        h = Number(compacte[1]); m = Number(compacte[2]);
    } else if (ambDosPunts) {
        h = Number(ambDosPunts[1]); m = ambDosPunts[2] ? Number(ambDosPunts[2]) : 0;
    } else {
        return null;
    }
    if (h === 24 && m === 0) return 1440;
    if (h > 23 || m > 59) return null;
    return h * 60 + m;
}

/** Valida i ordena; retorna null si hi ha franges invàlides o solapades. */
export function validaFranges(franges: FrangaText[]): FrangaMin[] | null {
    const mins: FrangaMin[] = [];
    for (const f of franges) {
        const i = textAMinuts(f.inici);
        const fi = textAMinuts(f.fi);
        if (i === null || fi === null || i >= fi || i > 1439) return null;
        mins.push({ iniciMin: i, fiMin: fi });
    }
    mins.sort((a, b) => a.iniciMin - b.iniciMin);
    for (let k = 1; k < mins.length; k++) {
        if (mins[k].iniciMin < mins[k - 1].fiMin) return null;
    }
    return mins;
}

/** Proposa una franja nova després de l'última (1 h de pausa, 4 h de durada). */
export function seguentFranja(franges: FrangaMin[]): FrangaMin | null {
    if (franges.length === 0) return { iniciMin: 540, fiMin: 840 };
    const ultima = franges[franges.length - 1].fiMin;
    const inici = ultima + 60;
    if (inici >= 1440) return null;
    return { iniciMin: inici, fiMin: Math.min(inici + 240, 1440) };
}

export function clauFranges(franges: FrangaMin[]): string {
    return franges.map(f => `${f.iniciMin}-${f.fiMin}`).join(',');
}

export function horesTotals(franges: FrangaMin[]): number {
    return franges.reduce((s, f) => s + (f.fiMin - f.iniciMin), 0) / 60;
}

/** Format curt d'hores: 50 → "50", 37.5 → "37,5". */
export function formatHores(h: number): string {
    return Number.isInteger(h) ? String(h) : h.toFixed(1).replace('.', ',');
}
