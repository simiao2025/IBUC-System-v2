import { Controller, Get, Post, Query, Param, Res, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RelatoriosService } from './relatorios.service';
import { PoloScopeGuard } from '../auth/guards/polo-scope.guard';
import { SupabaseService } from '../supabase/supabase.service';

@UseGuards(JwtAuthGuard, PoloScopeGuard)
@ApiBearerAuth()
@ApiTags('Relatórios')
@Controller('relatorios')
export class RelatoriosController {
  constructor(
    private readonly service: RelatoriosService,
    private readonly supabase: SupabaseService
  ) { }

  @Get('boletim')
  async gerarBoletim(
    @Request() req,
    @Query('aluno_id') alunoId: string,
    @Query('periodo') periodo: string,
    @Query('modulo_id') moduloId?: string,
    @Query('turma_id') turmaId?: string,
  ) {
    return this.service.gerarBoletim(alunoId, periodo, moduloId, turmaId, req.user);
  }

  @Get('boletins')
  async listarBoletins(
    @Query('aluno_id') alunoId: string,
    @Request() req
  ) {
    return this.service.listarBoletins(alunoId, req.user);
  }

  @Get('boletim/:id/view')
  async viewBoletim(@Param('id') id: string, @Res() res: any) {
    try {
      const buffer = await this.service.getBoletimBuffer(id);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=boletim-${id}.pdf`,
        'Content-Length': buffer.length,
      });
      res.send(buffer);
    } catch (error) {
      console.error(`[RelatoriosController] Erro ao visualizar boletim ${id}:`, error);
      res.status(500).json({
        message: 'Erro ao carregar visualização do boletim',
        error: error.message
      });
    }
  }

  @Get('boletim-dados')
  async getDadosBoletim(
    @Query('aluno_id') alunoId: string,
    @Query('modulo_id') moduloId: string,
    @Request() req
  ) {
    return this.service.getDadosBoletim(alunoId, moduloId, req.user);
  }

  @Post('boletim-lote')
  async gerarBoletimLote(
    @Body() body: {
      polo_id?: string;
      turma_id?: string;
      modulo_id: string;
      aluno_id?: string;
      aluno_ids?: string[];
    },
    @Request() req
  ) {
    return this.service.gerarBoletimLote(body, req.user);
  }

  @Get('historico')
  async historicoAluno(
    @Query('aluno_id') alunoId: string,
    @Request() req
  ) {
    return this.service.historicoAluno(alunoId, req.user);
  }

  @Get('historico-pdf')
  async gerarHistoricoPdf(
    @Query('aluno_id') alunoId: string,
    @Request() req
  ) {
    return this.service.gerarHistoricoPdf(alunoId, req.user);
  }



  @Get('dracmas')
  async relatorioDracmas(
    @Query('aluno_id') aluno_id?: string,
    @Query('turma_id') turma_id?: string,
    @Query('nivel_id') nivel_id?: string,
    @Query('polo_id') polo_id?: string,
    @Query('inicio') inicio?: string,
    @Query('fim') fim?: string,
    @Request() req?: any
  ) {
    return this.service.relatorioDracmas({ aluno_id, turma_id, nivel_id, polo_id, inicio, fim }, req?.user);
  }

  @Get('lista-alunos')
  async relatorioListaAlunos(
    @Query('polo_id') polo_id?: string,
    @Query('turma_id') turma_id?: string,
    @Query('nivel_id') nivel_id?: string,
    @Query('status') status?: string,
    @Request() req?: any
  ) {
    try {
      console.log('DEBUG: relatorioListaAlunos called', { polo_id, turma_id, nivel_id, status, user: req?.user });
      return await this.service.relatorioListaAlunos({ polo_id, turma_id, nivel_id, status }, req?.user);
    } catch (error) {
      console.error('DEBUG: Controller Error in relatorioListaAlunos:', error);
      throw error;
    }
  }

  @Get('lista-alunos-pdf')
  async gerarListaAlunosPdf(
    @Query('polo_id') polo_id?: string,
    @Query('turma_id') turma_id?: string,
    @Query('nivel_id') nivel_id?: string,
    @Query('status') status?: string,
    @Request() req?: any,
    @Res() res?: any
  ) {
    try {
      const result = await this.service.gerarListaAlunosPdf({ polo_id, turma_id, nivel_id, status }, req?.user);
      
      if (result.success && result.url) {
        // O PDF foi gerado com sucesso, vamos baixar e enviar como stream
        const client = this.supabase.getAdminClient();
        const storagePath = result.url.split('/documentos/').pop();
        
        if (storagePath) {
          const { data, error } = await client.storage.from('documentos').download(storagePath);
          
          if (error || !data) {
            return res.status(500).json({ message: 'Erro ao baixar PDF gerado', error: error?.message });
          }
          
          const buffer = Buffer.from(await data.arrayBuffer());
          res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=lista-alunos-${Date.now()}.pdf`,
            'Content-Length': buffer.length,
          });
          res.send(buffer);
        } else {
          res.status(500).json({ message: 'URL do PDF inválida' });
        }
      } else {
        res.status(500).json({ message: 'Erro ao gerar PDF', error: result });
      }
    } catch (error) {
      console.error('[RelatoriosController] Erro ao gerar lista de alunos PDF:', error);
      res.status(500).json({
        message: 'Erro ao gerar PDF da lista de alunos',
        error: error.message
      });
    }
  }



  @Get('inadimplencia')
  async relatorioInadimplencia(
    @Query('polo_id') polo_id?: string,
    @Query('data_referencia') data_referencia?: string,
    @Request() req?: any
  ) {
    return this.service.relatorioInadimplencia({ polo_id, data_referencia }, req?.user);
  }

  @Get('certificado')
  async gerarCertificado(
    @Request() req,
    @Query('aluno_id') alunoId: string,
    @Query('nivel_id') nivelId: string,
    @Query('turma_id') turmaId?: string,
  ) {
    return this.service.gerarCertificado(alunoId, nivelId, turmaId, req.user);
  }
}






