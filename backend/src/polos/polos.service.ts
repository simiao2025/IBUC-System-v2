import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface CreatePoloDto {
  nome: string;
  codigo: string;
  cnpj?: string;
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  telefone?: string;
  whatsapp?: string;
  email?: string;
  site?: string;
  status?: 'ativo' | 'inativo';
}

export interface UpdatePoloDto {
  nome?: string;
  codigo?: string;
  cnpj?: string;
  endereco?: any;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  site?: string;
  status?: 'ativo' | 'inativo';
}

@Injectable()
export class PolosService {
  constructor(private supabase: SupabaseService) {}

  async criarPolo(dto: CreatePoloDto) {
    // Verificar se código já existe
    const { data: existing } = await this.supabase
      .getAdminClient()
      .from('polos')
      .select('id')
      .eq('codigo', dto.codigo)
      .single();

    if (existing) {
      throw new BadRequestException('Código do polo já existe');
    }

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('polos')
      .insert({
        nome: dto.nome,
        codigo: dto.codigo,
        cnpj: dto.cnpj,
        endereco: dto.endereco,
        telefone: dto.telefone,
        whatsapp: dto.whatsapp,
        email: dto.email,
        site: dto.site,
        status: dto.status || 'ativo',
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Erro ao criar polo: ${error.message}`);
    }

    return data;
  }

  async listarPolos(ativo?: boolean) {
    let query = this.supabase
      .getAdminClient()
      .from('polos')
      .select('*')
      .order('nome');

    if (ativo !== undefined) {
      query = query.eq('status', ativo ? 'ativo' : 'inativo');
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(`Erro ao listar polos: ${error.message}`);
    }

    return data;
  }

  async buscarPoloPorId(id: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('polos')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Polo não encontrado');
    }

    return data;
  }

  async buscarPoloPorCodigo(codigo: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('polos')
      .select('*')
      .eq('codigo', codigo)
      .single();

    if (error || !data) {
      throw new NotFoundException('Polo não encontrado');
    }

    return data;
  }

  async atualizarPolo(id: string, dto: UpdatePoloDto) {
    // Verificar se polo existe
    await this.buscarPoloPorId(id);

    // Verificar se código já existe em outro polo
    if (dto.codigo) {
      const { data: existing } = await this.supabase
        .getAdminClient()
        .from('polos')
        .select('id')
        .eq('codigo', dto.codigo)
        .neq('id', id)
        .single();

      if (existing) {
        throw new BadRequestException('Código já existe para outro polo');
      }
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (dto.nome !== undefined) updateData.nome = dto.nome;
    if (dto.codigo !== undefined) updateData.codigo = dto.codigo;
    if (dto.cnpj !== undefined) updateData.cnpj = dto.cnpj;
    if (dto.endereco !== undefined) updateData.endereco = dto.endereco;
    if (dto.telefone !== undefined) updateData.telefone = dto.telefone;
    if (dto.whatsapp !== undefined) updateData.whatsapp = dto.whatsapp;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.site !== undefined) updateData.site = dto.site;
    if (dto.status !== undefined) updateData.status = dto.status;

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('polos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Erro ao atualizar polo: ${error.message}`);
    }

    return data;
  }

  async deletarPolo(id: string) {
    // Verificar se polo existe
    await this.buscarPoloPorId(id);

    const { error } = await this.supabase
      .getAdminClient()
      .from('polos')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(`Erro ao deletar polo: ${error.message}`);
    }

    return { message: 'Polo deletado com sucesso' };
  }
}

