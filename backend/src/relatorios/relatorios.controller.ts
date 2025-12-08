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
}






