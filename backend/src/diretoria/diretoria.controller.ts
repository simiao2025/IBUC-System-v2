import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DiretoriaService, CreateDiretoriaGeralDto, UpdateDiretoriaGeralDto } from './diretoria.service';

@Controller('diretoria')
export class DiretoriaController {
  constructor(private readonly diretoriaService: DiretoriaService) {}

  // ========== DIRETORIA GERAL ==========

  @Post('geral')
  @HttpCode(HttpStatus.CREATED)
  async criarDiretoriaGeral(@Body() dto: CreateDiretoriaGeralDto) {
    return this.diretoriaService.criarDiretoriaGeral(dto);
  }

  @Get('geral')
  async listarDiretoriaGeral(@Query('ativo') ativo?: string) {
    const ativoBool = ativo === 'true' ? true : ativo === 'false' ? false : undefined;
    return this.diretoriaService.listarDiretoriaGeral(ativoBool);
  }

  @Get('geral/:id')
  async buscarDiretoriaGeralPorId(@Param('id') id: string) {
    return this.diretoriaService.buscarDiretoriaGeralPorId(id);
  }

  @Put('geral/:id')
  async atualizarDiretoriaGeral(
    @Param('id') id: string,
    @Body() dto: UpdateDiretoriaGeralDto
  ) {
    return this.diretoriaService.atualizarDiretoriaGeral(id, dto);
  }

  @Put('geral/:id/desativar')
  async desativarDiretoriaGeral(@Param('id') id: string) {
    return this.diretoriaService.desativarDiretoriaGeral(id);
  }

  // ========== DIRETORIA POLO ==========

  @Post('polo/:poloId')
  @HttpCode(HttpStatus.CREATED)
  async criarDiretoriaPolo(
    @Param('poloId') poloId: string,
    @Body() dto: CreateDiretoriaGeralDto
  ) {
    return this.diretoriaService.criarDiretoriaPolo(poloId, dto);
  }

  @Get('polo')
  async listarDiretoriaPolo(
    @Query('polo_id') poloId?: string,
    @Query('ativo') ativo?: string
  ) {
    const ativoBool = ativo === 'true' ? true : ativo === 'false' ? false : undefined;
    return this.diretoriaService.listarDiretoriaPolo(poloId, ativoBool);
  }

  @Get('polo/:id')
  async buscarDiretoriaPoloPorId(@Param('id') id: string) {
    return this.diretoriaService.buscarDiretoriaPoloPorId(id);
  }

  @Put('polo/:id')
  async atualizarDiretoriaPolo(
    @Param('id') id: string,
    @Body() dto: UpdateDiretoriaGeralDto
  ) {
    return this.diretoriaService.atualizarDiretoriaPolo(id, dto);
  }

  @Put('polo/:id/desativar')
  async desativarDiretoriaPolo(@Param('id') id: string) {
    return this.diretoriaService.desativarDiretoriaPolo(id);
  }
}






