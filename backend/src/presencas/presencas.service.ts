import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PresencasService {
  constructor(private supabase: SupabaseService) { }

  async lancarPresenca(dto: any) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('presencas')
      .upsert(dto, { onConflict: 'aluno_id,turma_id,data,licao_id' })
      .select()
      .single();

    if (error) throw new BadRequestException(`Erro DB: ${error.message}`);
    return data;
  }

  async lancarPresencasLote(presencas: any[]) {
    if (!Array.isArray(presencas) || presencas.length === 0) {
      throw new BadRequestException('Lista de presenças vazia');
    }

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('presencas')
      .upsert(presencas, { onConflict: 'aluno_id,turma_id,data,licao_id' })
      .select();

    if (error) throw new BadRequestException(`Erro DB Lote: ${error.message}`);
    return data;
  }

  async listarPorAluno(alunoId: string, inicio?: string, fim?: string) {
    let query = this.supabase
      .getAdminClient()
      .from('presencas')
      .select('*, licoes(titulo)')
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
      .select('*, licoes(titulo)')
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

  async calcularResumoFrequenciaTurma(turmaId: string) {
    // Busca todas as presenças da turma
    const { data: registros, error } = await this.supabase
      .getAdminClient()
      .from('presencas')
      .select('aluno_id, status, data')
      .eq('turma_id', turmaId);

    if (error) throw new Error(error.message);

    // Calcula o total de aulas dadas (datas únicas com lançamentos)
    const datasUnicas = new Set(registros.map(r => r.data));
    const totalAulas = datasUnicas.size;

    if (totalAulas === 0) return [];

    const resumo: Record<string, { aluno_id: string; total_presente: number; total_faltas: number; percentual: number }> = {};

    registros.forEach(r => {
      if (!resumo[r.aluno_id]) {
        resumo[r.aluno_id] = {
          aluno_id: r.aluno_id,
          total_presente: 0,
          total_faltas: 0,
          percentual: 0
        };
      }

      if (r.status === 'presente' || r.status === 'atraso' || r.status === 'reposicao') {
        resumo[r.aluno_id].total_presente += 1;
      } else if (r.status === 'falta') {
        resumo[r.aluno_id].total_faltas += 1;
      }
      // Justificativa e Atraso são complexos. 
      // Em muitos sistemas, Justificativa não conta como falta nem presença se diminuir o total, 
      // mas aqui o critério é >= 75%. Vamos considerar que Justificativa abona a falta (conta como presente para efeito de aprovação).
      if (r.status === 'justificativa') {
        resumo[r.aluno_id].total_presente += 1;
      }
    });

    // Calcula o percentual final para cada aluno
    return Object.values(resumo).map(aluno => ({
      ...aluno,
      percentual: Math.round((aluno.total_presente / totalAulas) * 100)
    }));
  }

  /**
   * Lista as aulas que já possuem frequencia lançada para uma turma
   */
  async listarAulasLancadas(turmaId: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('presencas')
      .select('data, licao_id, licoes(titulo)')
      .eq('turma_id', turmaId)
      .order('data', { ascending: false });

    if (error) throw new BadRequestException(`Erro ao listar aulas: ${error.message}`);

    // Agrupar por data e licao_id para identificar "sessões de aula"
    const sessoes: Record<string, any> = {};
    (data || []).forEach((p: any) => {
      const key = `${p.data}_${p.licao_id || 'null'}`;
      if (!sessoes[key]) {
        sessoes[key] = {
          data: p.data,
          licao_id: p.licao_id,
          licao_titulo: p.licoes?.titulo || 'Sem lição vinculada',
          total_alunos: 0
        };
      }
      sessoes[key].total_alunos += 1;
    });

    return Object.values(sessoes);
  }

  /**
   * Exclui todos os registros de presença de uma aula específica
   */
  async excluirAulasLote(turmaId: string, data: string, licaoId?: string) {
    let query = this.supabase
      .getAdminClient()
      .from('presencas')
      .delete()
      .eq('turma_id', turmaId)
      .eq('data', data);

    if (licaoId) {
      query = query.eq('licao_id', licaoId);
    } else {
      query = query.is('licao_id', null);
    }

    const { error } = await query;
    if (error) throw new BadRequestException(`Erro ao excluir aula: ${error.message}`);

    return { success: true };
  }

  /**
   * Lança presenças e drácmas de forma atômica utilizando RPC SQL
   */
  async lancarFrequenciaCompleta(body: {
    turma_id: string;
    data: string;
    licao_id?: string;
    registrado_por: string;
    presencas: { aluno_id: string; status: string; observacao?: string }[];
    dracmas: { aluno_id: string; quantidade: number; tipo: string; descricao?: string }[];
  }) {
    const { turma_id, data, licao_id, registrado_por, presencas, dracmas } = body;

    const { data: result, error } = await this.supabase
      .getAdminClient()
      .rpc('lancar_frequencia_completa', {
        p_turma_id: turma_id,
        p_data: data,
        p_licao_id: licao_id || null,
        p_registrado_por: registrado_por,
        p_presencas: presencas,
        p_dracmas: dracmas
      });

    if (error) {
      console.error('Erro RPC Frequência Atômica:', error);
      throw new BadRequestException(`Erro ao processar frequência atômica: ${error.message}`);
    }

    return result;
  }

  /**
   * Exclui um registro individual de presença
   */
  async excluirPresenca(id: string) {
    const { error } = await this.supabase
      .getAdminClient()
      .from('presencas')
      .delete()
      .eq('id', id);

    if (error) throw new BadRequestException(`Erro ao excluir presença: ${error.message}`);
    return { success: true };
  }
}
