import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateAulaDto, UpdateAulaDto } from './dto/create-aula.dto';

@Injectable()
export class CalendarioService {
  constructor(private supabase: SupabaseService) {}

  async criar(dto: CreateAulaDto, token: string) {
    const { data, error } = await this.supabase
      .getClientWithToken(token)
      .from('calendario_aulas')
      .insert({
        turma_id: dto.turma_id,
        modulo_id: dto.modulo_id,
        licao_id: dto.licao_id,
        data_aula: dto.data_aula,
        observacoes: dto.observacoes || null,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async listarPorTurma(turmaId: string, token: string, mes?: number, ano?: number) {
    let query = this.supabase
      .getClientWithToken(token)
      .from('calendario_aulas')
      .select('*, licao:licoes(titulo, ordem), modulo:modulos(titulo)')
      .eq('turma_id', turmaId)
      .order('data_aula', { ascending: true });

    if (mes && ano) {
        const startDate = `${ano}-${mes.toString().padStart(2, '0')}-01`;
        // last day of month
        const lastDay = new Date(ano, mes, 0).getDate();
        const endDate = `${ano}-${mes.toString().padStart(2, '0')}-${lastDay}`;
        
        query = query.gte('data_aula', startDate).lte('data_aula', endDate);
    }

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);
    return data || [];
  }

  async atualizar(id: string, dto: UpdateAulaDto, token: string) {
    const { data, error } = await this.supabase
      .getClientWithToken(token)
      .from('calendario_aulas')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async deletar(id: string, token: string) {
    const { error } = await this.supabase
      .getClientWithToken(token)
      .from('calendario_aulas')
      .delete()
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);
  }
}
