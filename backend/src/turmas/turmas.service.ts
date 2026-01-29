import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ModulosService } from '../modulos/modulos.service';
import { PresencasService } from '../presencas/presencas.service';
import { MensalidadesService } from '../mensalidades/mensalidades.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

export interface TurmaItem {
  id: string;
  nome: string;
  polo_id: string;
  nivel_id: string;
  professor_id?: string | null;
  capacidade: number;
  ano_letivo: number;
  turno: 'manha' | 'tarde' | 'noite';
  status: 'ativa' | 'inativa' | 'concluida' | 'rascunho';
  modulo_atual_id?: string | null;
  dias_semana?: number[] | null;
  horario_inicio?: string | null;
  data_inicio?: string | null;
  data_previsao_termino?: string | null;
  data_conclusao?: string | null;
  migracao_concluida?: boolean;
}

@Injectable()
export class TurmasService {
  constructor(
    private supabase: SupabaseService,
    private modulosService: ModulosService,
    private presencasService: PresencasService,
    private mensalidadesService: MensalidadesService,
    private notificacoesService: NotificacoesService,
  ) { }

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
      .select('*, modulos:modulo_atual_id(titulo)')
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
    horario_inicio?: string;
    status: 'ativa' | 'inativa' | 'concluida' | 'rascunho';
    modulo_atual_id?: string | null;
    data_inicio?: string;
    data_previsao_termino?: string;
    data_conclusao?: string;
    migracao_concluida?: boolean;
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

