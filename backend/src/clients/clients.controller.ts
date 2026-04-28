import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClientsPaginatsQueryDto, CreateClientDto, UpdateClientDto } from './dto/clients.dto';

@ApiTags('clients')
@ApiBearerAuth('JWT-auth')
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) { }

  @Post()
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Crear un nou client per a l\'empresa autenticada' })
  @ApiBody({ type: CreateClientDto })
  @ApiResponse({ status: 201, description: 'Client creat correctament' })
  @ApiResponse({ status: 403, description: 'Sense permisos' })
  @ApiResponse({ status: 409, description: 'Ja existeix un client amb aquest email' })
  create(
    @Body() dto: CreateClientDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.clientsService.createClient(dto, user);
  }

  @Patch(':id')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Editar un client' })
  @ApiBody({ type: UpdateClientDto })
  @ApiResponse({ status: 200, description: 'Client actualitzat correctament' })
  @ApiResponse({ status: 403, description: 'Sense permisos o empresa incorrecta' })
  @ApiResponse({ status: 404, description: 'Client no trobat' })
  @ApiResponse({ status: 409, description: 'Ja existeix un client amb aquest email' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClientDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.clientsService.updateClient(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Eliminar un client' })
  @ApiResponse({ status: 204, description: 'Client eliminat correctament' })
  @ApiResponse({ status: 403, description: 'Sense permisos o empresa incorrecta' })
  @ApiResponse({ status: 404, description: 'Client no trobat' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.clientsService.deleteClient(id, user);
  }

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

  @Get('empresa/:empresaId/paginat')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Obtenir clients d\'una empresa de forma paginada' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de pàgina (comença en 1)', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Clients per pàgina (màx. 100)', example: 20 })
  @ApiResponse({ status: 200, description: 'Pàgina de clients retornada correctament' })
  @ApiResponse({ status: 403, description: 'Sense permisos o empresa incorrecta' })
  findAllByEmpresaPaginat(
    @Param('empresaId', ParseIntPipe) empresaId: number,
    @CurrentUser() user: CurrentUserData,
    @Query() query: ClientsPaginatsQueryDto,
  ) {
    return this.clientsService.findAllByEmpresaPaginat(empresaId, user, query);
  }
}
