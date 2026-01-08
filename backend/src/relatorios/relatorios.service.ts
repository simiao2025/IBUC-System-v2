import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { WorkersService } from '../workers/workers.service';

@Injectable()
export class RelatoriosService {
  constructor(
    private supabase: SupabaseService,
    private workers: WorkersService,
  ) { }

  async gerarBoletim(alunoId: string, periodo: string) {
    await this.workers.gerarBoletim(alunoId, periodo);
    return { status: 'processing' };
  }

  async historicoAluno(alunoId: string) {
    const client = this.supabase.getAdminClient();

    // 1. Dados Básicos do Aluno
    const { data: aluno, error: alunoError } = await client
      .from('alunos')
      .select('id, nome, cpf, data_nascimento, status, polo:polos(nome)')
      .eq('id', alunoId)
      .single();

    if (alunoError || !aluno) {
      throw new Error('Aluno não encontrado para gerar histórico');
    }

    // 2. Histórico de Módulos (Concluídos)
    const { data: modulosHistorico, error: histError } = await client
      .from('aluno_historico_modulos')
      .select('*, modulo_info:modulos(titulo, numero)')
      .eq('aluno_id', alunoId)
      .order('ano_conclusao', { ascending: true })
      .order('modulo_numero', { ascending: true });

    if (histError) throw new Error(`Erro ao buscar histórico de módulos: ${histError.message}`);

    // 3. Resumo de Frequência Geral (Histórica)
    const { data: todasPresencas } = await client
      .from('presencas')
      .select('status')
      .eq('aluno_id', alunoId);

    const totalAulas = todasPresencas?.length || 0;
    const presentes = todasPresencas?.filter(p => ['presente', 'atraso', 'justificativa'].includes(p.status)).length || 0;
    const frequenciaGeral = totalAulas > 0 ? Math.round((presentes / totalAulas) * 100) : 0;

    // 4. Matrícula Atual e Turmas em Curso
    const { data: matriculasAtivas } = await client
      .from('matriculas')
      .select('*, turma:turmas(id, nome, modulo:modulos(titulo, numero))')
      .eq('aluno_id', alunoId)
      .eq('status', 'ativa');

    return {
      aluno: {
        nome: aluno.nome,
        cpf: aluno.cpf,
        data_nascimento: aluno.data_nascimento,
        status: aluno.status,
        polo: (aluno as any).polo?.nome,
        frequencia_geral: frequenciaGeral,
      },
      percurso_concluido: modulosHistorico.map(h => ({
        modulo: h.modulo_info?.titulo || `Módulo ${h.modulo_numero}`,
        ano: h.ano_conclusao,
        situacao: h.situacao,
        data_registro: h.created_at
      })),
      em_curso: matriculasAtivas?.map(m => ({
        turma: m.turma?.nome,
        modulo: m.turma?.modulo?.titulo || 'N/A',
        periodo: m.periodo_letivo
      })) || [],
      data_emissao: new Date().toISOString(),
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
        const presencasPresentes = presencas.filter(p => ['presente', 'atraso', 'justificativa'].includes(p.status)).length;
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

  async relatorioDracmas(filtros: {
    aluno_id?: string;
    turma_id?: string;
    nivel_id?: string;
    polo_id?: string;
    inicio?: string;
    fim?: string;
  }) {
    try {
      const client = this.supabase.getAdminClient();

      let query = client
        .from('dracmas_transacoes')
        .select(`
          *,
          aluno:alunos!inner(nome, id),
          turma:turmas!inner(nome, id, nivel_id, polo_id)
        `);

      if (filtros.aluno_id) query = query.eq('aluno_id', filtros.aluno_id);
      if (filtros.turma_id) query = query.eq('turma_id', filtros.turma_id);
      if (filtros.nivel_id) query = query.eq('turma.nivel_id', filtros.nivel_id);
      if (filtros.polo_id) query = query.eq('turma.polo_id', filtros.polo_id);
      if (filtros.inicio) query = query.gte('data', filtros.inicio);
      if (filtros.fim) query = query.lte('data', filtros.fim);

      const { data, error } = await query.order('data', { ascending: false });

      if (error) throw error;

      // Calcular resumo
      const resumo = {
        total_dracmas: data.reduce((sum, t) => sum + (t.quantidade || 0), 0),
        total_transacoes: data.length,
        alunos_atendidos: new Set(data.map(t => t.aluno_id)).size,
      };

      return {
        transacoes: data,
        resumo,
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de drácmas:', error);
      throw error;
    }
  }

  async relatorioListaAlunos(filtros: {
    polo_id?: string;
    turma_id?: string;
    nivel_id?: string;
    status?: string;
  }) {
    try {
      const client = this.supabase.getAdminClient();

      let query = client
        .from('alunos')
        .select(`
          id,
          nome,
          cpf,
          whatsapp,
          data_nascimento,
          status,
          polo:polos(id, nome),
          matriculas:matriculas(
            id,
            status,
            turma:turmas(id, nome, nivel_id)
          )
        `);

      if (filtros.polo_id) query = query.eq('polo_id', filtros.polo_id);
      if (filtros.status) query = query.eq('status', filtros.status);

      const { data, error } = await query.order('nome');

      if (error) throw error;

      // Filtrar por turma ou nível no nível da aplicação se houver joins complexos
      // Mas para simplificar, se filtrar por turma_id, vamos olhar as matriculas.
      let result = data;

      if (filtros.turma_id || filtros.nivel_id) {
        result = data.filter((aluno: any) => {
          const hasMatchingMatricula = aluno.matriculas?.some((m: any) => {
            const matchTurma = !filtros.turma_id || m.turma?.id === filtros.turma_id;
            const matchNivel = !filtros.nivel_id || m.turma?.nivel_id === filtros.nivel_id;
            return m.status === 'ativa' && matchTurma && matchNivel;
          });
          return hasMatchingMatricula;
        });
      }

      return result;
    } catch (error) {
      console.error('Erro ao gerar lista de alunos:', error);
      throw error;
    }
  }

  async relatorioAtestadoMatricula(alunoId: string) {
    try {
      const client = this.supabase.getAdminClient();

      const { data, error } = await client
        .from('alunos')
        .select(`
          id,
          nome,
          cpf,
          rg,
          data_nascimento,
          nacionalidade,
          naturalidade,
          status,
          matriculas:matriculas(
            id,
            status,
            tipo,
            periodo_letivo,
            turma:turmas(id, nome, nivel:niveis(nome)),
            polo:polos(id, nome, codigo)
          )
        `)
        .eq('id', alunoId)
        .single();

      if (error) throw error;

      // Pegar a matrícula ativa ou a mais recente
      const matriculaAtiva = data.matriculas?.find((m: any) => m.status === 'ativa') || data.matriculas?.[0];

      return {
        aluno: {
          id: data.id,
          nome: data.nome,
          cpf: data.cpf,
          rg: data.rg,
          data_nascimento: data.data_nascimento,
          nacionalidade: data.nacionalidade,
          naturalidade: data.naturalidade,
        },
        matricula: matriculaAtiva,
        data_emissao: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Erro ao gerar atestado de matrícula:', error);
      throw error;
    }
  }

  async relatorioListaChamada(turmaId: string) {
    try {
      const client = this.supabase.getAdminClient();

      // Buscar informações da turma
      const { data: turma, error: turmaError } = await client
        .from('turmas')
        .select(`
          id,
          nome,
          horario,
          polo:polos(id, nome),
          nivel:niveis(nome)
        `)
        .eq('id', turmaId)
        .single();

      if (turmaError) throw turmaError;

      // Buscar alunos matriculados nesta turma
      const { data: matriculas, error: matriculasError } = await client
        .from('matriculas')
        .select(`
          id,
          aluno:alunos(id, nome)
        `)
        .eq('turma_id', turmaId)
        .eq('status', 'ativa')
        .order('aluno(nome)');

      if (matriculasError) throw matriculasError;

      return {
        turma,
        alunos: matriculas.map((m: any) => m.aluno),
        data_geracao: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Erro ao gerar lista de chamada:', error);
      throw error;
    }
  }

  async relatorioConsolidadoFrequencia(filtros: {
    polo_id?: string;
    turma_id?: string;
    inicio?: string;
    fim?: string;
  }) {
    try {
      const client = this.supabase.getAdminClient();

      let query = client
        .from('presencas')
        .select(`
          id,
          status,
          data,
          aluno_id,
          aluno:alunos(id, nome),
          turma:turmas(id, nome, polo_id)
        `);

      if (filtros.turma_id) query = query.eq('turma_id', filtros.turma_id);
      if (filtros.polo_id) query = query.eq('turma.polo_id', filtros.polo_id);
      if (filtros.inicio) query = query.gte('data', filtros.inicio);
      if (filtros.fim) query = query.lte('data', filtros.fim);

      const { data, error } = await query;
      if (error) throw error;

      const registros = data || [];
      const porAluno: Record<string, any> = {};

      registros.forEach((r: any) => {
        if (!porAluno[r.aluno_id]) {
          porAluno[r.aluno_id] = {
            aluno_id: r.aluno_id,
            nome: r.aluno?.nome,
            total: 0,
            presentes: 0,
            faltas: 0,
            turma: r.turma?.nome,
          };
        }

        porAluno[r.aluno_id].total += 1;
        if (['presente', 'atraso', 'justificativa'].includes(r.status)) {
          porAluno[r.aluno_id].presentes += 1;
        } else if (r.status === 'falta') {
          porAluno[r.aluno_id].faltas += 1;
        }
      });

      const lista = Object.values(porAluno).map((item: any) => ({
        ...item,
        frequencia: item.total > 0 ? Math.round((item.presentes / item.total) * 100) : 0,
      }));

      // Ordenar por nome
      lista.sort((a, b) => a.nome.localeCompare(b.nome));

      return lista;
    } catch (error) {
      console.error('Erro ao gerar consolidado de frequência:', error);
      throw error;
    }
  }

  async relatorioInadimplencia(filtros: { polo_id?: string; data_referencia?: string }) {
    try {
      const client = this.supabase.getAdminClient();
      const hoje = filtros.data_referencia || new Date().toISOString().split('T')[0];

      let query = client
        .from('mensalidades')
        .select(`
          id,
          titulo,
          valor_cents,
          vencimento,
          status,
          aluno:alunos(id, nome, whatsapp),
          polo:polos(id, nome)
        `)
        .eq('status', 'pendente')
        .lt('vencimento', hoje);

      if (filtros.polo_id) {
        query = query.eq('polo_id', filtros.polo_id);
      }

      const { data, error } = await query.order('vencimento');

      if (error) throw error;

      // Agrupar por aluno para ver o total por devedor
      const porAluno: Record<string, any> = {};

      (data || []).forEach((m: any) => {
        if (!porAluno[m.aluno.id]) {
          porAluno[m.aluno.id] = {
            aluno_id: m.aluno.id,
            nome: m.aluno.nome,
            whatsapp: m.aluno.whatsapp,
            total_atrasado_cents: 0,
            parcelas_atrasadas: 0,
            vencimento_mais_antigo: m.vencimento,
          };
        }

        porAluno[m.aluno.id].total_atrasado_cents += m.valor_cents;
        porAluno[m.aluno.id].parcelas_atrasadas += 1;
      });

      return {
        detalhado: data,
        resumoPorAluno: Object.values(porAluno).sort((a, b) => b.total_atrasado_cents - a.total_atrasado_cents),
        total_geral_cents: (data || []).reduce((sum, m) => sum + m.valor_cents, 0),
        data_referencia: hoje,
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de inadimplência:', error);
      throw error;
    }
  }
}






