import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class EventosService {
  constructor(private supabase: SupabaseService) {}

  async criar(dto: {
    titulo: string;
    descricao?: string;
    local?: string;
    data_inicio: string;
    data_fim?: string;
    polo_id?: string | null;
    criado_por?: string | null;
  }, token: string) {
    if (!dto.titulo || dto.titulo.trim().length === 0) {
      throw new BadRequestException('titulo é obrigatório');
    }
    if (!dto.data_inicio) {
      throw new BadRequestException('data_inicio é obrigatório');
    }

    const { data, error } = await this.supabase
      .getClientWithToken(token)
      .from('eventos')
      .insert({
        titulo: dto.titulo,
        descricao: dto.descricao || null,
        local: dto.local || null,
        data_inicio: dto.data_inicio,
        data_fim: dto.data_fim || null,
        polo_id: dto.polo_id || null,
        criado_por: dto.criado_por || null,
      })
      .select('*')
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async listar(filtros: {
    polo_id?: string;
    include_geral?: boolean;
    date_from?: string;
    limit?: number;
  }, token: string) {
    let query = this.supabase
      .getClientWithToken(token)
      .from('eventos')
      .select('*')
      .order('data_inicio', { ascending: true });

    if (filtros?.date_from) {
      query = query.gte('data_inicio', filtros.date_from);
    }

    if (typeof filtros?.limit === 'number' && Number.isFinite(filtros.limit) && filtros.limit > 0) {
      query = query.limit(filtros.limit);
    }

    // Logic related to polo filtering is now largely handled by RLS policies,
    // but explicit filtering is still useful for UX (e.g., frontend asking for specific polo).
    // RLS will ensure user can't see what they shouldn't.
    if (filtros?.polo_id) {
      if (filtros.include_geral) {
        query = query.or(`polo_id.eq.${filtros.polo_id},polo_id.is.null`);
      } else {
        query = query.eq('polo_id', filtros.polo_id);
      }
    }

    const { data, error } = await query;
    if (error) {
       console.error('Erro no Supabase (listar):', JSON.stringify(error, null, 2));
       throw new BadRequestException(error.message);
    }

    return data || [];
  }

  async buscarPorId(id: string, token: string) {
    const { data, error } = await this.supabase
      .getClientWithToken(token)
      .from('eventos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Evento não encontrado');
    return data;
  }

  async atualizar(
    id: string,
    dto: {
      titulo?: string;
      descricao?: string | null;
      local?: string | null;
      data_inicio?: string;
      data_fim?: string | null;
      polo_id?: string | null;
    },
    token: string
  ) {
    await this.buscarPorId(id, token);

    const payload: any = {};
    if (dto.titulo !== undefined) payload.titulo = dto.titulo;
    if (dto.descricao !== undefined) payload.descricao = dto.descricao;
    if (dto.local !== undefined) payload.local = dto.local;
    if (dto.data_inicio !== undefined) payload.data_inicio = dto.data_inicio;
    if (dto.data_fim !== undefined) payload.data_fim = dto.data_fim;
    if (dto.polo_id !== undefined) payload.polo_id = dto.polo_id;

    const { data, error } = await this.supabase
      .getClientWithToken(token)
      .from('eventos')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async deletar(id: string, token: string) {
    await this.buscarPorId(id, token);

    const { error } = await this.supabase
      .getClientWithToken(token)
      .from('eventos')
      .delete()
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);
  }
}
