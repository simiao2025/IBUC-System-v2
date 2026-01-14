
import { Controller, Get, Post, Body, Param, UseGuards, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CertificadosService } from './certificados.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Certificados')
@Controller('certificados')
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) { }

  @Get('count')
  async countTotal() {
    return this.certificadosService.contarTotal();
  }

  @Get()
  async listar(@Query('aluno_id') alunoId?: string) {
    return this.certificadosService.listar(alunoId);
  }

  @Post('gerar')
  async gerar(@Body() body: any) {
    return this.certificadosService.gerar(body);
  }

  @Get(':id/view')
  async view(@Param('id') id: string, @Res() res: Response) {
    console.log(`[CertificadosController] 📥 Recebida requisição de visualização para o ID: ${id}`);
    try {
      const buffer = await this.certificadosService.getCertificadoBuffer(id);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=certificado-${id}.pdf`,
        'Content-Length': buffer.length,
      });
      res.send(buffer);
    } catch (error) {
      console.error(`[CertificadosController] ❌ Erro ao visualizar certificado ${id}:`, error);
      res.status(500).json({
        message: 'Erro ao gerar visualização do certificado',
        error: error.message
      });
    }
  }
}
