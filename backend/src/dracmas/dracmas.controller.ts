import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { DracmasService } from './dracmas.service';

@ApiTags('Drácmas')
@Controller('dracmas')
export class DracmasController {
  constructor(private readonly service: DracmasService) {}

  @Post('lancar-lote')
  async lancarLote(@Body() body: any) {
    return this.service.lancarLote(body);
  }

  @Get('saldo')
  async saldo(@Query('aluno_id') alunoId: string) {
    return this.service.saldoPorAluno(alunoId);
  }

  @Get('por-aluno')
  async porAluno(
    @Query('aluno_id') alunoId: string,
    @Query('inicio') inicio?: string,
    @Query('fim') fim?: string,
  ) {
    return this.service.porAluno(alunoId, inicio, fim);
  }

  @Get('por-turma')
  async porTurma(
    @Query('turma_id') turmaId: string,
    @Query('inicio') inicio?: string,
    @Query('fim') fim?: string,
  ) {
    return this.service.porTurma(turmaId, inicio, fim);
  }
}
