import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Rol } from '@prisma/client';

export interface CurrentUserData {
  userId: number;
  email: string;
  rol: Rol;
  empresaId: number;
  /** Inici de la sessió (segons Unix), per limitar quant es pot renovar */
  sessioIniciada?: number;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserData => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
