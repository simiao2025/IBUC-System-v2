import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MensalidadesService } from './mensalidades.service';
import { CreateCobrancaLoteDto, ConfirmarPagamentoDto } from './dto';

@ApiTags('Mensalidades')
@Controller('mensalidades')
export class MensalidadesController {
  constructor(private readonly service: MensalidadesService) {}

  @Post('lote')
  @ApiOperation({ summary: 'Gerar cobranças em lote para uma turma' })
  gerarCobrancasLote(@Body() dto: CreateCobrancaLoteDto) {
    return this.service.gerarCobrancasLote(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cobranças com filtros opcionais' })
  listarCobrancas(
    @Query('turma_id') turmaId?: string,
    @Query('aluno_id') alunoId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.listarCobrancas({ 
      turma_id: turmaId, 
      aluno_id: alunoId, 
      status 
    });
  }

  @Post(':id/confirmar')
  @ApiOperation({ summary: 'Confirmar pagamento de uma cobrança' })
  confirmarPagamento(
    @Param('id') id: string, 
    @Body() dto?: ConfirmarPagamentoDto
  ) {
    return this.service.confirmarPagamento(id, dto);
  }

  @Get('configuracao')
  @ApiOperation({ summary: 'Buscar configuração financeira (chave PIX)' })
  buscarConfiguracao() {
    return this.service.buscarConfiguracaoFinanceira();
  }
}
