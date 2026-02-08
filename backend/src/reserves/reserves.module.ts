import { Module } from '@nestjs/common';
import { ReservesController } from './reserves.controller';
import { ReservesService } from './reserves.service';

@Module({
  controllers: [ReservesController],
  providers: [ReservesService],
  exports: [ReservesService],
})
export class ReservesModule {}
