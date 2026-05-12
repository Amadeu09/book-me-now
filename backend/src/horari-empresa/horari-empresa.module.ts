import { Module } from '@nestjs/common';
import { HorariEmpresaController } from './horari-empresa.controller';
import { HorariEmpresaService } from './horari-empresa.service';

@Module({
    controllers: [HorariEmpresaController],
    providers: [HorariEmpresaService],
})
export class HorariEmpresaModule {}
