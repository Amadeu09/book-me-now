import { Module } from '@nestjs/common';
import { JornadesService } from './jornades.service';
import { JornadesController } from './jornades.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [JornadesController],
    providers: [JornadesService],
    exports: [JornadesService],
})
export class JornadesModule { }
