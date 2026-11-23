import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { TokenBlacklistService } from '../../auth/token-blacklist.service';
import { SUPERADMIN_STRATEGY, clauSuperAdmin } from '../superadmin.constants';

export interface SuperAdminSessio {
  superAdminId: number;
  email: string;
}

interface SuperAdminPayload {
  sub: number;
  email: string;
  tipus: 'superadmin';
  iat?: number;
}

@Injectable()
export class SuperAdminStrategy extends PassportStrategy(Strategy, SUPERADMIN_STRATEGY) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly blacklist: TokenBlacklistService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: clauSuperAdmin(config.getOrThrow<string>('JWT_SECRET'), config.get<string>('SUPERADMIN_JWT_SECRET')),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: SuperAdminPayload): Promise<SuperAdminSessio> {
    if (payload.tipus !== 'superadmin') throw new UnauthorizedException();
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token && (await this.blacklist.isBlacklisted(token))) throw new UnauthorizedException();

    const admin = await this.prisma.superAdmin.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, credencialsCanviades: true },
    });
    if (!admin) throw new UnauthorizedException();
    if (admin.credencialsCanviades && payload.iat !== undefined
      && payload.iat < Math.floor(admin.credencialsCanviades.getTime() / 1000)) {
      throw new UnauthorizedException();
    }
    return { superAdminId: admin.id, email: admin.email };
  }
}
