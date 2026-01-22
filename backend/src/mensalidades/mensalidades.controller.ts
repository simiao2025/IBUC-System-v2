import { Controller, Post, Put, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MensalidadesService } from './mensalidades.service';
import { CreateCobrancaLoteDto, ConfirmarPagamentoDto, UpdateConfiguracaoFinanceiraDto } from './dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Mensalidades')
@Controller('mensalidades')
export class MensalidadesController {
  constructor(private readonly service: MensalidadesService) { }

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
    @Query('polo_id') poloId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.listarCobrancas({
      turma_id: turmaId,
      aluno_id: alunoId,
      polo_id: poloId,
      status
    });
  }

  @Post(':id/confirmar')
  @ApiOperation({ summary: 'Confirmar pagamento de uma cobrança (Aluno ou Baixa)' })
  confirmarPagamento(
    @Param('id') id: string,
    @Body() dto?: ConfirmarPagamentoDto
  ) {
    return this.service.confirmarPagamento(id, dto);
  }

  @Get('pagamentos/pendentes')
  @ApiOperation({ summary: 'Listar pagamentos aguardando validação' })
  listarPendentes() {
    return this.service.listarPagamentosPendentes();
  }

  @Post('pagamentos/:id/aprovar')
  @ApiOperation({ summary: 'Aprovar um pagamento pendente' })
  aprovarPagamento(
    @Param('id') id: string,
    @Body('diretor_id') diretorId: string
  ) {
    return this.service.aprovarPagamento(id, diretorId);
  }

  @Get('configuracao')
  @ApiOperation({ summary: 'Buscar configuração financeira (chave PIX)' })
  buscarConfiguracao() {
    return this.service.buscarConfiguracaoFinanceira();
  }

  @Put('configuracao')
  @ApiOperation({ summary: 'Atualizar configuração financeira' })
  atualizarConfiguracao(@Body() dto: UpdateConfiguracaoFinanceiraDto) {
    return this.service.atualizarConfiguracaoFinanceira(dto);
  }
}
