export type TipusAvis = 'RESERVA_NOVA' | 'RESERVA_CANCELLADA' | 'RESERVA_CANVIADA';
type Idioma = 'ca' | 'es';

export interface DadesAvis {
  tipus: TipusAvis;
  clientNom: string | null;
  serveiNom: string;
  dataHora: Date;
  dataAnterior?: Date;
}

const LOCALE: Record<Idioma, string> = { ca: 'ca-ES', es: 'es-ES' };

function quan(data: Date, idioma: Idioma): string {
  const dia = data.toLocaleDateString(LOCALE[idioma], { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Madrid' });
  const hora = data.toLocaleTimeString(LOCALE[idioma], { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' });
  return `${dia}, ${hora}`;
}

const TITOLS: Record<TipusAvis, Record<Idioma, string>> = {
  RESERVA_NOVA: { ca: 'Nova reserva', es: 'Nueva reserva' },
  RESERVA_CANCELLADA: { ca: 'Cita cancel·lada pel client', es: 'Cita cancelada por el cliente' },
  RESERVA_CANVIADA: { ca: 'Cita canviada pel client', es: 'Cita cambiada por el cliente' },
};

/** Títol i text curt d'un avís, en l'idioma de qui el rep. */
export function textAvis(d: DadesAvis, idiomaUsuari: string | null | undefined): { titol: string; cos: string } {
  const idioma: Idioma = idiomaUsuari === 'es' ? 'es' : 'ca';
  const client = d.clientNom?.trim() || (idioma === 'es' ? 'Un cliente' : 'Un client');
  const base = `${client} · ${d.serveiNom}`;
  let cos: string;
  if (d.tipus === 'RESERVA_CANVIADA' && d.dataAnterior) {
    cos = `${base} · ${quan(d.dataAnterior, idioma)} → ${quan(d.dataHora, idioma)}`;
  } else {
    cos = `${base} · ${quan(d.dataHora, idioma)}`;
  }
  return { titol: TITOLS[d.tipus][idioma], cos };
}
