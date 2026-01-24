import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PedidosMateriaisService } from './pedidos-materiais.service';
import { CreatePedidoMaterialDto } from './dto';

@ApiTags('Pedidos de Materiais')
@Controller('pedidos-materiais')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PedidosMateriaisController {
  constructor(private readonly service: PedidosMateriaisService) { }

  @Get()
  @ApiOperation({ summary: 'Listar todos os pedidos de materiais' })
  async listar() {
    return this.service.listar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar detalhes de um pedido específico' })
  async buscarPorId(@Param('id') id: string) {
    return this.service.buscarPorId(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar um novo rascunho de pedido' })
  async criar(@Body() dto: CreatePedidoMaterialDto) {
    return this.service.criar(dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status do pedido' })
  async atualizarStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.service.atualizarStatus(id, status);
  }

  @Post(':id/gerar-cobrancas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gerar cobranças para todos os alunos do módulo de destino' })
  async gerarCobrancas(
    @Param('id') id: string,
    @Body('vencimento') vencimento: string
  ) {
    return this.service.gerarCobrancas(id, vencimento);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar pedido (somente rascunho)' })
  async deletar(@Param('id') id: string) {
    return this.service.deletar(id);
  }
}
