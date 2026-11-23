/** Plans de Resend que comparem al panell. Revisar si Resend canvia preus. */
export type IdPla = 'free' | 'pro';

export interface PlaCorreu {
  id: IdPla;
  nom: string;
  preuMes: number;
  limitDia: number | null;
  limitMes: number;
  /** Preu per cada 1.000 correus per sobre del límit mensual (null: s'aturen els enviaments) */
  excesPer1000: number | null;
}

export const PLANS_CORREU: Record<IdPla, PlaCorreu> = {
  free: { id: 'free', nom: 'Gratuït', preuMes: 0, limitDia: 100, limitMes: 3000, excesPer1000: null },
  pro: { id: 'pro', nom: 'Pro', preuMes: 20, limitDia: null, limitMes: 50000, excesPer1000: 0.9 },
};

export const LLINDAR_AVIS = 0.8;

export type TipusCorreu =
  | 'CONFIRMACIO_CLIENT'
  | 'MODIFICACIO_CLIENT'
  | 'CANCELLACIO_CLIENT'
  | 'POST_CITA'
  | 'AVIS_NEGOCI'
  | 'CONTRASENYA'
  | 'INVITACIO'
  | 'SUPERADMIN'
  | 'ALERTA_QUOTA'
  | 'ALTRES';
