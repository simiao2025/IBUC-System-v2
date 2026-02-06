import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface CreateAlunoDto {
  nome: string;
  data_nascimento: string;
  sexo: 'M' | 'F';
  nacionalidade?: string;
  naturalidade?: string;
  cpf?: string;
  rg?: string;
  rg_orgao?: string;
  rg_data_expedicao?: string;
  certidao_numero?: string;
  endereco?: any;
  foto_url?: string;
  polo_id: string;
  turma_id?: string;
  nivel_atual_id: string;
  status?: 'pendente' | 'ativo' | 'inativo' | 'concluido';
  observacoes?: string;
  // Dados de saúde
  alergias?: string;
  restricao_alimentar?: string;
  medicacao_continua?: string;
  doencas_cronicas?: string;
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  convenio_medico?: string;
  hospital_preferencia?: string;
  autorizacao_medica?: boolean;
  observacoes_medicas?: string;
  // Dados escolares
  escola_atual?: string;
  serie?: string;
  dificuldades_aprendizagem?: boolean;
  descricao_dificuldades?: string;
  // Responsáveis
  nome_responsavel?: string;
  cpf_responsavel?: string;
  telefone_responsavel?: string;
  email_responsavel?: string;
  tipo_parentesco?: string;
  nome_responsavel_2?: string;
  cpf_responsavel_2?: string;
  telefone_responsavel_2?: string;
  email_responsavel_2?: string;
  tipo_parentesco_2?: string;
}

export interface UpdateAlunoDto {
  nome?: string;
  data_nascimento?: string;
  sexo?: 'M' | 'F';
  nacionalidade?: string;
  naturalidade?: string;
  cpf?: string;
  rg?: string;
  rg_orgao?: string;
  rg_data_expedicao?: string;
  certidao_numero?: string;
  endereco?: any;
  foto_url?: string;
  polo_id?: string;
  turma_id?: string;
  nivel_atual_id?: string;
  status?: 'pendente' | 'ativo' | 'inativo' | 'concluido';
  observacoes?: string;
  alergias?: string;
  restricao_alimentar?: string;
  medicacao_continua?: string;
  doencas_cronicas?: string;
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  convenio_medico?: string;
  hospital_preferencia?: string;
  autorizacao_medica?: boolean;
  observacoes_medicas?: string;
  escola_atual?: string;
  serie?: string;
  dificuldades_aprendizagem?: boolean;
  descricao_dificuldades?: string;
  nome_responsavel?: string;
  cpf_responsavel?: string;
  telefone_responsavel?: string;
  email_responsavel?: string;
  tipo_parentesco?: string;
  nome_responsavel_2?: string;
  cpf_responsavel_2?: string;
  telefone_responsavel_2?: string;
  email_responsavel_2?: string;
  tipo_parentesco_2?: string;
}

@Injectable()
export class AlunosService {
  constructor(private supabase: SupabaseService) { }

  async criarAluno(dto: CreateAlunoDto) {
    // Verificar se polo existe
    const { data: polo } = await this.supabase
      .getAdminClient()
      .from('polos')
      .select('id')
      .eq('id', dto.polo_id)
      .single();

    if (!polo) {
      throw new NotFoundException('Polo não encontrado');
    }

    // Verificar se nível existe
    const { data: nivel } = await this.supabase
      .getAdminClient()
      .from('niveis')
      .select('id')
      .eq('id', dto.nivel_atual_id)
      .single();

    if (!nivel) {
      throw new NotFoundException('Nível não encontrado');
    }

    // Verificar se turma existe (se fornecido)
    if (dto.turma_id) {
      const { data: turma } = await this.supabase
        .getAdminClient()
        .from('turmas')
        .select('id')
        .eq('id', dto.turma_id)
        .single();

      if (!turma) {
        throw new NotFoundException('Turma não encontrada');
      }
    }

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('alunos')
      .insert({
        nome: dto.nome,
        data_nascimento: dto.data_nascimento,
        sexo: dto.sexo,
        nacionalidade: dto.nacionalidade,
        naturalidade: dto.naturalidade,
        cpf: dto.cpf,
        rg: dto.rg,
        rg_orgao: dto.rg_orgao,
        rg_data_expedicao: dto.rg_data_expedicao,
        certidao_numero: dto.certidao_numero,
        endereco: dto.endereco,
        foto_url: dto.foto_url,
        polo_id: dto.polo_id,
        turma_id: dto.turma_id,
        nivel_atual_id: dto.nivel_atual_id,
        status: dto.status || 'pendente',
        observacoes: dto.observacoes,
        alergias: dto.alergias,
        restricao_alimentar: dto.restricao_alimentar,
        medicacao_continua: dto.medicacao_continua,
        doencas_cronicas: dto.doencas_cronicas,
        contato_emergencia_nome: dto.contato_emergencia_nome,
        contato_emergencia_telefone: dto.contato_emergencia_telefone,
        convenio_medico: dto.convenio_medico,
        hospital_preferencia: dto.hospital_preferencia,
        autorizacao_medica: dto.autorizacao_medica || false,
        autorizacao_imagem: (dto as any).autorizacao_imagem || false, // Cast as any if DTO not updated yet, or update DTO interface
        observacoes_medicas: dto.observacoes_medicas,
        escola_atual: dto.escola_atual,
        serie: dto.serie,
        dificuldades_aprendizagem: dto.dificuldades_aprendizagem || false,
        descricao_dificuldades: dto.descricao_dificuldades,
        // Guardian 1 mapping
        nome_responsavel: dto.nome_responsavel,
        cpf_responsavel: dto.cpf_responsavel,
        telefone_responsavel: dto.telefone_responsavel,
        email_responsavel: dto.email_responsavel,
        tipo_parentesco: dto.tipo_parentesco,
        // Responsable 2 mapping
        nome_responsavel_2: dto.nome_responsavel_2,
        cpf_responsavel_2: dto.cpf_responsavel_2,
        telefone_responsavel_2: dto.telefone_responsavel_2,
        email_responsavel_2: dto.email_responsavel_2,
        tipo_parentesco_2: dto.tipo_parentesco_2,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Erro ao criar aluno: ${error.message}`);
    }

    return data;
  }

  async listarAlunos(filtros?: {
    polo_id?: string;
    turma_id?: string;
    nivel_id?: string;
    status?: string;
    search?: string;
  }) {
    let query = this.supabase
      .getAdminClient()
      .from('alunos')
      .select(`
        *,
        turma:turmas!fk_turma(id, nome),
        nivel:niveis!fk_nivel(id, nome, ordem)
      `)
      .order('nome');

    if (filtros?.polo_id) {
      query = query.eq('polo_id', filtros.polo_id);
    }

    if (filtros?.turma_id) {
      query = query.eq('turma_id', filtros.turma_id);
    }

    if (filtros?.nivel_id) {
      query = query.eq('nivel_atual_id', filtros.nivel_id);
    }

    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }

    if (filtros?.search) {
      query = query.or(
        `nome.ilike.%${filtros.search}%,cpf.ilike.%${filtros.search}%,certidao_numero.ilike.%${filtros.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(`Erro ao listar alunos: ${error.message}`);
    }

    return data;
  }

  async buscarAlunoPorId(id: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('alunos')
      .select(`
        *,
        turma:turmas!fk_turma(id, nome),
        nivel:niveis!fk_nivel(id, nome, ordem)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Aluno não encontrado');
    }

    return data;
  }

  async atualizarAluno(id: string, dto: UpdateAlunoDto) {
    // Verificar se aluno existe
    await this.buscarAlunoPorId(id);

    // Verificar se turma existe (se fornecida)
    if (dto.turma_id) {
      const { data: turma } = await this.supabase
        .getAdminClient()
        .from('turmas')
        .select('id')
        .eq('id', dto.turma_id)
        .single();

      if (!turma) {
        throw new NotFoundException('Turma não encontrada');
      }
    }

    // Verificar se nível existe (se fornecido)
    if (dto.nivel_atual_id) {
      const { data: nivel } = await this.supabase
        .getAdminClient()
        .from('niveis')
        .select('id')
        .eq('id', dto.nivel_atual_id)
        .single();

      if (!nivel) {
        throw new NotFoundException('Nível não encontrado');
      }
    }

    const updateData: any = {
      data_atualizacao: new Date().toISOString(),
    };

    if (dto.nome !== undefined) updateData.nome = dto.nome;
    if (dto.data_nascimento !== undefined) updateData.data_nascimento = dto.data_nascimento;
    if (dto.sexo !== undefined) updateData.sexo = dto.sexo;
    if (dto.nacionalidade !== undefined) updateData.nacionalidade = dto.nacionalidade;
    if (dto.naturalidade !== undefined) updateData.naturalidade = dto.naturalidade;
    if (dto.cpf !== undefined) updateData.cpf = dto.cpf;
    if (dto.rg !== undefined) updateData.rg = dto.rg;
    if (dto.rg_orgao !== undefined) updateData.rg_orgao = dto.rg_orgao;
    if (dto.rg_data_expedicao !== undefined) updateData.rg_data_expedicao = dto.rg_data_expedicao;
    if (dto.certidao_numero !== undefined) updateData.certidao_numero = dto.certidao_numero;
    if (dto.endereco !== undefined) updateData.endereco = dto.endereco;
    if (dto.foto_url !== undefined) updateData.foto_url = dto.foto_url;
    if (dto.polo_id !== undefined) updateData.polo_id = dto.polo_id;
    if (dto.turma_id !== undefined) updateData.turma_id = dto.turma_id;
    if (dto.nivel_atual_id !== undefined) updateData.nivel_atual_id = dto.nivel_atual_id;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.observacoes !== undefined) updateData.observacoes = dto.observacoes;
    if (dto.alergias !== undefined) updateData.alergias = dto.alergias;
    if (dto.restricao_alimentar !== undefined) updateData.restricao_alimentar = dto.restricao_alimentar;
    if (dto.medicacao_continua !== undefined) updateData.medicacao_continua = dto.medicacao_continua;
    if (dto.doencas_cronicas !== undefined) updateData.doencas_cronicas = dto.doencas_cronicas;
    if (dto.contato_emergencia_nome !== undefined) updateData.contato_emergencia_nome = dto.contato_emergencia_nome;
    if (dto.contato_emergencia_telefone !== undefined) updateData.contato_emergencia_telefone = dto.contato_emergencia_telefone;
    if (dto.convenio_medico !== undefined) updateData.convenio_medico = dto.convenio_medico;
    if (dto.hospital_preferencia !== undefined) updateData.hospital_preferencia = dto.hospital_preferencia;
    if (dto.autorizacao_medica !== undefined) updateData.autorizacao_medica = dto.autorizacao_medica;
    if (dto.observacoes_medicas !== undefined) updateData.observacoes_medicas = dto.observacoes_medicas;
    if (dto.escola_atual !== undefined) updateData.escola_atual = dto.escola_atual;
    if (dto.serie !== undefined) updateData.serie = dto.serie;
    if (dto.dificuldades_aprendizagem !== undefined) updateData.dificuldades_aprendizagem = dto.dificuldades_aprendizagem;
    if (dto.descricao_dificuldades !== undefined) updateData.descricao_dificuldades = dto.descricao_dificuldades;
    if (dto.nome_responsavel !== undefined) updateData.nome_responsavel = dto.nome_responsavel;
    if (dto.cpf_responsavel !== undefined) updateData.cpf_responsavel = dto.cpf_responsavel;
    if (dto.telefone_responsavel !== undefined) updateData.telefone_responsavel = dto.telefone_responsavel;
    if (dto.email_responsavel !== undefined) updateData.email_responsavel = dto.email_responsavel;
    if (dto.tipo_parentesco !== undefined) updateData.tipo_parentesco = dto.tipo_parentesco;
    if (dto.nome_responsavel_2 !== undefined) updateData.nome_responsavel_2 = dto.nome_responsavel_2;
    if (dto.cpf_responsavel_2 !== undefined) updateData.cpf_responsavel_2 = dto.cpf_responsavel_2;
    if (dto.telefone_responsavel_2 !== undefined) updateData.telefone_responsavel_2 = dto.telefone_responsavel_2;
    if (dto.email_responsavel_2 !== undefined) updateData.email_responsavel_2 = dto.email_responsavel_2;
    if (dto.tipo_parentesco_2 !== undefined) updateData.tipo_parentesco_2 = dto.tipo_parentesco_2;

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('alunos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Erro ao atualizar aluno: ${error.message}`);
    }

    return data;
  }

  async deletarAluno(id: string) {
    // Verificar se aluno existe
    await this.buscarAlunoPorId(id);

    const { error } = await this.supabase
      .getAdminClient()
      .from('alunos')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(`Erro ao deletar aluno: ${error.message}`);
    }

    return { message: 'Aluno deletado com sucesso' };
  }

