import { Controller, Post, Body, Get, Query, UseGuards, Delete, Param } from '@nestjs/common';
import { PresencasService } from './presencas.service';
import { UnifiedAttendanceDto } from './dto/unified-attendance.dto';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Presenças')
@Controller('presencas')
@ApiTags('Presenças')
export class PresencasController {
  constructor(private readonly service: PresencasService) { }

  @Post('unified')
  @ApiOperation({ summary: 'Lança frequências e drácmas de forma atômica (Sprint 2)' })
  async lancarUnificado(@Body() dto: UnifiedAttendanceDto) {
    return this.service.lancarFrequenciaCompleta(dto);
  }

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






