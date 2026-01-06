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
  constructor(private supabase: SupabaseService) {}

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
}