  async buscarHistorico(alunoId: string) {
    // Buscar histórico do aluno
    const { data: historico, error: histError } = await this.supabase
      .getAdminClient()
      .from('aluno_historico_modulos')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('modulo_numero', { ascending: true });

    if (histError) {
      throw new BadRequestException(`Erro ao buscar histórico: ${histError.message}`);
    }

    if (!historico || historico.length === 0) {
      return [];
    }

    // Buscar informações dos módulos
    const moduloNumeros = [...new Set(historico.map(h => h.modulo_numero))];
    const { data: modulos } = await this.supabase
      .getAdminClient()
      .from('modulos')
      .select('id, numero, titulo')
      .in('numero', moduloNumeros);

    // Combinar dados
    const resultado = historico.map(h => ({
      ...h,
      modulo_info: modulos?.find(m => m.numero === h.modulo_numero) || null
    }));

    return resultado;
  }

  async transferirAluno(id: string, dto: { polo_destino_id: string; motivo: string; observacoes?: string }, userId: string) {
    // 1. Buscar o aluno atual com seus dados completos
    const aluno = await this.buscarAlunoPorId(id);

    // 2. Validar que o polo de destino existe
    const { data: poloDestino, error: poloError } = await this.supabase
      .getAdminClient()
      .from('polos')
      .select('id, nome')
      .eq('id', dto.polo_destino_id)
      .single();

    if (poloError || !poloDestino) {
      throw new NotFoundException('Polo de destino não encontrado');
    }

    // 3. Validar que não está transferindo para o mesmo polo
    if (aluno.polo_id === dto.polo_destino_id) {
      throw new BadRequestException('O aluno já está neste polo');
    }

    // 4. Registrar a transferência no histórico
    const { error: transferenciaError } = await this.supabase
      .getAdminClient()
      .from('transferencias_alunos')
      .insert({
        aluno_id: id,
        polo_origem_id: aluno.polo_id,
        polo_destino_id: dto.polo_destino_id,
        turma_origem_id: aluno.turma_id,
        realizado_por: userId,
        motivo: dto.motivo,
        observacoes: dto.observacoes
      });

    if (transferenciaError) {
      throw new BadRequestException(`Erro ao registrar transferência: ${transferenciaError.message}`);
    }

    // --- NOVA LÓGICA: Criar Pré-matrícula de Transferência ---
    const { error: preMatriculaError } = await this.supabase
      .getAdminClient()
      .from('pre_matriculas')
      .insert({
        tipo: 'transferencia',
        aluno_origem_id: id,
        polo_id: dto.polo_destino_id,
        nome_completo: aluno.nome,
        cpf: aluno.cpf,
        data_nascimento: aluno.data_nascimento,
        sexo: aluno.sexo,
        nacionalidade: aluno.nacionalidade,
        naturalidade: aluno.naturalidade,
        rg: aluno.rg,
        rg_orgao: aluno.rg_orgao,
        rg_data_expedicao: aluno.rg_data_expedicao,
        endereco: aluno.endereco,
        // Health info copy
        alergias: aluno.alergias,
        restricao_alimentar: aluno.restricao_alimentar,
        medicacao_continua: aluno.medicacao_continua,
        doencas_cronicas: aluno.doencas_cronicas,
        contato_emergencia_nome: aluno.contato_emergencia_nome,
        contato_emergencia_telefone: aluno.contato_emergencia_telefone,
        convenio_medico: aluno.convenio_medico,
        hospital_preferencia: aluno.hospital_preferencia,
        autorizacao_medica: aluno.autorizacao_medica,
        // Guardians copy
        nome_responsavel: aluno.nome_responsavel,
        cpf_responsavel: aluno.cpf_responsavel,
        telefone_responsavel: aluno.telefone_responsavel,
        email_responsavel: aluno.email_responsavel,
        tipo_parentesco: aluno.tipo_parentesco,
        nome_responsavel_2: aluno.nome_responsavel_2,
        cpf_responsavel_2: aluno.cpf_responsavel_2,
        telefone_responsavel_2: aluno.telefone_responsavel_2,
        email_responsavel_2: aluno.email_responsavel_2,
        tipo_parentesco_2: aluno.tipo_parentesco_2,
        // Transfer info
        status: 'em_analise',
        observacoes: `TRANSFERÊNCIA DE POLO - Motivo: ${dto.motivo}. Obs: ${dto.observacoes || ''}`,
        // TODO: Buscar materiais pagos e popular dados_materiais
      });
    
    if (preMatriculaError) {
      console.error('Erro ao criar pré-matrícula de transferência:', preMatriculaError);
      // Não falha a transferência se a pré-matrícula falhar, mas loga erro
    }
    // --------------------------------------------------------

    // 5. Atualizar o aluno: novo polo e sem turma
    const { data: alunoAtualizado, error: updateAlunoError } = await this.supabase
      .getAdminClient()
      .from('alunos')
      .update({
        polo_id: dto.polo_destino_id,
        turma_id: null, // Aluno fica sem turma até ser alocado manualmente
        data_atualizacao: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (updateAlunoError) {
      throw new BadRequestException(`Erro ao atualizar aluno: ${updateAlunoError.message}`);
    }

    // 6. Atualizar o usuário vinculado (se existir) para refletir o novo polo no login
    if (aluno.usuario_id) {
      const { error: updateUsuarioError } = await this.supabase
        .getAdminClient()
        .from('usuarios')
        .update({
          polo_id: dto.polo_destino_id
        })
        .eq('id', aluno.usuario_id);

      if (updateUsuarioError) {
        console.error('Erro ao atualizar polo do usuário:', updateUsuarioError);
        // Não lança erro pois a transferência do aluno já foi bem-sucedida
      }
    }

    return {
      message: 'Transferência realizada com sucesso',
      aluno: alunoAtualizado,
      polo_destino: poloDestino
    };
  }

  async buscarHistoricoTransferencias(alunoId: string) {
    // Buscar histórico de transferências do aluno
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('transferencias_alunos')
      .select(`
        *,
        polo_origem:polos!fk_polo_origem(id, nome, codigo),
        polo_destino:polos!fk_polo_destino(id, nome, codigo),
        turma_origem:turmas!fk_turma_origem(id, nome),
        realizado_por_usuario:usuarios!fk_realizado_por(id, nome_completo, email)
      `)
      .eq('aluno_id', alunoId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException(`Erro ao buscar histórico de transferências: ${error.message}`);
    }

    return data || [];
  }
}

