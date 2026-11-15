import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { SessionCacheService } from '../session-cache.service';

describe('JwtStrategy', () => {
  const authService = { validateUser: jest.fn() };
  const blacklist = { isBlacklisted: jest.fn() };
  const config = { get: jest.fn().mockReturnValue('x'.repeat(40)) };
  let cache: SessionCacheService;
  let strategy: JwtStrategy;
  const req = { headers: { authorization: 'Bearer tok-1' } };
  const ara = Math.floor(Date.now() / 1000);

  beforeEach(() => {
    jest.clearAllMocks();
    cache = new SessionCacheService();
    strategy = new JwtStrategy(authService as any, config as any, blacklist as any, cache);
    blacklist.isBlacklisted.mockResolvedValue(false);
  });

  it('rebutja tokens emesos abans de canviar la contrasenya', async () => {
    authService.validateUser.mockResolvedValue({
      id: 1, email: 'a@b.c', rol: 'EMPLEAT', empresaId: 1,
      credencialsCanviades: new Date((ara - 60) * 1000),
    });
    await expect(strategy.validate(req, { sub: 1, iat: ara - 3600 } as any)).rejects.toThrow(UnauthorizedException);
  });

  it('accepta tokens emesos després del canvi i els guarda a la cau', async () => {
    authService.validateUser.mockResolvedValue({
      id: 1, email: 'a@b.c', rol: 'EMPLEAT', empresaId: 1,
      credencialsCanviades: new Date((ara - 60) * 1000),
    });
    const sessio = await strategy.validate(req, { sub: 1, iat: ara } as any);
    expect(sessio).toEqual({ userId: 1, email: 'a@b.c', rol: 'EMPLEAT', empresaId: 1 });

    await strategy.validate(req, { sub: 1, iat: ara } as any);
    expect(authService.validateUser).toHaveBeenCalledTimes(1);
    expect(blacklist.isBlacklisted).toHaveBeenCalledTimes(1);
  });

  it('després d\'invalidar l\'usuari torna a consultar la base de dades', async () => {
    authService.validateUser.mockResolvedValue({ id: 1, email: 'a@b.c', rol: 'EMPLEAT', empresaId: 1, credencialsCanviades: null });
    await strategy.validate(req, { sub: 1, iat: ara } as any);
    cache.invalidateUser(1);
    await strategy.validate(req, { sub: 1, iat: ara } as any);
    expect(authService.validateUser).toHaveBeenCalledTimes(2);
  });
});