    // Se o modulo_atual_id não for informado, busca o do ciclo ativo
    let moduloId = dto.modulo_atual_id;
    if (!moduloId) {
      const cicloAtivo = await this.modulosService.buscarCicloAtivo();
      if (cicloAtivo) {
        moduloId = cicloAtivo.id;
      }
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
        horario_inicio: dto.horario_inicio || null,
        status: dto.status || 'ativa',
        modulo_atual_id: moduloId || null,
        data_inicio: dto.data_inicio || null,
        data_previsao_termino: dto.data_previsao_termino || null,
        data_conclusao: dto.data_conclusao || null,
        migracao_concluida: dto.migracao_concluida || false,
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
      horario_inicio?: string | null;
      status?: 'ativa' | 'inativa' | 'concluida' | 'rascunho';
      modulo_atual_id?: string | null;
      data_inicio?: string | null;
      data_previsao_termino?: string | null;
      data_conclusao?: string | null;

      migracao_concluida?: boolean;
      aguardando_ativacao?: boolean;
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
    if (dto.horario_inicio !== undefined) updateData.horario_inicio = dto.horario_inicio;
    if (dto.status !== undefined) {
      updateData.status = dto.status;
      if (dto.status === 'concluida' && !dto.data_conclusao) {
        updateData.data_conclusao = new Date().toISOString().split('T')[0];
      }
    }
    if (dto.modulo_atual_id !== undefined) updateData.modulo_atual_id = dto.modulo_atual_id;
    if (dto.data_inicio !== undefined) updateData.data_inicio = dto.data_inicio;
    if (dto.data_previsao_termino !== undefined) updateData.data_previsao_termino = dto.data_previsao_termino;
    if (dto.data_conclusao !== undefined) updateData.data_conclusao = dto.data_conclusao;
    if (dto.migracao_concluida !== undefined) updateData.migracao_concluida = dto.migracao_concluida;
    if (dto.aguardando_ativacao !== undefined) updateData.aguardando_ativacao = dto.aguardando_ativacao;

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

  async listarNiveis() {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('niveis')
      .select('*')
      .order('idade_min');

    if (error) {
      throw new BadRequestException(error.message);
    }
    return data;
  }

  async listarTurmas(filtros?: {
    polo_id?: string;
    nivel_id?: string;
    professor_id?: string;
    status?: string;
    modulo_atual_id?: string;
    ano_letivo?: number;
  }) {
    let query = this.supabase
      .getAdminClient()
      .from('turmas')
      .select('*, modulos:modulo_atual_id(titulo)')
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

    if (filtros?.modulo_atual_id) {
      query = query.eq('modulo_atual_id', filtros.modulo_atual_id);
    }

    if (typeof filtros?.ano_letivo === 'number') {
      query = query.eq('ano_letivo', filtros.ano_letivo);
    }

    const { data: rawData, error } = await query;
    if (error) {
      console.error('Erro na query de listarTurmas:', error);
      throw new BadRequestException(`Erro ao buscar turmas no banco: ${error.message}`);
    }

    const data = rawData || [];

    // Para cada turma, adiciona informações de ocupação
    const turmasComOcupacao = await Promise.all(
      (data || []).map(async (turma) => {
        const { count } = await this.getOccupancy(turma.id);
        const alunosMatriculados = count || 0;
        const vagasDisponiveis = Math.max(0, turma.capacidade - alunosMatriculados);

        return {
          ...turma,
          // Normaliza o objeto modulo se vier como 'modulos' (alias) 
          modulos: turma.modulos || null,
          alunos_matriculados: alunosMatriculados,
          vagas_disponiveis: vagasDisponiveis,
        };
      })
    );

    return turmasComOcupacao;
  }

  async getOccupancy(id: string) {
    const { count, error } = await this.supabase
      .getAdminClient()
      .from('alunos')
      .select('*', { count: 'exact', head: true })
      .eq('turma_id', id)
      .eq('status', 'ativo');

    if (error) throw new BadRequestException(error.message);
    return { count: count || 0 };
  }

  async previewTransicao(turmaId: string) {
    const turma = await this.buscarTurmaPorId(turmaId);
    if (!turma.modulo_atual_id) {
      throw new BadRequestException('Turma não possui um módulo atual definido.');
    }

    const resumoFrequencia = await this.presencasService.calcularResumoFrequenciaTurma(turmaId);

    // Busca detalhes dos alunos da turma para retornar nomes etc
    const { data: alunos, error } = await this.supabase
      .getAdminClient()
      .from('alunos')
      .select('id, nome')
      .eq('turma_id', turmaId);

    if (error) throw new Error(error.message);

    // Busca total de lições do módulo atual
    const { count: totalLicoes } = await this.supabase
      .getAdminClient()
      .from('licoes')
      .select('*', { count: 'exact', head: true })
      .eq('modulo_id', turma.modulo_atual_id);

    // Calcula quantas aulas foram dadas (datas únicas com presença OU lições únicas)
    const { data: presencas } = await this.supabase
      .getAdminClient()
      .from('presencas')
      .select('data, licao_id')
      .eq('turma_id', turmaId);

    // Se temos licao_id, usamos para contar aulas distintas
    const temLicaoId = (presencas || []).some(p => p.licao_id);

    let aulasDadas = 0;
    if (temLicaoId) {
      // Conta lições únicas (não nulas)
      const licoesUnicas = new Set((presencas || []).filter(p => p.licao_id).map(p => p.licao_id)).size;
      // Se houver mistura (algumas com ID, outras sem - legado), somamos as datas das sem ID?
      // Para simplificar e evitar dupla contagem: se começou a usar licao_id, confiamos nele.
      // Mas como fallback, se licoesUnicas for muito baixo (ex: migração parcial), talvez devêssemos usar datas.
      // Decisão: Usar o MAIOR valor entre (Datas Únicas) e (Lições Únicas).
      const datasUnicas = new Set((presencas || []).map(p => p.data)).size;
      aulasDadas = Math.max(licoesUnicas, datasUnicas);
    } else {
      aulasDadas = new Set((presencas || []).map(p => p.data)).size;
    }

    const baseCalculo = Math.max(totalLicoes || 0, aulasDadas);

    return {
      modulo_titulo: (await this.modulosService.buscarModuloPorId(turma.modulo_atual_id)).titulo,
      total_licoes: totalLicoes || 0,
      aulas_dadas: aulasDadas,
      alunos: resumoFrequencia.map(rf => {
        const aluno = alunos.find(a => a.id === rf.aluno_id);
        const percentualReal = baseCalculo > 0 ? Math.round((rf.total_presente / baseCalculo) * 100) : 0;

        return {
          ...rf,
          nome: aluno?.nome || 'Desconhecido',
          frequencia: percentualReal,
          presencas: rf.total_presente,
          total_aulas: aulasDadas,
          aprovado_frequencia: percentualReal >= 75
        };
      })
    };
  }

  async encerrarModulo(turmaId: string, alunosConfirmados: string[], valorCents: number = 5000) {
    // Validar se 100% das aulas foram ministradas
    const preview = await this.previewTransicao(turmaId);
    if (!preview.total_licoes || preview.aulas_dadas < preview.total_licoes) {
      // Permitir encerramento forçado apenas para Super Admin? 
      // Por enquanto, bloqueio total conforme regra de negócio.
      throw new BadRequestException(`Não é possível encerrar o módulo: Apenas ${preview.aulas_dadas} de ${preview.total_licoes} aulas foram ministradas.`);
    }

    const turma = await this.buscarTurmaPorId(turmaId);

    // Busca o número do módulo atual para o título do histórico e cobrança
    const { data: moduloAtual } = await this.supabase
      .getAdminClient()
      .from('modulos')
      .select('id, numero, titulo')
      .eq('id', turma.modulo_atual_id)
      .maybeSingle();

    // 1. Grava histórico para alunos aprovados
    const registrosHistorico = alunosConfirmados.map(alunoId => ({
      aluno_id: alunoId,
      modulo_numero: moduloAtual?.numero || 0,
      ano_conclusao: turma.ano_letivo,
      situacao: 'aprovado'
    }));

    if (registrosHistorico.length > 0) {
      const { error: histError } = await this.supabase
        .getAdminClient()
        .from('aluno_historico_modulos')
        .upsert(registrosHistorico, { onConflict: 'aluno_id, modulo_numero' });

      if (histError) throw new Error(`Erro ao salvar histórico: ${histError.message}`);
    }

    /* 
    // 2. Gatilho Financeiro (Fase 3) - Valor definido pela Board
    // ISOLADO TEMPORARIAMENTE PARA IMPLEMENTAÇÃO MANUAL POSTERIOR
    const proximoNumero = (moduloAtual?.numero || 0) + 1;
    const { data: proximoModulo } = await this.supabase
      .getAdminClient()
      .from('modulos')
      .select('id, titulo')
      .eq('numero', proximoNumero)
      .maybeSingle();

    if (proximoModulo && alunosConfirmados.length > 0) {
      await this.mensalidadesService.gerarCobrancasMaterialAprovados(
        alunosConfirmados,
        `Material Didático (PIX) - ${proximoModulo.titulo}`,
        valorCents,
        new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0] // Vencimento mês que vem
      );
    }
    */

    // 2. Busca próximo módulo para transição (sem gerar cobrança automática agora)
    const proximoNumero = (moduloAtual?.numero || 0) + 1;
    const { data: proximoModulo } = await this.supabase
      .getAdminClient()
      .from('modulos')
      .select('id, titulo')
      .eq('numero', proximoNumero)
      .maybeSingle();


    // 3. Finaliza a turma atual (Modelo de Transição Discreta)
    await this.atualizarTurma(turmaId, { status: 'concluida' });

    // 4. Notifica Secretários do Polo (Falha não deve impedir o sucesso da operação)
    try {
      await this.notificacoesService.enviarNotificacaoEncerramentoModulo(
        turma.polo_id,
        moduloAtual?.titulo || `Módulo ${moduloAtual?.numero}`
      );
    } catch (notifError) {
      console.error('Erro ao enviar notificação de encerramento:', notifError);
      // Não lança erro para não reverter o encerramento
    }

    return {
      message: 'Módulo encerrado com sucesso. Os secretários foram notificados para criar as novas turmas.',
      alunos_processados: alunosConfirmados.length
    };
  }

  /**
   * Migra alunos aprovados de um módulo anterior para uma nova turma.
   * Observa: Polo, Nível e Aprovação no Módulo Anterior.
   */
  async trazerAlunos(turmaId: string, moduloAnteriorNumero: number) {
    const novaTurma = await this.buscarTurmaPorId(turmaId);
    const client = this.supabase.getAdminClient();

    // 1. Buscar alunos aprovados no módulo anterior que pertençam ao mesmo Polo e Nível
    const { data: aprovados, error: searchError } = await client
      .from('aluno_historico_modulos')
      .select(`
        aluno_id,
        aluno:alunos!inner(id, polo_id, nivel_atual_id)
      `)
      .eq('modulo_numero', moduloAnteriorNumero)
      .eq('situacao', 'aprovado')
      .eq('aluno.polo_id', novaTurma.polo_id)
      .eq('aluno.nivel_atual_id', novaTurma.nivel_id);

    if (searchError) throw new BadRequestException(searchError.message);

    if (!aprovados || aprovados.length === 0) {
      return { message: 'Nenhum aluno aprovado encontrado para os critérios (Polo/Nível/Módulo Anterior)', total_migrado: 0 };
    }

    const alunoIds = aprovados.map(a => a.aluno_id);

    // 2. Atualizar a turma_id dos alunos para a nova turma
    const { error: updateError } = await client
      .from('alunos')
      .update({ turma_id: turmaId })
      .in('id', alunoIds);

    if (updateError) throw new BadRequestException(updateError.message);

    return {
      message: `${alunoIds.length} alunos migrados com sucesso para a turma ${novaTurma.nome}`,
      total_migrado: alunoIds.length,
      alunos: alunoIds
    };
  }

  async criarRascunhosEmLote(turmasEncerrdasIds: string[], userId: string) {
    const rascunhosCriados = [];

    // Validar se o usuário tem permissão para essas turmas (Opcional por enquanto, confiando no controller/autonomia)
    // TODO: Implementar verificação de vínculo Polo-Coordenador se necessário

    for (const turmaId of turmasEncerrdasIds) {
      const turmaAntiga = await this.buscarTurmaPorId(turmaId);

      // Buscar módulo atual
      const { data: moduloAtual } = await this.supabase
        .getAdminClient()
        .from('modulos')
        .select('numero, titulo')
        .eq('id', turmaAntiga.modulo_atual_id)
        .single();

      let proximoNumero = (moduloAtual?.numero || 0) + 1;
      let criarRascunho = true;
      let alunosParaMigrar: string[] = [];

      // Lógica Curso Cíclico (M10 -> M1 ou Formado)
      if (proximoNumero > 10) {
        // Busca todos alunos da turma encerrada
        const { data: alunosTurma } = await this.supabase
          .getAdminClient()
          .from('alunos')
          .select('id')
          .eq('turma_id', turmaId);

        const idsAlunos = alunosTurma?.map(a => a.id) || [];
        
        for (const alunoId of idsAlunos) {
          // Verifica quantos módulos aprovados o aluno tem
          // Precisamos contar módulos distintos
          const { data: historico } = await this.supabase
            .getAdminClient()
            .from('aluno_historico_modulos')
            .select('modulo_numero')
            .eq('aluno_id', alunoId)
            .eq('situacao', 'aprovado');
          
          // Conta módulos únicos
          const modulosUnique = new Set(historico?.map(h => h.modulo_numero) || []);
          
          // Se já tem 10 módulos, formou!
          // NOTA: Assumindo que o encerramento atual JÁ gravou o histórico do M10.
          // O processo de encerramento (encerrarModulo) grava histórico antes deste passo.
          
          if (modulosUnique.size >= 10) {
             // Marca como formado
             await this.supabase
               .getAdminClient()
               .from('alunos')
               .update({ status: 'formado' }) // Requer migration 'formado'
               .eq('id', alunoId);
          } else {
             // Não completou o ciclo, volta para M1
             alunosParaMigrar.push(alunoId);
          }
        }

        if (alunosParaMigrar.length === 0) {
          criarRascunho = false; // Ninguém para migrar para M1
        } else {
          proximoNumero = 1; // Reinicia ciclo
        }

      } else {
        // Fluxo Normal (M1->M2, etc)
        // Busca alunos aprovados no módulo ATUAL (que acabou de encerrar)
        // O encerramento já deve ter gerado o histórico 'aprovado' para o moduloAtual.numero
        const { data: aprovados } = await this.supabase
          .getAdminClient()
          .from('aluno_historico_modulos')
          .select('aluno_id')
          .eq('modulo_numero', moduloAtual.numero)
          .eq('situacao', 'aprovado')
          .in('aluno_id', 
             (await this.supabase.getAdminClient()
              .from('alunos')
              .select('id')
              .eq('turma_id', turmaId)).data?.map(a => a.id) || []
          );
        
        alunosParaMigrar = aprovados?.map(a => a.aluno_id) || [];
      }

      if (!criarRascunho) continue;

      // Buscar Próximo Módulo
      const { data: proximoModulo } = await this.supabase
        .getAdminClient()
        .from('modulos')
        .select('id, titulo')
        .eq('numero', proximoNumero)
        .single();
      
      if (!proximoModulo) {
         // Fallback ou erro, se não achar módulo 1 ou N+1
         continue; 
      }

      // Preparar Nome da Nova Turma
      const nivel = await this.buscarNivelPorId(turmaAntiga.nivel_id); // Helper needed
      const numeroTurma = this.extrairNumeroTurma(turmaAntiga.nome);
      const nivelRomano = this.converterNivelParaRomano(nivel?.nome || '');
      const novoNome = `M${proximoNumero}.${numeroTurma} ${nivelRomano} ${turmaAntiga.ano_letivo}`;

      // Criar Turma Rascunho
        // Note: 'status', 'turma_origem_id', 'aguardando_ativacao' precisam existir no banco
      const { data: novaTurma, error: createError } = await this.supabase
        .getAdminClient()
        .from('turmas')
        .insert({
          nome: novoNome,
          polo_id: turmaAntiga.polo_id,
          nivel_id: turmaAntiga.nivel_id,
          professor_id: turmaAntiga.professor_id, // Copia professor
          capacidade: turmaAntiga.capacidade,
          ano_letivo: turmaAntiga.ano_letivo,
          turno: turmaAntiga.turno,
          dias_semana: turmaAntiga.dias_semana,
          horario_inicio: turmaAntiga.horario_inicio,
          modulo_atual_id: proximoModulo.id,
          status: 'rascunho',
          turma_origem_id: turmaId,
          aguardando_ativacao: true,
          data_inicio: null
        })
        .select()
        .single();
      
      if (createError) throw new BadRequestException(`Erro criar rascunho: ${createError.message}`);

      // Pré-vincular alunos
      if (alunosParaMigrar.length > 0) {
        await this.preVincularAlunos(novaTurma.id, alunosParaMigrar);
      }

      rascunhosCriados.push({
        ...novaTurma,
        total_alunos_migracao: alunosParaMigrar.length
      });
    }
    
    // Notificar Secretários (Simulação por enquanto)
    // await this.notificacoesService.notificarSecretarios(...)

    return {
      message: `${rascunhosCriados.length} turmas rascunho criadas.`,
      turmas: rascunhosCriados
    };
  }

  async ativarRascunho(turmaId: string) {
    const turma = await this.buscarTurmaPorId(turmaId);
    
    if (turma.status !== 'rascunho') {
      throw new BadRequestException('Apenas turmas rascunho podem ser ativadas');
    }
    
    // Buscar alunos pré-vinculados
    const { data: preVinculos } = await this.supabase
      .getAdminClient()
      .from('turmas_rascunho_alunos')
      .select('aluno_id')
      .eq('turma_rascunho_id', turmaId);
    
    const alunoIds = preVinculos?.map(pv => pv.aluno_id) || [];
    
    // Migrar alunos definitivamente (Update turma_id)
    if (alunoIds.length > 0) {
      const { error: moveError } = await this.supabase
        .getAdminClient()
        .from('alunos')
        .update({ turma_id: turmaId })
        .in('id', alunoIds);
      
      if (moveError) throw new BadRequestException(`Erro migrar alunos: ${moveError.message}`);
    }
    
    // Ativar turma
    // Define data_inicio como hoje se não tiver
    await this.atualizarTurma(turmaId, {
      status: 'ativa',
      aguardando_ativacao: false as any, // Cast if type definition in updateTurma doesn't support yet, strict check
      data_inicio: new Date().toISOString().split('T')[0]
    });
    
    // Limpar pré-vínculos
    await this.supabase
      .getAdminClient()
      .from('turmas_rascunho_alunos')
      .delete()
      .eq('turma_rascunho_id', turmaId);
    
    return {
      message: `Turma ativada com sucesso com ${alunoIds.length} alunos.`
    };
  }

  // --- HELPERS ---

  private async buscarNivelPorId(id: string) {
    const { data } = await this.supabase
       .getAdminClient()
       .from('niveis')
       .select('*')
       .eq('id', id)
       .single();
    return data;
  }

  private async preVincularAlunos(turmaRascunhoId: string, alunoIds: string[]) {
    if (alunoIds.length === 0) return;
    
    const records = alunoIds.map(aid => ({
      turma_rascunho_id: turmaRascunhoId,
      aluno_id: aid,
      confirmado: true 
    }));

    const { error } = await this.supabase
      .getAdminClient()
      .from('turmas_rascunho_alunos')
      .insert(records);
      
    if (error) console.error('Erro ao pré-vincular:', error);
  }

  private extrairNumeroTurma(nome: string): string {
    // Tenta achar T1, T2...
    // Ex: "M1.T2 Nível I" -> T2
    const match = nome.match(/T(\d+)/);
    if (match) return `T${match[1]}`;
    return 'T1'; // Default
  }

  private converterNivelParaRomano(nomeNivel: string): string {
    // Se o nome já vier "Nível I", extrai "I"
    // Ou mapeia se vier "Infantil"
    if (nomeNivel.includes('Nível')) {
       return nomeNivel; // Retorna "Nível I" completo como pedido no formato
    }
    // Fallback map
    const map: any = { 'Infantil': 'Nível I', 'Primários': 'Nível II', 'Juvenis': 'Nível III', 'Intermediários': 'Nível IV' };
    return map[nomeNivel] || 'Nível I';
  }
}
