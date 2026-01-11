import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ListaEsperaService } from './lista-espera.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Lista de Espera')
@Controller('lista-espera')
export class ListaEsperaController {
    constructor(private readonly listaEsperaService: ListaEsperaService) { }

    @Post('cadastrar')
    @ApiOperation({ summary: 'Cadastrar interessado na lista de espera (Público)' })
    cadastrar(@Body() dto: { nome: string; email: string; telefone?: string; cidade?: string; bairro?: string }) {
        return this.listaEsperaService.cadastrar(dto);
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar todos os interessados na lista de espera (Admin)' })
    listar() {
        return this.listaEsperaService.listarTodas();
    }
}
