import * as crypto from 'crypto';

export const SUPERADMIN_STRATEGY = 'jwt-superadmin';
/** Durada d'una sessió de superadmin: curta i sense renovació. */
export const SUPERADMIN_DURADA_S = 2 * 60 * 60;

/**
 * Clau de signatura dels tokens de superadmin, diferent de la dels usuaris d'empresa:
 * un token d'empresa mai valida com a superadmin, ni a l'inrevés.
 */
export function clauSuperAdmin(jwtSecret: string, propia?: string): string {
  if (propia && propia.length >= 32) return propia;
  return crypto.createHmac('sha256', jwtSecret).update('bookmenow:superadmin:v1').digest('hex');
}
