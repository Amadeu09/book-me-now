import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsuarisModule } from './usuaris/usuaris.module';
import { EmpresasModule } from './empresas/empresas.module';
import { TreballadorsModule } from './treballadors/treballadors.module';
import { ServeisModule } from './serveis/serveis.module';
import { ClientsModule } from './clients/clients.module';
import { ReservesModule } from './reserves/reserves.module';
import { ValoracionsModule } from './valoracions/valoracions.module';
import { FacturesModule } from './factures/factures.module';
import { HorarisModule } from './horaris/horaris.module';
import { JornadesModule } from './jornades/jornades.module';
import { validateEnv } from './config/env.validation';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    // Config module - load and validate environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv,
    }),
    // Rate limiting - prevent brute force attacks
    ThrottlerModule.forRoot([{
      name: 'short',
      ttl: 1000, // 1 second
      limit: 10, // 10 requests per second
    }, {
      name: 'medium',
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }, {
      name: 'long',
      ttl: 900000, // 15 minutes
      limit: 500, // 500 requests per 15 minutes
    }]),
    // Core modules
    PrismaModule,
    AuthModule,
    // Business modules
    UsuarisModule,
    EmpresasModule,
    TreballadorsModule,
    ServeisModule,
    ClientsModule,
    ReservesModule,
    ValoracionsModule,
    FacturesModule,
    HorarisModule,
    JornadesModule,
  ],
  providers: [
    // Global exception filter - catch and format all errors
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    // Global logging interceptor - log all requests
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule { }
