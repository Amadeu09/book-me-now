import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { TokenBlacklistService } from '../token-blacklist.service';
import { JwtPayload } from '../dto/auth.dto';
import { SessionCacheService } from '../session-cache.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private tokenBlacklistService: TokenBlacklistService,
    private sessionCache: SessionCacheService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set. Cannot start application.');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: JwtPayload) {
    try {
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

      const enCau = token ? this.sessionCache.get(token) : null;
      if (enCau) return enCau;

      // Check if token is blacklisted
      if (token && (await this.tokenBlacklistService.isBlacklisted(token))) {
        throw new UnauthorizedException('Token ha sido invalidado (logout)');
      }

      // Validate user still exists and is active
      const user = await this.authService.validateUser(payload.sub);

      // Tokens emesos abans de canviar o restablir la contrasenya ja no valen
      if (user.credencialsCanviades && payload.iat !== undefined
        && payload.iat < Math.floor(user.credencialsCanviades.getTime() / 1000)) {
        throw new UnauthorizedException('Sessió caducada: la contrasenya ha canviat');
      }

      const sessio = {
        userId: user.id,
        email: user.email,
        rol: user.rol,
        empresaId: user.empresaId,
      };
      if (token) this.sessionCache.set(token, sessio);
      return sessio;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token inválido');
    }
  }
}
