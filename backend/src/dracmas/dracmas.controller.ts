import { Controller, Post, Body, Get, Query, Put, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DracmasService } from './dracmas.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Drácmas')
@Controller('dracmas')
export class DracmasController {
  constructor(private readonly service: DracmasService) { }

  @Post('lancar-lote')
  async lancarLote(@Body() body: any) {
    return this.service.lancarLote(body);
  }

  @Post('delete-student-batch')
  async excluirLoteAluno(@Body() body: { turma_id: string; aluno_id: string; data: string }) {
    return this.service.excluirLoteAluno(body.turma_id, body.aluno_id, body.data);
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

  @Get('total')
  async total(@Query('polo_id') poloId?: string) {
    return this.service.total(poloId);
  }

  @Get('criterios')
  async listarCriterios() {
    return this.service.listarCriterios();
  }

  @Post('criterios')
  async criarCriterio(
    @Body() body: { codigo: string; nome: string; descricao?: string; quantidade_padrao: number; ativo?: boolean },
  ) {
    return this.service.criarCriterio(body);
  }

  @Put('criterios/:id')
  async atualizarCriterio(
    @Param('id') id: string,
    @Body() body: { ativo?: boolean; quantidade_padrao?: number; nome?: string; descricao?: string },
  ) {
    return this.service.atualizarCriterio(id, body);
  }
}
