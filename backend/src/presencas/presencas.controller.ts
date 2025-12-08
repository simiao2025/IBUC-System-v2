import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PresencasService } from './presencas.service';

@ApiTags('Presenças')
@Controller('presencas')
export class PresencasController {
  constructor(private readonly service: PresencasService) {}

  @Post()
  async lancar(@Body() dto: any) {
    return this.service.lancarPresenca(dto);
  }

  @Post('batch')
  async lancarLote(@Body() body: any) {
    const { presencas } = body || {};
    return this.service.lancarPresencasLote(presencas);
  }

  @Get('por-aluno')
  async porAluno(
    @Query('aluno_id') alunoId: string,
    @Query('inicio') inicio?: string,
    @Query('fim') fim?: string,
  ) {
    return this.service.listarPorAluno(alunoId, inicio, fim);
  }

  @Get('por-turma')
  async porTurma(
    @Query('turma_id') turmaId: string,
    @Query('inicio') inicio?: string,
    @Query('fim') fim?: string,
  ) {
    return this.service.listarPorTurma(turmaId, inicio, fim);
  }
}






