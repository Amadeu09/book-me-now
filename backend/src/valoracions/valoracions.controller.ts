import { Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { ValoracionsService } from './valoracions.service';
import { CreateValoracioDto, UpdateValoracioDto } from './dto/valoracions.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('valoracions')
@Controller('valoracions')
export class ValoracionsController {
    constructor(private readonly valoracionsService: ValoracionsService) { }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva valoración' })
    @ApiBody({ type: CreateValoracioDto })
    @ApiResponse({ status: 201, description: 'Valoración creada correctamente' })
    @ApiResponse({ status: 400, description: 'Datos inválidos o petición incorrecta' })
    @ApiResponse({ status: 404, description: 'Entidad (Trabajador/Empresa) no encontrada' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })
    create(@Body() createValoracioDto: CreateValoracioDto) {
        return this.valoracionsService.create(createValoracioDto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas las valoraciones' })
    @ApiResponse({ status: 200, description: 'Lista de valoraciones recuperada' })
    @ApiResponse({ status: 400, description: 'Petición incorrecta' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })
    findAll() {
        return this.valoracionsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una valoración por ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Valoración encontrada' })
    @ApiResponse({ status: 400, description: 'Petición incorrecta (ID inválido)' })
    @ApiResponse({ status: 404, description: 'Valoración no encontrada' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.valoracionsService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar una valoración' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: UpdateValoracioDto })
    @ApiResponse({ status: 200, description: 'Valoración actualizada correctamente' })
    @ApiResponse({ status: 400, description: 'Petición incorrecta (errores de validación)' })
    @ApiResponse({ status: 404, description: 'Valoración no encontrada' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateValoracioDto: UpdateValoracioDto) {
        return this.valoracionsService.update(id, updateValoracioDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una valoración' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Valoración eliminada correctamente' })
    @ApiResponse({ status: 400, description: 'Petición incorrecta (ID inválido)' })
    @ApiResponse({ status: 404, description: 'Valoración no encontrada' })
    @ApiResponse({ status: 500, description: 'Error interno del servidor' })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.valoracionsService.remove(id);
    }
}
