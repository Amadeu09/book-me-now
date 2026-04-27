import { Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe } from '@nestjs/common';
import { ValoracionsService } from './valoracions.service';
import { CreateValoracioDto, CreateValoracioByTokenDto, UpdateValoracioDto } from './dto/valoracions.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('valoracions')
@Controller('valoracions')
export class ValoracionsController {
    constructor(private readonly valoracionsService: ValoracionsService) { }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva valoración' })
    @ApiBody({ type: CreateValoracioDto })
    @ApiResponse({ status: 201, description: 'Valoración creada correctamente' })
    @ApiResponse({ status: 404, description: 'Entidad (Trabajador/Empresa) no encontrada' })
    create(@Body() createValoracioDto: CreateValoracioDto) {
        return this.valoracionsService.create(createValoracioDto);
    }

    @Get('reserva/:token')
    @ApiOperation({ summary: 'Obtenir informació de la reserva per valorar (via token)' })
    @ApiParam({ name: 'token', type: String })
    @ApiResponse({ status: 200, description: 'Informació de la reserva' })
    @ApiResponse({ status: 404, description: 'Token no vàlid' })
    getInfoByToken(@Param('token') token: string) {
        return this.valoracionsService.getInfoByToken(token);
    }

    @Post('reserva/:token')
    @ApiOperation({ summary: 'Enviar valoració d\'empresa i treballador via token de cita' })
    @ApiParam({ name: 'token', type: String })
    @ApiBody({ type: CreateValoracioByTokenDto })
    @ApiResponse({ status: 201, description: 'Valoració creada' })
    @ApiResponse({ status: 400, description: 'La cita encara no ha passat o falten dades' })
    @ApiResponse({ status: 409, description: 'Ja valorada' })
    @ApiResponse({ status: 404, description: 'Token no vàlid' })
    createByToken(@Param('token') token: string, @Body() dto: CreateValoracioByTokenDto) {
        return this.valoracionsService.createByToken(token, dto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar todas las valoraciones' })
    findAll() {
        return this.valoracionsService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una valoración por ID' })
    @ApiParam({ name: 'id', type: Number })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.valoracionsService.findOne(id);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Actualizar una valoración' })
    @ApiParam({ name: 'id', type: Number })
    update(@Param('id', ParseIntPipe) id: number, @Body() updateValoracioDto: UpdateValoracioDto) {
        return this.valoracionsService.update(id, updateValoracioDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una valoración' })
    @ApiParam({ name: 'id', type: Number })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.valoracionsService.remove(id);
    }
}
