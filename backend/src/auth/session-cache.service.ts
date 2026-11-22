import { Injectable } from '@nestjs/common';
import { Rol } from '@prisma/client';

export interface SessionUser {
  userId: number;
  email: string;
  rol: Rol;
  empresaId: number;
  sessioIniciada?: number;
}

const TTL_MS = 60_000;
const MAX_ENTRADES = 5_000;

/**
 * Cau curta (60 s) del resultat de validar un token, per no fer 2 consultes
 * a la base de dades a cada petició. Logout i canvi de contrasenya la buiden.
 */
@Injectable()
export class SessionCacheService {
  private readonly entrades = new Map<string, { user: SessionUser; caduca: number }>();

  get(token: string): SessionUser | null {
    const entrada = this.entrades.get(token);
    if (!entrada) return null;
    if (entrada.caduca < Date.now()) {
      this.entrades.delete(token);
      return null;
    }
    return entrada.user;
  }

  set(token: string, user: SessionUser): void {
    if (this.entrades.size >= MAX_ENTRADES) {
      const mesAntiga = this.entrades.keys().next().value;
      if (mesAntiga !== undefined) this.entrades.delete(mesAntiga);
    }
    this.entrades.set(token, { user, caduca: Date.now() + TTL_MS });
  }

  invalidateToken(token: string): void {
    this.entrades.delete(token);
  }

  invalidateUser(userId: number): void {
    for (const [token, entrada] of this.entrades) {
      if (entrada.user.userId === userId) this.entrades.delete(token);
    }
  }
}
