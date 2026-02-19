import { Module } from '@nestjs/common';
import { AbsenciesService } from './absencies.service';
import { AbsenciesController } from './absencies.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [AbsenciesController],
    providers: [AbsenciesService],
    exports: [AbsenciesService],
})
export class AbsenciesModule { }
