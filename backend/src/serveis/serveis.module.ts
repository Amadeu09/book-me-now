import { Module } from '@nestjs/common';
import { ServeisController } from './serveis.controller';
import { ServeisService } from './serveis.service';

@Module({
  controllers: [ServeisController],
  providers: [ServeisService],
  exports: [ServeisService],
})
export class ServeisModule {}
