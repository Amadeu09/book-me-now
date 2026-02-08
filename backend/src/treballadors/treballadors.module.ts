import { Module } from '@nestjs/common';
import { TreballadorsController } from './treballadors.controller';
import { TreballadorsService } from './treballadors.service';

@Module({
  controllers: [TreballadorsController],
  providers: [TreballadorsService],
  exports: [TreballadorsService],
})
export class TreballadorsModule {}
