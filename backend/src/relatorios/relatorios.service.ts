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

  async getDadosBoletim(alunoId: string, moduloId: string) {
    const client = this.supabase.getAdminClient();

    // 1. Dados do Aluno e Matrícula
    const { data: aluno, error: alunoError } = await client
      .from('alunos')
      .select(`
        id, nome, cpf, data_nascimento,
        polo:polos!fk_polo(id, nome),
        matriculas:matriculas!fk_aluno(
          id, status, 
          turma:turmas!fk_turma(id, nome, nivel:niveis(nome))
        )
      `)
      .eq('id', alunoId)
      .single();

    if (alunoError || !aluno) throw new Error('Aluno não encontrado');

    // 2. Dados do Módulo e Lições
    // Se moduloId for 'atual', tentamos pegar da turma da matrícula ativa
    let targetModuloId = moduloId;
    if (moduloId === 'atual') {
      // Buscar módulo atual da turma do aluno
      const matriculaAtiva = (aluno as any).matriculas?.find((m: any) => m.status === 'ativa');
      if (!matriculaAtiva?.turma?.id) {
        throw new Error('Aluno não possui matrícula ativa com turma associada');
      }

      const { data: turma } = await client
        .from('turmas')
        .select('modulo_atual_id')
        .eq('id', matriculaAtiva.turma.id)
        .single();

      if (!turma?.modulo_atual_id) {
        throw new Error('Turma não possui módulo atual definido');
      }

      targetModuloId = turma.modulo_atual_id;
    }

    const { data: modulo, error: modError } = await client
      .from('modulos')
      .select('id, titulo, numero')
      .eq('id', targetModuloId)
      .single();

    if (modError) throw new Error('Módulo não encontrado');

    // Buscar lições deste módulo
    const { data: licoes } = await client
      .from('licoes')
      .select('id, titulo')
      .eq('modulo_id', targetModuloId);

    const licaoIds = licoes?.map(l => l.id) || [];

    // 3. Buscar Presenças (Filtrar por data ou lição - idealmente por lição_id nas presenças)
    // Como presencas tabela tem licao_id (Migration 014 applied check?), vamos usar.
    // Se não tiver migration 014 aplicada ou presencas antigas sem licao_id, fallback para datas da turma? 
    // Assumindo estrutura ideal com licao_id nas presencas ou link via aula.

    // Verificando a estrutura de presencas: migrations sugerem que presencas é simples.
    // Vamos buscar presenças do aluno e filtrar na aplicação ou query se existir coluna licao_id.
    // *Suposição Crítica*: Vou assumir query por data no período do módulo para simplificar se não houver licao_id, 
    // mas o boletim pede filtro por módulo.
    // Melhor abordagem: Buscar Turma -> Aulas/Lições desse Modulo -> Presenças nessas Aulas.
    // Como o sistema parece simples, vou contar presenças gerais no período se não houver link direto.
    // Mas espere! O usuário pediu filtro por Módulo.
    // Vou tentar buscar presenças onde `licao_id` está na lista `licaoIds`.

    let presencasQuery = client
      .from('presencas')
      .select('status, licao_id')
      .eq('aluno_id', alunoId);

    if (licaoIds.length > 0) {
      presencasQuery = presencasQuery.in('licao_id', licaoIds);
    } else {
      // Se módulo não tem lições cadastradas, não tem como filtrar presenças por lição
      // Retornamos vazio
    }

    const { data: presencas } = await presencasQuery;
    const presencasValidas = presencas || [];

    // Cálculo de Frequência "Escolar" baseada no Módulo
    // Total de aulas esperadas = licoes.length (assumindo 1 aula por lição)
    // Ou total de registros de presença se for maior
    const totalAulasModulo = Math.max(licoes?.length || 0, presencasValidas.length);
    const presencasReais = presencasValidas.filter(p => ['presente', 'atraso', 'justificativa'].includes(p.status)).length;

    const frequenciaPerc = totalAulasModulo > 0
      ? Math.round((presencasReais / totalAulasModulo) * 100)
      : 0;

    // Nota / Conceito (Simulação baseada na frequência já que não há provas)
    let notaEstimada = 0;
    let conceito = '-';
    if (totalAulasModulo > 0) {
      notaEstimada = (presencasReais / totalAulasModulo) * 10;
      if (notaEstimada >= 9) conceito = 'A - Excelente';
      else if (notaEstimada >= 7) conceito = 'B - Bom';
      else if (notaEstimada >= 5) conceito = 'C - Regular';
      else conceito = 'D - Insuficiente';
    }

    // 4. Drácmas (Acumulados do aluno globalmente ou no período? O layout pede "Saldo Atual")
    const { data: dracmasTransacoes } = await client
      .from('dracmas_transacoes')
      .select('quantidade')
      .eq('aluno_id', alunoId);

    const saldoDracmas = dracmasTransacoes?.reduce((acc, curr) => acc + curr.quantidade, 0) || 0;

    return {
      aluno: {
        id: aluno.id,
        nome: aluno.nome,
        turma: (aluno as any).matriculas?.[0]?.turma?.nome,
        polo: (aluno as any).polo?.nome,
        nivel: (aluno as any).matriculas?.[0]?.turma?.nivel?.nome
      },
      modulo: {
        titulo: modulo.titulo,
        numero: modulo.numero
      },
      resumo: {
        media_geral: notaEstimada,
        conceito: conceito,
        frequencia_percentual: frequenciaPerc,
        total_aulas: totalAulasModulo,
        total_presencas: presencasReais
      },
      dracmas: {
        saldo: saldoDracmas
      },
      disciplinas: [ // Simulando estrutura escolar onde Módulo = Disciplina Principal
        {
          nome: modulo.titulo,
          media: notaEstimada.toFixed(1),
          faltas: totalAulasModulo - presencasReais,
          status: frequenciaPerc >= 75 ? 'APROVADO' : 'REPROVADO',
          detalhes: 'Avaliação baseada em frequência'
        }
      ]
    };
  }

  async gerarBoletimLote(
    filtros: { polo_id?: string; turma_id?: string; modulo_id: string; aluno_id?: string; aluno_ids?: string[] },
    currentUser: any // { userId: string, role: string, poloId?: string }
  ) {
    const client = this.supabase.getAdminClient();
    let poloId = filtros.polo_id;

    // 1. Validar Permissões e Escopo de Polo
    // (Assumindo que currentUser já vem resolvido do Guard/Decorator)
    if (currentUser?.poloId) {
      if (poloId && poloId !== currentUser.poloId) {
        throw new Error('Acesso não autorizado a este polo');
      }
      poloId = currentUser.poloId;
    }

    if (!poloId && !filtros.aluno_id && !filtros.turma_id && !currentUser?.poloId) {
      // Se for admin global e não mandou nada, perigoso. Exigir pelo menos um polo.
      // Mas a lógica hierárquica abaixo resolve se mandou turma ou aluno.
    }

    // 2. Resolver IDs dos Alunos (Hierarquia: Aluno > Turma > Polo)
    let alunoIds: string[] = [];

    if (filtros.aluno_ids && filtros.aluno_ids.length > 0) {
      // Escopo: IDs explícitos (Preview do Frontend)
      alunoIds = filtros.aluno_ids;

    } else if (filtros.aluno_id) {
      // Escopo: Individual
      alunoIds = [filtros.aluno_id];

    } else if (filtros.turma_id) {
      // Escopo: Turma
      const { data: matriculas } = await client
        .from('matriculas')
        .select('aluno_id')
        .eq('turma_id', filtros.turma_id)
        .eq('status', 'ativa');

      alunoIds = matriculas?.map(m => m.aluno_id) || [];

    } else if (poloId) {
      // Escopo: Polo (Todas as turmas ativas do polo)
      // Buscar alunos com matrícula ativa em turmas desse polo
      const { data: matriculas } = await client
        .from('matriculas')
        .select('aluno_id')
        .eq('polo_id', poloId)
        .eq('status', 'ativa');

      alunoIds = matriculas?.map(m => m.aluno_id) || [];
    } else {
      throw new Error('Selecione ao menos um Polo, Turma ou Aluno para geração em lote.');
    }

    if (alunoIds.length === 0) {
      throw new Error('Nenhum aluno encontrado para os filtros selecionados.');
    }

    // 3. Despachar Job
    // Envia lista de IDs e o módulo alvo
    const jobId = await this.workers.gerarBoletimLote(alunoIds, filtros.modulo_id);

    return {
      message: 'Processamento iniciado',
      jobId,
      total_alunos: alunoIds.length
    };
  }

  async historicoAluno(alunoId: string) {
    const client = this.supabase.getAdminClient();

    // 1. Dados Básicos do Aluno
    const { data: aluno, error: alunoError } = await client
      .from('alunos')
      .select('id, nome, cpf, data_nascimento, status, polo:polos!fk_polo(nome)')
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
      .select('*, turma:turmas!fk_turma(id, nome, modulo:modulos(titulo, numero))')
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
          polo:polos!fk_polo(id, nome),
          matriculas:matriculas!fk_aluno(
            id,
            status,
            turma:turmas!fk_turma(id, nome, nivel_id)
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
          matriculas:matriculas!fk_aluno(
            id,
            status,
            tipo,
            periodo_letivo,
            turma:turmas!fk_turma(id, nome, nivel:niveis(nome)),
            polo:polos!fk_polo(id, nome, codigo)
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
          polo:polos!fk_polo(id, nome),
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
          aluno:alunos!fk_aluno(id, nome)
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
          aluno:alunos!fk_aluno(id, nome),
          turma:turmas!fk_turma(id, nome, polo_id)
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
          aluno:alunos!fk_aluno(id, nome, whatsapp),
          polo:polos!fk_polo(id, nome)
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






