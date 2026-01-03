
import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CertificadosService {
  constructor(private readonly supabase: SupabaseService) {}

  async contarTotal() {
    const { count, error } = await this.supabase
      .getAdminClient()
      .from('certificados')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Erro ao contar certificados:', error);
      return { count: 0 };
    }

    return { count: count || 0 };
  }

  async listar(alunoId?: string) {
    let query = this.supabase
      .getAdminClient()
      .from('certificados')
      .select('*, aluno:alunos(nome), modulo:modulos(titulo)');

    if (alunoId) {
      query = query.eq('aluno_id', alunoId);
    }

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async gerar(dados: { aluno_id: string, modulo_id?: string, turma_id?: string, tipo: string, emitido_por?: string }) {
    // Verificar se já existe (para evitar duplicidade no mesmo módulo)
    if (dados.modulo_id && dados.tipo === 'modulo') {
      const { data: existente } = await this.supabase
        .getAdminClient()
        .from('certificados')
        .select('id')
        .eq('aluno_id', dados.aluno_id)
        .eq('modulo_id', dados.modulo_id)
        .eq('tipo', 'modulo')
        .single();

      if (existente) {
        return existente; // Já emitido, retorna o existente
      }
    }

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('certificados')
      .insert({
        aluno_id: dados.aluno_id,
        modulo_id: dados.modulo_id,
        turma_id: dados.turma_id,
        tipo: dados.tipo,
        emitido_por: dados.emitido_por
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);
    return data;
  }
}
