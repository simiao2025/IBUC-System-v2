import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { WorkersService } from '../workers/workers.service';

@Injectable()
export class RelatoriosService {
  constructor(
    private supabase: SupabaseService,
    private workers: WorkersService,
  ) {}

  async gerarBoletim(alunoId: string, periodo: string) {
    await this.workers.gerarBoletim(alunoId, periodo);
    return { status: 'processing' };
  }

  async historicoAluno(alunoId: string, periodo?: string) {
    // Contrato inicial para o histórico do aluno.
    // No futuro, este método poderá agregar dados de boletins, notas e frequência
    // a partir das tabelas correspondentes no Supabase.

    return {
      alunoId,
      periodo: periodo || null,
      periodos: [],
    };
  }

  async estatisticasPorPolo(periodo?: string) {
    try {
      const client = this.supabase.getAdminClient();
      
      // Buscar todos os polos ativos
      const { data: polos, error: polosError } = await client
        .from('polos')
        .select('id, nome, codigo')
        .eq('status', 'ativo');

      if (polosError) throw polosError;

      const estatisticas = [];

      // Para cada polo, buscar estatísticas
      for (const polo of polos || []) {
        // Total de alunos
        const { count: totalAlunos, error: alunosError } = await client
          .from('alunos')
          .select('*', { count: 'exact', head: true })
          .eq('polo_id', polo.id);

        if (alunosError) throw alunosError;

        // Total de matrículas no período
        let matriculasQuery = client
          .from('matriculas')
          .select('*', { count: 'exact', head: true })
          .eq('polo_id', polo.id);

        if (periodo && periodo.includes('|')) {
          const [inicio, fim] = periodo.split('|');
          if (inicio && fim) {
             matriculasQuery = matriculasQuery
               .gte('created_at', inicio)
               .lte('created_at', fim);
          }
        }

        const { count: totalMatriculas, error: matriculasError } = await matriculasQuery;
        if (matriculasError) throw matriculasError;

        // Total de professores (usuários com role 'professor' vinculados ao polo)
        const { count: totalProfessores, error: professoresError } = await client
          .from('usuarios')
          .select('*', { count: 'exact', head: true })
          .eq('polo_id', polo.id)
          .eq('role', 'professor')
          .eq('ativo', true);

        if (professoresError) throw professoresError;

        // Média de frequência (simplificada - baseada em presenças recentes)
        // Precisamos buscar as turmas deste polo para filtrar as presenças
        const { data: turmasDoPolo } = await client
          .from('turmas')
          .select('id')
          .eq('polo_id', polo.id);
          
        const turmaIds = turmasDoPolo?.map(t => t.id) || [];

        let presencas: any[] = [];
        if (turmaIds.length > 0) {
           const { data: presencasData, error: presencasError } = await client
            .from('presencas')
            .select('status')
            .in('turma_id', turmaIds);

           if (presencasError) throw presencasError;
           presencas = presencasData || [];
        }

        const totalPresencas = presencas.length;
        const presencasPresentes = presencas.filter(p => p.status === 'presente').length;
        const mediaFrequencia = totalPresencas > 0 ? (presencasPresentes / totalPresencas) * 100 : 0;

        estatisticas.push({
          poloId: polo.id,
          poloNome: polo.nome,
          poloCodigo: polo.codigo,
          totalAlunos: totalAlunos || 0,
          totalMatriculas: totalMatriculas || 0,
          totalProfessores: totalProfessores || 0,
          mediaFrequencia: Math.round(mediaFrequencia * 10) / 10, // 1 casa decimal
        });
      }

      // Ordenar por nome do polo
      estatisticas.sort((a, b) => a.poloNome.localeCompare(b.poloNome));

      return {
        porPolo: estatisticas,
        resumoGeral: {
          totalPolos: estatisticas.length,
          totalAlunos: estatisticas.reduce((sum, e) => sum + e.totalAlunos, 0),
          totalMatriculas: estatisticas.reduce((sum, e) => sum + e.totalMatriculas, 0),
          totalProfessores: estatisticas.reduce((sum, e) => sum + e.totalProfessores, 0),
          mediaFrequenciaGeral: estatisticas.length > 0 
            ? Math.round((estatisticas.reduce((sum, e) => sum + e.mediaFrequencia, 0) / estatisticas.length) * 10) / 10
            : 0,
        }
      };

    } catch (error) {
      console.error('Erro ao buscar estatísticas por polo:', error);
      throw error;
    }
  }
}






