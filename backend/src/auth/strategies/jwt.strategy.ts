import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { TokenBlacklistService } from '../token-blacklist.service';
import { JwtPayload } from '../dto/auth.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
    private tokenBlacklistService: TokenBlacklistService,
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
      // Get the token from the request context
      const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

      // Check if token is blacklisted
      if (token && (await this.tokenBlacklistService.isBlacklisted(token))) {
        throw new UnauthorizedException('Token ha sido invalidado (logout)');
      }

      // Validate user still exists and is active
      const user = await this.authService.validateUser(payload.sub);

      return {
        userId: user.id,
        email: user.email,
        rol: user.rol,
        empresaId: user.empresaId,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token inválido');
    }
  }
}
