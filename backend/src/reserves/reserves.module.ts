import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReservesController } from './reserves.controller';
import { ReservesService } from './reserves.service';
import { EmailProcessor } from './email.processor';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: 'emails',
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const password = config.get<string>('REDIS_PASSWORD');
        return {
          redis: {
            host: config.get<string>('REDIS_HOST', 'localhost'),
            port: config.get<number>('REDIS_PORT', 6379),
            ...(password && { password }),
            ...(password && { tls: {} }),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [ReservesController],
  providers: [ReservesService, EmailProcessor],
  exports: [ReservesService],
})
export class ReservesModule {}
