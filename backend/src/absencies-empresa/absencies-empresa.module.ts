import { Module } from '@nestjs/common';
import { AbsenciesEmpresaService } from './absencies-empresa.service';
import { AbsenciesEmpresaController } from './absencies-empresa.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [AbsenciesEmpresaController],
    providers: [AbsenciesEmpresaService],
    exports: [AbsenciesEmpresaService],
})
export class AbsenciesEmpresaModule {}
