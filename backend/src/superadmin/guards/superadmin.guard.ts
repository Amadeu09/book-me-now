import { createParamDecorator, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SUPERADMIN_STRATEGY } from '../superadmin.constants';
import type { SuperAdminSessio } from '../strategies/superadmin.strategy';

/** Només deixa passar tokens de superadmin (signats amb la seva clau). */
@Injectable()
export class SuperAdminGuard extends AuthGuard(SUPERADMIN_STRATEGY) {}

export const CurrentSuperAdmin = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): SuperAdminSessio => ctx.switchToHttp().getRequest().user,
);
