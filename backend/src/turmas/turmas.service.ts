import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ModulosService } from '../modulos/modulos.service';
import { PresencasService } from '../presencas/presencas.service';
import { MensalidadesService } from '../mensalidades/mensalidades.service';

@Injectable()
export class TurmasService {
  constructor(
    private supabase: SupabaseService,
    private modulosService: ModulosService,
    private presencasService: PresencasService,
    private mensalidadesService: MensalidadesService,
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
      .select('*')
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
    status?: 'ativa' | 'inativa' | 'concluida';
    modulo_atual_id?: string;
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
        status: dto.status || 'ativa',
        modulo_atual_id: moduloId || null,
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
      status?: 'ativa' | 'inativa' | 'concluida';
      modulo_atual_id?: string | null;
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
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.modulo_atual_id !== undefined) updateData.modulo_atual_id = dto.modulo_atual_id;

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

  async listarTurmas(filtros?: {
    polo_id?: string;
    nivel_id?: string;
    professor_id?: string;
    status?: string;
    ano_letivo?: number;
  }) {
    let query = this.supabase
      .getAdminClient()
      .from('turmas')
      .select('*, modulos!modulo_atual_id(titulo)')
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

    if (typeof filtros?.ano_letivo === 'number') {
      query = query.eq('ano_letivo', filtros.ano_letivo);
    }

    const { data, error } = await query;
    if (error) {
      throw new Error(error.message);
    }

    // Para cada turma, adiciona informações de ocupação
    const turmasComOcupacao = await Promise.all(
      (data || []).map(async (turma) => {
        const { count } = await this.getOccupancy(turma.id);
        const alunosMatriculados = count || 0;
        const vagasDisponiveis = Math.max(0, turma.capacidade - alunosMatriculados);

        return {
          ...turma,
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
        .insert(registrosHistorico);

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


    // 3. Avança a turma para o próximo módulo ou conclui a turma
    if (proximoModulo) {
      await this.atualizarTurma(turmaId, { modulo_atual_id: proximoModulo.id });
    } else {
      // Se não tem próximo módulo, a turma é concluída
      await this.atualizarTurma(turmaId, { status: 'concluida', modulo_atual_id: null });
    }

    return {
      message: 'Módulo encerrado com sucesso e cobranças geradas',
      proximo_modulo_id: proximoModulo?.id,
      alunos_processados: alunosConfirmados.length
    };
  }
}
