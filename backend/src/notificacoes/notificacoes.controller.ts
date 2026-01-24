import { Controller, Get, Patch, Param, Req, UseGuards, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificacoesService } from './notificacoes.service';
import { SupabaseService } from '../supabase/supabase.service';

@ApiTags('Notificações')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notificacoes')
export class NotificacoesController {
  constructor(
    private readonly service: NotificacoesService,
    private readonly supabase: SupabaseService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificações do usuário logado' })
  async listar(@Req() req: any) {
    try {
      if (!req.user) {
        throw new BadRequestException('Usuário não autenticado no request');
      }
      const usuarioId = req.user.sub || req.user.id;
      const { data, error } = await this.supabase
        .getAdminClient()
        .from('notificacoes')
        .select('*')
        .eq('usuario_id', usuarioId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro Supabase (listar notificações):', error);
        throw new InternalServerErrorException(`Erro no banco de dados: ${error.message}`);
      }
      return data;
    } catch (e) {
      console.error('Erro no Controller Notificacoes (listar):', e);
      throw e;
    }
  }

  @Get('contagem-nao-lidas')
  @ApiOperation({ summary: 'Contar notificações não lidas' })
  async contarNaoLidas(@Req() req: any) {
    try {
      if (!req.user) {
        throw new BadRequestException('Usuário não autenticado no request');
      }
      const usuarioId = req.user.sub || req.user.id;
      const { count, error } = await this.supabase
        .getAdminClient()
        .from('notificacoes')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', usuarioId)
        .eq('lida', false);

      if (error) {
        console.error('Erro Supabase (contagem notificações):', error);
        throw new InternalServerErrorException(`Erro no banco de dados: ${error.message}`);
      }
      return { count: count || 0 };
    } catch (e) {
      console.error('Erro no Controller Notificacoes (contagem):', e);
      throw e;
    }
  }

  @Patch(':id/ler')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  async marcarComoLida(@Param('id') id: string, @Req() req: any) {
    try {
      if (!req.user) {
        throw new BadRequestException('Usuário não autenticado no request');
      }
      const usuarioId = req.user.sub || req.user.id;
      const { data, error } = await this.supabase
        .getAdminClient()
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', id)
        .eq('usuario_id', usuarioId)
        .select()
        .single();

      if (error) {
        console.error('Erro Supabase (marcar como lida):', error);
        throw new InternalServerErrorException(`Erro no banco de dados: ${error.message}`);
      }
      return data;
    } catch (e) {
      console.error('Erro no Controller Notificacoes (marcar como lida):', e);
      throw e;
    }
  }

  @Patch('ler-todas')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  async marcarTodasComoLidas(@Req() req: any) {
    try {
      if (!req.user) {
        throw new BadRequestException('Usuário não autenticado no request');
      }
      const usuarioId = req.user.sub || req.user.id;
      const { data, error } = await this.supabase
        .getAdminClient()
        .from('notificacoes')
        .update({ lida: true })
        .eq('usuario_id', usuarioId)
        .eq('lida', false)
        .select();

      if (error) {
        console.error('Erro Supabase (marcar todas):', error);
        throw new InternalServerErrorException(`Erro no banco de dados: ${error.message}`);
      }
      return data;
    } catch (e) {
      console.error('Erro no Controller Notificacoes (marcar todas):', e);
      throw e;
    }
  }
}
