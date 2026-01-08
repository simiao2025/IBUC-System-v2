import { Controller, Post, Body, Get, Query, UseGuards, Delete, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth-v2/guards/jwt-auth.guard';
import { PresencasService } from './presencas.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Presenças')
@Controller('presencas')
export class PresencasController {
  constructor(private readonly service: PresencasService) { }

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

  @Get('aulas-lancadas')
  async aulasLancadas(@Query('turma_id') turmaId: string) {
    return this.service.listarAulasLancadas(turmaId);
  }

  @Post('delete-batch')
  async excluirLote(@Body() body: { turma_id: string, data: string, licao_id?: string }) {
    return this.service.excluirAulasLote(body.turma_id, body.data, body.licao_id);
  }

  @Delete(':id')
  async excluirIndividual(@Param('id') id: string) {
    return this.service.excluirPresenca(id);
  }
}






