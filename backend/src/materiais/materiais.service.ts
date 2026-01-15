import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateMaterialDto, UpdateMaterialDto } from './dto';

@Injectable()
export class MateriaisService {
  constructor(private supabase: SupabaseService) {}

  async listar() {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('materiais')
      .select('*')
      .order('nome');

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async buscarPorId(id: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('materiais')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Material não encontrado');
    return data;
  }

  async criar(dto: CreateMaterialDto) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('materiais')
      .insert({
        nome: dto.nome,
        descricao: dto.descricao,
        valor_padrao_cents: dto.valor_padrao_cents,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async atualizar(id: string, dto: UpdateMaterialDto) {
    await this.buscarPorId(id);

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('materiais')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async deletar(id: string) {
    await this.buscarPorId(id);

    const { error } = await this.supabase
      .getAdminClient()
      .from('materiais')
      .delete()
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);
    return { message: 'Material deletado com sucesso' };
  }
}
