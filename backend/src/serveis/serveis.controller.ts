import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ServeisService } from './serveis.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { CreateServeiDto, UpdateServeiDto } from './dto/servei.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('serveis')
@UseGuards(JwtAuthGuard)
export class ServeisController {
  constructor(private readonly serveisService: ServeisService) { }

  @Post()
  create(@Body() dto: CreateServeiDto, @CurrentUser() user: CurrentUserData) {
    return this.serveisService.create(user.empresaId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: CurrentUserData,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
  ) {
    return this.serveisService.findAll(user.empresaId, page, 4);
  }

  @Get('treballador/:id')
  @ApiOperation({ summary: 'Extreure tots els serveis per un treballador' })
  @ApiResponse({ status: 201, description: 'Serveis trobats' })
  @ApiResponse({ status: 403, description: 'No autorizado o empresa incorrecta' })
  @ApiResponse({ status: 404, description: 'Trabajador o servicios no encontrados' })
  findByTreballador(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.serveisService.findByTreballador(user.empresaId, id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.serveisService.findOne(user.empresaId, id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServeiDto,
    @CurrentUser() user: CurrentUserData,
  ) {
    return this.serveisService.update(user.empresaId, id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: CurrentUserData) {
    return this.serveisService.remove(user.empresaId, id);
  }
}
