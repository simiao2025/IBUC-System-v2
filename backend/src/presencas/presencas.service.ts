import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PresencasService {
  constructor(private supabase: SupabaseService) {}

  async lancarPresenca(dto: any) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('presencas')
      .insert(dto)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async lancarPresencasLote(presencas: any[]) {
    if (!Array.isArray(presencas) || presencas.length === 0) {
      throw new Error('Lista de presenças vazia');
    }

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('presencas')
      .insert(presencas)
      .select();

    if (error) throw new Error(error.message);
    return data;
  }

  async listarPorAluno(alunoId: string, inicio?: string, fim?: string) {
    let query = this.supabase
      .getAdminClient()
      .from('presencas')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('data');

    if (inicio) {
      query = query.gte('data', inicio);
    }
    if (fim) {
      query = query.lte('data', fim);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const registros = data || [];
    const total = registros.length;
    const presentes = registros.filter((r: any) => r.status === 'presente').length;
    const faltas = registros.filter((r: any) => r.status === 'falta').length;

    return {
      resumo: {
        total,
        presentes,
        faltas,
      },
      registros,
    };
  }

  async listarPorTurma(turmaId: string, inicio?: string, fim?: string) {
    let query = this.supabase
      .getAdminClient()
      .from('presencas')
      .select('*')
      .eq('turma_id', turmaId)
      .order('data');

    if (inicio) {
      query = query.gte('data', inicio);
    }
    if (fim) {
      query = query.lte('data', fim);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const registros = data || [];

    // Agrupa por aluno para gerar resumo por aluno
    const porAluno: Record<string, { aluno_id: string; total: number; presentes: number; faltas: number }> = {};

    registros.forEach((r: any) => {
      if (!porAluno[r.aluno_id]) {
        porAluno[r.aluno_id] = {
          aluno_id: r.aluno_id,
          total: 0,
          presentes: 0,
          faltas: 0,
        };
      }

      porAluno[r.aluno_id].total += 1;
      if (r.status === 'presente') porAluno[r.aluno_id].presentes += 1;
      if (r.status === 'falta') porAluno[r.aluno_id].faltas += 1;
    });

    return {
      turma_id: turmaId,
      resumoPorAluno: Object.values(porAluno),
      registros,
    };
  }
}






