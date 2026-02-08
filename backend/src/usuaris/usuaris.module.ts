import { Module } from '@nestjs/common';
import { UsuarisService } from './usuaris.service';
import { UsuarisController } from './usuaris.controller';

@Module({
  controllers: [UsuarisController],
  providers: [UsuarisService],
  exports: [UsuarisService],
})
export class UsuarisModule {}
