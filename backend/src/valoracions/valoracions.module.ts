import { Module } from '@nestjs/common';
import { ValoracionsService } from './valoracions.service';
import { ValoracionsController } from './valoracions.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ValoracionsController],
    providers: [ValoracionsService],
})
export class ValoracionsModule { }
