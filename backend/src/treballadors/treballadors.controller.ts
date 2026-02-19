import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { TreballadorsService } from './treballadors.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateJornadaTreballadorExistDto, CreateTreballadorDto, JornadaTreballadorDto } from './dto/CreateTreballadorDto';
import { AssignarServeisDto } from './dto/AssignarServeisDto';
import { GetDisponibilitatDto } from './dto/GetDisponibilitatDto';


@Controller('treballadors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TreballadorsController {
  constructor(private readonly treballadorsService: TreballadorsService) { }

  @Post()
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Crear treballador' })
  @ApiBody({ type: CreateTreballadorDto })
  @ApiResponse({ status: 201, description: 'Treballador creat correctament' })
  @ApiResponse({ status: 403, description: 'Prohibit: No tens permís' })
  @ApiResponse({ status: 404, description: 'No trobat: Usuari a assignar no existeix' })
  @ApiResponse({ status: 409, description: 'Conflicte: Treballador ja existeix' })
  create(@Body() createTreballadorDto: CreateTreballadorDto, @CurrentUser() user: CurrentUserData) {
    return this.treballadorsService.create(user.empresaId, createTreballadorDto, user.userId);
  }

  @Post('assignar-jornada')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Assignar jornada a un treballador existent' })
  @ApiBody({ type: CreateJornadaTreballadorExistDto })
  @ApiResponse({ status: 201, description: 'Jornada assignada correctament' })
  @ApiResponse({ status: 403, description: 'Prohibit: No tens permís' })
  @ApiResponse({ status: 404, description: 'No trobat: Treballador o plantilla no existeixen' })
  @ApiResponse({ status: 409, description: 'Conflicte' })
  assignarJornada(@Body() createTreballadorDto: CreateJornadaTreballadorExistDto, @CurrentUser() user: CurrentUserData) {
    return this.treballadorsService.assignJornadaTreballador(user.empresaId, createTreballadorDto, user.userId);
  }

  @Delete("assignar-jornada/:id")
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Eliminar jornada assignada a un treballador' })
  @ApiResponse({ status: 200, description: 'Jornada eliminada correctament' })
  @ApiResponse({ status: 403, description: 'Prohibit: No tens permís' })
  @ApiResponse({ status: 404, description: 'No trobat: Treballador o jornada no existeixen' })
  @ApiResponse({ status: 409, description: 'Conflicte' })
  eliminarJornada(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.treballadorsService.eliminarJornadaTreballador(user.empresaId, id, user.userId);
  }

  @Post('assignar-serveis')
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Asignar múltiples servicios a un trabajador' })
  @ApiBody({ type: AssignarServeisDto })
  @ApiResponse({ status: 201, description: 'Servicios asignados correctamente' })
  @ApiResponse({ status: 403, description: 'No autorizado o empresa incorrecta' })
  @ApiResponse({ status: 404, description: 'Trabajador o servicios no encontrados' })
  assignarServeis(@Body() dto: AssignarServeisDto, @CurrentUser() user: CurrentUserData) {
    return this.treballadorsService.assignarServeis(user.empresaId, dto, user.userId);
  }

  @Delete("assignar-serveis/:id")
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Eliminar serveis assignats a un treballador' })
  @ApiResponse({ status: 200, description: 'Serveis eliminats correctament' })
  @ApiResponse({ status: 403, description: 'Prohibit: No tens permís' })
  @ApiResponse({ status: 404, description: 'No trobat: Treballador o serveis no existeixen' })
  @ApiResponse({ status: 409, description: 'Conflicte' })
  eliminarServeis(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.treballadorsService.eliminarServeis(user.empresaId, id, user.userId);
  }

  @Get("disponibilitat/:id")
  @Roles('ADMIN_GENERAL')
  @ApiOperation({ summary: 'Obtenir disponibilitat d\'un treballador' })
  @ApiResponse({ status: 200, description: 'Disponibilitat obtinguda correctament' })
  @ApiResponse({ status: 403, description: 'Prohibit: No tens permís' })
  @ApiResponse({ status: 404, description: 'No trobat: Treballador no existeix' })
  @ApiResponse({ status: 409, description: 'Conflicte' })
  getDisponibilitat(@Param('id', ParseIntPipe) id: number, @Body() dto: GetDisponibilitatDto, @CurrentUser() user: CurrentUserData) {
    return this.treballadorsService.getDisponibilitat(user.empresaId, id, dto.serveiId, user.userId);
  }
}

