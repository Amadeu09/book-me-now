import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { AvisosService } from './avisos.service';
import { BaixaPushDto, SubscripcioPushDto } from './dto/avisos.dto';

@ApiTags('avisos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN_GENERAL', 'EMPLEAT')
@Controller('avisos')
export class AvisosController {
  constructor(private readonly avisos: AvisosService) {}

  @Get()
  @ApiOperation({ summary: "Últims avisos de l'usuari i quants en té sense llegir" })
  llistar(@CurrentUser() user: CurrentUserData) {
    return this.avisos.llistar(user.userId);
  }

  @Post('llegits')
  @HttpCode(HttpStatus.OK)
  totsLlegits(@CurrentUser() user: CurrentUserData) {
    return this.avisos.marcarLlegides(user.userId);
  }

  @Post(':id/llegit')
  @HttpCode(HttpStatus.OK)
  llegit(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.avisos.marcarLlegides(user.userId, id);
  }

  @Get('push/clau')
  @ApiOperation({ summary: 'Clau pública VAPID per subscriure el navegador (null si no hi ha push)' })
  clau() {
    return { clau: this.avisos.clauPublica };
  }

  @Post('push/subscripcio')
  @HttpCode(HttpStatus.OK)
  subscriure(@Body() dto: SubscripcioPushDto, @CurrentUser() user: CurrentUserData) {
    return this.avisos.subscriure(user.userId, dto.endpoint, dto.keys.p256dh, dto.keys.auth);
  }

  @Post('push/baixa')
  @HttpCode(HttpStatus.OK)
  baixa(@Body() dto: BaixaPushDto, @CurrentUser() user: CurrentUserData) {
    return this.avisos.donarDeBaixa(user.userId, dto.endpoint);
  }
}
