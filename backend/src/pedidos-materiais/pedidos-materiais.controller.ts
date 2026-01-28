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
  Req,
  Res,
  Query,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import * as fs from 'fs';
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
  async listar(
    @Query('polo_id') poloId?: string,
    @Query('status') status?: string,
    @Query('aluno_id') alunoId?: string
  ) {
    return this.service.listar({ polo_id: poloId, status, aluno_id: alunoId });
  }

  @Get('pdf')
  @ApiOperation({ summary: 'Gerar PDF da lista de pedidos' })
  async gerarPdf(
    @Res() res: any,
    @Query('polo_id') poloId?: string,
    @Query('status') status?: string,
  ) {
    const result: any = await this.service.gerarPdfLista({ polo_id: poloId, status });
    if (result.success && result.filePath) {
      const buffer = fs.readFileSync(result.filePath);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${result.fileName}`,
        'Content-Length': buffer.length,
      });
      res.send(buffer);
    } else {
      res.status(500).json({ message: 'Erro ao gerar PDF' });
    }
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

  @Patch(':id/aprovar')
  @ApiOperation({ summary: 'Aprovar pedido de material' })
  async aprovar(@Param('id') id: string, @Req() req) {
    return this.service.aprovar(id, req.user.id);
  }

  @Patch(':id/recusar')
  @ApiOperation({ summary: 'Recusar pedido de material' })
  async recusar(@Param('id') id: string) {
    return this.service.recusar(id);
  }

  @Patch(':id/validar-pagamento')
  @ApiOperation({ summary: 'Validar pagamento de material (Tesoureiro do Polo)' })
  async validarPagamento(
    @Param('id') id: string,
    @Body('observacoes') observacoes: string,
    @Req() req
  ) {
    // Verificar permissão - deve ser primeiro_tesoureiro_polo
    const user = req.user;
    if (!['primeiro_tesoureiro_polo', 'admin_geral', 'super_admin'].includes(user.role)) {
      throw new UnauthorizedException('Apenas o 1º Tesoureiro do Polo pode validar pagamentos');
    }
    
    // Se for tesoureiro de polo, verificar se o pedido pertence ao seu polo
    if (user.role === 'primeiro_tesoureiro_polo') {
      const pedido = await this.service.buscarPorId(id);
      if (pedido.polo_id !== user.polo_id) {
        throw new ForbiddenException('Você só pode validar pedidos do seu polo');
      }
    }
    
    return this.service.validarPagamento(id, user.id, observacoes);
  }

  @Patch(':id/rejeitar-pagamento')
  @ApiOperation({ summary: 'Rejeitar pagamento de material (Tesoureiro do Polo)' })
  async rejeitarPagamento(
    @Param('id') id: string,
    @Body('motivo') motivo: string,
    @Req() req
  ) {
    // Verificar permissão - deve ser primeiro_tesoureiro_polo
    const user = req.user;
    if (!['primeiro_tesoureiro_polo', 'admin_geral', 'super_admin'].includes(user.role)) {
      throw new UnauthorizedException('Apenas o 1º Tesoureiro do Polo pode rejeitar pagamentos');
    }
    
    // Se for tesoureiro de polo, verificar se o pedido pertence ao seu polo
    if (user.role === 'primeiro_tesoureiro_polo') {
      const pedido = await this.service.buscarPorId(id);
      if (pedido.polo_id !== user.polo_id) {
        throw new ForbiddenException('Você só pode rejeitar pedidos do seu polo');
      }
    }
    
    if (!motivo) {
      throw new BadRequestException('Motivo da rejeição é obrigatório');
    }
    
    return this.service.rejeitarPagamento(id, user.id, motivo);
  }

  @Patch(':id/comprovante')
  @ApiOperation({ summary: 'Atualizar comprovante de pagamento' })
  async atualizarComprovante(
    @Param('id') id: string,
    @Body('url_comprovante') urlComprovante: string
  ) {
    return this.service.atualizarComprovante(id, urlComprovante);
  }

  @Post(':id/gerar-cobrancas')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gerar cobranças para o pedido' })
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
