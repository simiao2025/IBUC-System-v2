
import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth-v2/guards/jwt-auth.guard';
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
}
