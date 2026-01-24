import { Controller, Post, Put, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { MensalidadesService } from './mensalidades.service';
import { CreateCobrancaLoteDto, UpdateConfiguracaoFinanceiraDto } from './dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly service: MensalidadesService) { }

  @Post()
  @Roles('admin', 'diretor', 'secretaria')
  @ApiOperation({ summary: 'Create batch billing for a class' })
  createBatch(@Body() dto: CreateCobrancaLoteDto) {
    return this.service.gerarCobrancasLote(dto);
  }

  @Post(':id/publish')
  @Roles('admin', 'diretor', 'secretaria')
  @ApiOperation({ summary: 'Publish and notify a billing' })
  publish(@Param('id') id: string) {
    return this.service.publishBilling(id);
  }

  @Get()
  @Roles('admin', 'diretor', 'secretaria', 'aluno')
  @ApiOperation({ summary: 'List billings with optional filters' })
  findAll(
    @Query('turma_id') turmaId?: string,
    @Query('aluno_id') alunoId?: string,
    @Query('polo_id') poloId?: string,
    @Query('status') status?: string,
    // TODO: Filter logic for student (can only see own) should be in service or here
  ) {
    return this.service.listarCobrancas({
      turma_id: turmaId,
      aluno_id: alunoId,
      polo_id: poloId,
      status
    });
  }

  @Get('configuration')
  @Roles('admin', 'diretor', 'secretaria')
  @ApiOperation({ summary: 'Get financial configuration' })
  getConfig() {
    return this.service.buscarConfiguracaoFinanceira();
  }

  @Put('configuration')
  @Roles('admin', 'diretor')
  @ApiOperation({ summary: 'Update financial configuration' })
  updateConfig(@Body() dto: UpdateConfiguracaoFinanceiraDto) {
    return this.service.atualizarConfiguracaoFinanceira(dto);
  }
}
