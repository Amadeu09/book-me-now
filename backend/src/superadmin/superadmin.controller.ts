import { Body, Controller, DefaultValuePipe, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ExtractJwt } from 'passport-jwt';
import { SuperAdminService } from './superadmin.service';
import { CurrentSuperAdmin, SuperAdminGuard } from './guards/superadmin.guard';
import type { SuperAdminSessio } from './strategies/superadmin.strategy';
import { CrearInvitacioDto, EstatEmpresaDto, SuperAdminContrasenyaDto, SuperAdminLoginDto, SuperAdminRecuperarDto } from './dto/superadmin.dto';

/** Accés del superadmin: endpoints públics, amb límits estrictes. */
@ApiTags('superadmin')
@Controller('superadmin/auth')
export class SuperAdminAuthController {
  constructor(private readonly service: SuperAdminService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 3, ttl: 60_000 }, medium: { limit: 5, ttl: 60_000 }, long: { limit: 10, ttl: 900_000 } })
  @ApiOperation({ summary: 'Accés del superadmin (sessió de 2 hores)' })
  login(@Body() dto: SuperAdminLoginDto) {
    return this.service.login(dto.email, dto.password);
  }

  @Post('recuperar')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 2, ttl: 60_000 }, medium: { limit: 3, ttl: 60_000 }, long: { limit: 5, ttl: 900_000 } })
  @ApiOperation({ summary: 'Enviar enllaç per restablir la contrasenya (sempre respon igual)' })
  async recuperar(@Body() dto: SuperAdminRecuperarDto) {
    await this.service.recuperar(dto.email);
    return { ok: true };
  }

  @Post('contrasenya')
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 3, ttl: 60_000 }, medium: { limit: 5, ttl: 60_000 }, long: { limit: 10, ttl: 900_000 } })
  @ApiOperation({ summary: "Posar la contrasenya amb l'enllaç rebut" })
  async contrasenya(@Body() dto: SuperAdminContrasenyaDto) {
    await this.service.establirContrasenya(dto.token, dto.password);
    return { ok: true };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  async logout(@Req() req: any, @CurrentSuperAdmin() admin: SuperAdminSessio) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token) await this.service.logout(token, admin.superAdminId);
    return { ok: true };
  }

  @Get('jo')
  @UseGuards(SuperAdminGuard)
  @ApiBearerAuth()
  jo(@CurrentSuperAdmin() admin: SuperAdminSessio) {
    return { email: admin.email };
  }
}

/** Panell del superadmin: tot exigeix un token de superadmin. */
@ApiTags('superadmin')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
@Controller('superadmin')
export class SuperAdminController {
  constructor(private readonly service: SuperAdminService) {}

  @Get('empreses')
  @ApiOperation({ summary: 'Totes les empreses de la plataforma' })
  empreses(
    @Query('cerca') cerca?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('rows', new DefaultValuePipe(20), ParseIntPipe) rows?: number,
  ) {
    return this.service.llistarEmpreses(cerca, page, rows);
  }

  @Patch('empreses/:id/estat')
  @ApiOperation({ summary: 'Activar o desactivar una empresa (desactivar tanca les sessions dels seus usuaris)' })
  estatEmpresa(@Param('id', ParseIntPipe) id: number, @Body() dto: EstatEmpresaDto, @CurrentSuperAdmin() admin: SuperAdminSessio) {
    return this.service.canviarEstatEmpresa(id, dto.activa, admin.superAdminId);
  }

  @Get('invitacions')
  invitacions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('rows', new DefaultValuePipe(20), ParseIntPipe) rows?: number,
  ) {
    return this.service.llistarInvitacions(page, rows);
  }

  @Post('invitacions')
  @ApiOperation({ summary: "Crear un enllaç d'invitació d'un sol ús" })
  crearInvitacio(@Body() dto: CrearInvitacioDto, @CurrentSuperAdmin() admin: SuperAdminSessio) {
    return this.service.crearInvitacio(dto, admin.superAdminId);
  }

  @Post('invitacions/:id/revocar')
  @HttpCode(HttpStatus.OK)
  revocar(@Param('id', ParseIntPipe) id: number, @CurrentSuperAdmin() admin: SuperAdminSessio) {
    return this.service.revocarInvitacio(id, admin.superAdminId);
  }

  @Get('registre')
  @ApiOperation({ summary: 'Registre de les accions del superadmin' })
  registre(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('rows', new DefaultValuePipe(30), ParseIntPipe) rows?: number,
  ) {
    return this.service.llistarRegistre(page, rows);
  }
}
