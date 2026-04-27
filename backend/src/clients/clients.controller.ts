import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('clients')
@ApiBearerAuth('JWT-auth')
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) { }

  @Get('empresa/:empresaId')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Obtenir tots els clients d\'una empresa' })
  @ApiResponse({ status: 200, description: 'Llistat de clients retornat correctament' })
  @ApiResponse({ status: 403, description: 'Sense permisos o empresa incorrecta' })
  findAllByEmpresa(
    @Param('empresaId', ParseIntPipe) empresaId: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.clientsService.findAllByEmpresa(empresaId, user);
  }
}
