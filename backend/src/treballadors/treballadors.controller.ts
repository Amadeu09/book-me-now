import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { TreballadorsService } from './treballadors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateJornadaTreballadorExistDto, CreateTreballadorDto, JornadaTreballadorDto } from './dto/CreateTreballadorDto';
import { AssignarServeisDto } from './dto/AssignarServeisDto';


@Controller('treballadors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TreballadorsController {
  constructor(private readonly treballadorsService: TreballadorsService) { }

  @Post()
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Crear treballador' })
  @ApiResponse({ status: 201, description: 'Treballador creado' })
  @ApiResponse({ status: 409, description: 'Treballador ya existe' })
  create(@Body() createTreballadorDto: CreateTreballadorDto, @CurrentUser() user: CurrentUserData) {
    return this.treballadorsService.create(user.empresaId, createTreballadorDto, user.userId);
  }

  @Post('assignar-jornada')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Crear treballador' })
  @ApiResponse({ status: 201, description: 'Treballador creado' })
  @ApiResponse({ status: 409, description: 'Treballador ya existe' })
  assignarJornada(@Body() createTreballadorDto: CreateJornadaTreballadorExistDto, @CurrentUser() user: CurrentUserData) {
    return this.treballadorsService.assignJornadaTreballador(user.empresaId, createTreballadorDto, user.userId);
  }

  @Post('assignar-serveis')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Asignar múltiples servicios a un trabajador' })
  @ApiResponse({ status: 201, description: 'Servicios asignados correctamente' })
  @ApiResponse({ status: 403, description: 'No autorizado o empresa incorrecta' })
  @ApiResponse({ status: 404, description: 'Trabajador o servicios no encontrados' })
  assignarServeis(@Body() dto: AssignarServeisDto, @CurrentUser() user: CurrentUserData) {
    return this.treballadorsService.assignarServeis(user.empresaId, dto, user.userId);
  }
}

