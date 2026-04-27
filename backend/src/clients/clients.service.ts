import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUserData } from '../common/decorators/current-user.decorator';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) { }

  async findAllByEmpresa(empresaId: number, user: CurrentUserData) {
    if (user.rol !== 'ADMIN_GENERAL') {
      throw new ForbiddenException('Només els administradors poden veure el llistat de clients');
    }

    if (user.empresaId !== empresaId) {
      throw new ForbiddenException('No pots accedir als clients d\'una altra empresa');
    }

    return this.prisma.client.findMany({
      where: { empresaId },
      orderBy: { nom: 'asc' },
    });
  }
}
