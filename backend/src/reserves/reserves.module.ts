import { Module } from '@nestjs/common';
import { ReservesController } from './reserves.controller';
import { ReservesService } from './reserves.service';
import { EmailPostCitaService } from './email-post-cita.service';

@Module({
  controllers: [ReservesController],
  providers: [ReservesService, EmailPostCitaService],
  exports: [ReservesService],
})
export class ReservesModule {}
