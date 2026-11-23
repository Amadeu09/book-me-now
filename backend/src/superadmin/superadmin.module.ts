import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SuperAdminService } from './superadmin.service';
import { SuperAdminAuthController, SuperAdminController } from './superadmin.controller';
import { SuperAdminStrategy } from './strategies/superadmin.strategy';
import { TokenBlacklistService } from '../auth/token-blacklist.service';

@Module({
  // La clau es passa en cada sign(): aquest JwtModule no en té cap per defecte
  imports: [PassportModule, JwtModule.register({})],
  controllers: [SuperAdminAuthController, SuperAdminController],
  providers: [SuperAdminService, SuperAdminStrategy, TokenBlacklistService],
})
export class SuperAdminModule {}
