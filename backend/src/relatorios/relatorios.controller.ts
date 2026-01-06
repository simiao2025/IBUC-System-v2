import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RelatoriosService } from './relatorios.service';

@ApiTags('Relatórios')
@Controller('relatorios')
export class RelatoriosController {
  constructor(private readonly service: RelatoriosService) {}

  @Get('boletim')
  async gerarBoletim(@Query('aluno_id') alunoId: string, @Query('periodo') periodo: string) {
    return this.service.gerarBoletim(alunoId, periodo);
  }

  @Get('historico')
  async historicoAluno(
    @Query('aluno_id') alunoId: string,
    @Query('periodo') periodo?: string,
  ) {
    return this.service.historicoAluno(alunoId, periodo);
  }

  @Get('estatisticas-por-polo')
  async estatisticasPorPolo(@Query('periodo') periodo?: string) {
    return this.service.estatisticasPorPolo(periodo);
  }
  
  @Get('dracmas')
  async relatorioDracmas(
    @Query('aluno_id') aluno_id?: string,
    @Query('turma_id') turma_id?: string,
    @Query('nivel_id') nivel_id?: string,
    @Query('polo_id') polo_id?: string,
    @Query('inicio') inicio?: string,
    @Query('fim') fim?: string,
  ) {
    return this.service.relatorioDracmas({ aluno_id, turma_id, nivel_id, polo_id, inicio, fim });
  }

  @Get('lista-alunos')
  async relatorioListaAlunos(
    @Query('polo_id') polo_id?: string,
    @Query('turma_id') turma_id?: string,
    @Query('nivel_id') nivel_id?: string,
    @Query('status') status?: string,
  ) {
    return this.service.relatorioListaAlunos({ polo_id, turma_id, nivel_id, status });
  }

  @Get('atestado-matricula')
  async relatorioAtestadoMatricula(@Query('aluno_id') aluno_id: string) {
    return this.service.relatorioAtestadoMatricula(aluno_id);
  }

  @Get('lista-chamada')
  async relatorioListaChamada(@Query('turma_id') turma_id: string) {
    return this.service.relatorioListaChamada(turma_id);
  }

  @Get('consolidado-frequencia')
  async relatorioConsolidadoFrequencia(
    @Query('polo_id') polo_id?: string,
    @Query('turma_id') turma_id?: string,
    @Query('inicio') inicio?: string,
    @Query('fim') fim?: string,
  ) {
    return this.service.relatorioConsolidadoFrequencia({ polo_id, turma_id, inicio, fim });
  }

  @Get('inadimplencia')
  async relatorioInadimplencia(
    @Query('polo_id') polo_id?: string,
    @Query('data_referencia') data_referencia?: string,
  ) {
    return this.service.relatorioInadimplencia({ polo_id, data_referencia });
  }
}






