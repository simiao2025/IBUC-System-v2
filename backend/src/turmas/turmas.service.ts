import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class TurmasService {
  constructor(private supabase: SupabaseService) {}

  private async validarPoloAtivo(poloId: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('polos')
      .select('id, status')
      .eq('id', poloId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Polo não encontrado');
    }

    if (data.status !== 'ativo') {
      throw new BadRequestException('Turma deve pertencer a um polo ativo');
    }
  }

  private async validarNivelExiste(nivelId: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('niveis')
      .select('id')
      .eq('id', nivelId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Nível não encontrado');
    }
  }

  private async validarProfessor(professorId: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('usuarios')
      .select('id, role, ativo')
      .eq('id', professorId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Professor não encontrado');
    }

    if (data.role !== 'professor') {
      throw new BadRequestException('Usuário informado não é professor');
    }

    if (data.ativo === false) {
      throw new BadRequestException('Professor informado está inativo');
    }
  }

  async buscarTurmaPorId(id: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('turmas')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Turma não encontrada');
    }

    return data;
  }

  async criarTurma(dto: {
    nome: string;
    polo_id: string;
    nivel_id: string;
    professor_id?: string;
    capacidade: number;
    ano_letivo: number;
    turno: 'manha' | 'tarde' | 'noite';
    dias_semana?: number[];
    status?: 'ativa' | 'inativa' | 'concluida';
  }) {
    if (!dto.nome || dto.nome.trim().length === 0) {
      throw new BadRequestException('Nome é obrigatório');
    }

    if (!dto.polo_id) {
      throw new BadRequestException('polo_id é obrigatório');
    }

    if (!dto.nivel_id) {
      throw new BadRequestException('nivel_id é obrigatório');
    }

    if (typeof dto.capacidade !== 'number' || dto.capacidade <= 0) {
      throw new BadRequestException('capacidade deve ser maior que 0');
    }

    if (typeof dto.ano_letivo !== 'number' || !Number.isFinite(dto.ano_letivo)) {
      throw new BadRequestException('ano_letivo inválido');
    }

    await this.validarPoloAtivo(dto.polo_id);
    await this.validarNivelExiste(dto.nivel_id);
    if (dto.professor_id) {
      await this.validarProfessor(dto.professor_id);
    }

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('turmas')
      .insert({
        nome: dto.nome,
        polo_id: dto.polo_id,
        nivel_id: dto.nivel_id,
        professor_id: dto.professor_id || null,
        capacidade: dto.capacidade,
        ano_letivo: dto.ano_letivo,
        turno: dto.turno,
        dias_semana: Array.isArray(dto.dias_semana) ? dto.dias_semana : [],
        status: dto.status || 'ativa',
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async atualizarTurma(
    id: string,
    dto: {
      nome?: string;
      polo_id?: string;
      nivel_id?: string;
      professor_id?: string | null;
      capacidade?: number;
      ano_letivo?: number;
      turno?: 'manha' | 'tarde' | 'noite';
      dias_semana?: number[];
      status?: 'ativa' | 'inativa' | 'concluida';
    },
  ) {
    await this.buscarTurmaPorId(id);

    if (dto.polo_id) {
      await this.validarPoloAtivo(dto.polo_id);
    }

    if (dto.nivel_id) {
      await this.validarNivelExiste(dto.nivel_id);
    }

    if (dto.professor_id) {
      await this.validarProfessor(dto.professor_id);
    }

    if (dto.capacidade !== undefined) {
      if (typeof dto.capacidade !== 'number' || dto.capacidade <= 0) {
        throw new BadRequestException('capacidade deve ser maior que 0');
      }
    }

    const updateData: any = {};
    if (dto.nome !== undefined) updateData.nome = dto.nome;
    if (dto.polo_id !== undefined) updateData.polo_id = dto.polo_id;
    if (dto.nivel_id !== undefined) updateData.nivel_id = dto.nivel_id;
    if (dto.professor_id !== undefined) updateData.professor_id = dto.professor_id;
    if (dto.capacidade !== undefined) updateData.capacidade = dto.capacidade;
    if (dto.ano_letivo !== undefined) updateData.ano_letivo = dto.ano_letivo;
    if (dto.turno !== undefined) updateData.turno = dto.turno;
    if (dto.dias_semana !== undefined) updateData.dias_semana = dto.dias_semana;
    if (dto.status !== undefined) updateData.status = dto.status;

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('turmas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async deletarTurma(id: string) {
    await this.buscarTurmaPorId(id);

    const { error } = await this.supabase
      .getAdminClient()
      .from('turmas')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(error.message);
    }
  }

  async listarTurmas(filtros?: {
    polo_id?: string;
    nivel_id?: string;
    professor_id?: string;
    status?: string;
    ano_letivo?: number;
  }) {
    let query = this.supabase
      .getAdminClient()
      .from('turmas')
      .select('*')
      .order('nome');

    if (filtros?.polo_id) {
      query = query.eq('polo_id', filtros.polo_id);
    }

    if (filtros?.nivel_id) {
      query = query.eq('nivel_id', filtros.nivel_id);
    }

    if (filtros?.professor_id) {
      query = query.eq('professor_id', filtros.professor_id);
    }

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    if (typeof filtros?.ano_letivo === 'number') {
      query = query.eq('ano_letivo', filtros.ano_letivo);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }
}
