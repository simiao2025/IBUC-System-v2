import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ConfiguracoesService } from './configuracoes.service';
import { JwtAuthGuard } from '../auth-v2/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('configuracoes')
@Controller('configuracoes')
export class ConfiguracoesController {
    constructor(private readonly configuracoesService: ConfiguracoesService) { }

    @Get('publicas')
    @ApiOperation({ summary: 'Listar configurações públicas (ex: Missão, Visão, Contato)' })
    listarPublicas() {
        return this.configuracoesService.buscarPublicas();
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar todas as configurações (Admin)' })
    listarTodas() {
        return this.configuracoesService.listarTodas();
    }

    @Get(':chave')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Buscar configuração específica por chave' })
    buscarPorChave(@Param('chave') chave: string) {
        return this.configuracoesService.buscarPorChave(chave);
    }

    @Put(':chave')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Atualizar valor de uma configuração' })
    atualizar(@Param('chave') chave: string, @Body('valor') valor: any) {
        return this.configuracoesService.atualizar(chave, valor);
    }
}
