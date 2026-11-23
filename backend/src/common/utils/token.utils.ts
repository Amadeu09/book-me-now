import * as crypto from 'crypto';

/** Hash SHA-256 d'un token: a la base de dades mai es desa el token en clar. */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Token aleatori apte per a URL (256 bits). */
export function nouToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}
