import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface CreateModuloDto {
  numero: number;
  titulo: string;
  descricao?: string;
  duracao_sugestiva?: number;
  requisitos?: string;
  objetivos?: string;
  carga_horaria?: number;
  is_active_cycle?: boolean;
}

export interface UpdateModuloDto {
  numero?: number;
  titulo?: string;
  descricao?: string;
  duracao_sugestiva?: number;
  requisitos?: string;
  objetivos?: string;
  carga_horaria?: number;
  is_active_cycle?: boolean;
}


export interface CreateLicaoDto {
  modulo_id: string;
  titulo: string;
  descricao?: string;
  ordem: number;
  video_url?: string;
  material_pdf_url?: string;
  liberacao_data?: string;
  duracao_minutos?: number;
}

export interface UpdateLicaoDto {
  titulo?: string;
  descricao?: string;
  ordem?: number;
  video_url?: string;
  material_pdf_url?: string;
  liberacao_data?: string;
  duracao_minutos?: number;
}

@Injectable()
export class ModulosService {
  constructor(private supabase: SupabaseService) {}

  async listarModulos() {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('modulos')
      .select('*')
      .order('numero');

    if (error) {
      throw new BadRequestException(`Erro ao listar módulos: ${error.message}`);
    }

    return data || [];
  }

  async buscarCicloAtivo() {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('modulos')
      .select('*')
      .eq('is_active_cycle', true)
      .maybeSingle();

    if (error) {
      throw new BadRequestException(`Erro ao buscar ciclo ativo: ${error.message}`);
    }

    return data;
  }

  async buscarModuloPorId(id: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('modulos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Módulo não encontrado');
    }

    return data;
  }

  async criarModulo(dto: CreateModuloDto) {
    const { data: existing } = await this.supabase
      .getAdminClient()
      .from('modulos')
      .select('id')
      .eq('numero', dto.numero)
      .maybeSingle();

    if (existing) {
      throw new BadRequestException('Número do módulo já existe');
    }

    // Se estiver marcando como ciclo ativo, desativa os outros
    if (dto.is_active_cycle) {
      await this.supabase
        .getAdminClient()
        .from('modulos')
        .update({ is_active_cycle: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to target all
    }

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('modulos')
      .insert(dto)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Erro ao criar módulo: ${error.message}`);
    }

    return data;
  }

  async atualizarModulo(id: string, dto: UpdateModuloDto) {
    await this.buscarModuloPorId(id);

    if (dto.numero !== undefined) {
      const { data: existing } = await this.supabase
        .getAdminClient()
        .from('modulos')
        .select('id')
        .eq('numero', dto.numero)
        .neq('id', id)
        .maybeSingle();

      if (existing) {
        throw new BadRequestException('Número do módulo já existe para outro módulo');
      }
    }

    // Se estiver marcando como ciclo ativo, desativa os outros
    if (dto.is_active_cycle === true) {
      await this.supabase
        .getAdminClient()
        .from('modulos')
        .update({ is_active_cycle: false })
        .neq('id', id);
    }

    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) updateData[key] = value;
    }

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('modulos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Erro ao atualizar módulo: ${error.message}`);
    }

    return data;
  }

  async deletarModulo(id: string) {
    await this.buscarModuloPorId(id);

    const { error } = await this.supabase
      .getAdminClient()
      .from('modulos')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(`Erro ao deletar módulo: ${error.message}`);
    }

    return { message: 'Módulo deletado com sucesso' };
  }

  async listarLicoes(moduloId?: string) {
    let query = this.supabase
      .getAdminClient()
      .from('licoes')
      .select('*')
      .order('ordem');

    if (moduloId) {
      query = query.eq('modulo_id', moduloId);
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(`Erro ao listar lições: ${error.message}`);
    }

    return data || [];
  }

  async buscarLicaoPorId(id: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('licoes')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Lição não encontrada');
    }

    return data;
  }

  async criarLicao(dto: CreateLicaoDto) {
    await this.buscarModuloPorId(dto.modulo_id);

    const { data: existing } = await this.supabase
      .getAdminClient()
      .from('licoes')
      .select('id')
      .eq('modulo_id', dto.modulo_id)
      .eq('ordem', dto.ordem)
      .single();

    if (existing) {
      throw new BadRequestException('Já existe uma lição com esta ordem para o módulo');
    }

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('licoes')
      .insert(dto)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Erro ao criar lição: ${error.message}`);
    }

    return data;
  }

  async atualizarLicao(id: string, dto: UpdateLicaoDto) {
    const existing = await this.buscarLicaoPorId(id);

    if (dto.ordem !== undefined) {
      const { data: conflict } = await this.supabase
        .getAdminClient()
        .from('licoes')
        .select('id')
        .eq('modulo_id', existing.modulo_id)
        .eq('ordem', dto.ordem)
        .neq('id', id)
        .single();

      if (conflict) {
        throw new BadRequestException('Já existe uma lição com esta ordem para o módulo');
      }
    }

    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) updateData[key] = value;
    }

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('licoes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Erro ao atualizar lição: ${error.message}`);
    }

    return data;
  }

  async deletarLicao(id: string) {
    await this.buscarLicaoPorId(id);

    const { error } = await this.supabase
      .getAdminClient()
      .from('licoes')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(`Erro ao deletar lição: ${error.message}`);
    }

    return { message: 'Lição deletada com sucesso' };
  }
}
