import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePreMatriculaDto, UpdatePreMatriculaStatusDto } from './dto';
import * as bcrypt from 'bcryptjs';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

@Injectable()
export class PreMatriculasService {
  constructor(
    private supabase: SupabaseService,
    private notificacoesService: NotificacoesService,
  ) {}

  async criar(dto: CreatePreMatriculaDto) {
    const status = dto.status || 'em_analise';

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('pre_matriculas')
      .insert({
        nome_completo: dto.nome_completo,
        cpf: dto.cpf,
        rg: dto.rg,
        rg_orgao: dto.rg_orgao,
        rg_data_expedicao: dto.rg_data_expedicao,
        data_nascimento: dto.data_nascimento,
        sexo: dto.sexo || 'M',
        naturalidade: dto.naturalidade,
        nacionalidade: dto.nacionalidade,
        email_responsavel: dto.email_responsavel,
        telefone_responsavel: dto.telefone_responsavel,
        nome_responsavel: dto.nome_responsavel,
        cpf_responsavel: dto.cpf_responsavel,
        tipo_parentesco: dto.tipo_parentesco,
        endereco: dto.endereco || {},
        // Health fields
        alergias: dto.alergias,
        restricao_alimentar: dto.restricao_alimentar,
        medicacao_continua: dto.medicacao_continua,
        doencas_cronicas: dto.doencas_cronicas,
        contato_emergencia_nome: dto.contato_emergencia_nome,
        contato_emergencia_telefone: dto.contato_emergencia_telefone,
        convenio_medico: dto.convenio_medico,
        hospital_preferencia: dto.hospital_preferencia,
        autorizacao_medica: dto.autorizacao_medica,
        // Responsable 2
        nome_responsavel_2: dto.nome_responsavel_2,
        cpf_responsavel_2: dto.cpf_responsavel_2,
        telefone_responsavel_2: dto.telefone_responsavel_2,
        email_responsavel_2: dto.email_responsavel_2,
        tipo_parentesco_2: dto.tipo_parentesco_2,
        polo_id: dto.polo_id,
        nivel_id: dto.nivel_id,
        escola_origem: dto.escola_origem,
        ano_escolar: dto.ano_escolar,
        observacoes: dto.observacoes,
        status,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async listar(poloId?: string, status?: string) {
    let query = this.supabase
      .getAdminClient()
      .from('pre_matriculas')
      .select('*')
      .order('created_at', { ascending: false });

    if (poloId) query = query.eq('polo_id', poloId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async atualizarStatus(id: string, dto: UpdatePreMatriculaStatusDto) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('pre_matriculas')
      .update({ status: dto.status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async atualizar(id: string, dto: any) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('pre_matriculas')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return data;
  }

  async remover(id: string) {
    const { error } = await this.supabase
      .getAdminClient()
      .from('pre_matriculas')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { success: true };
  }

  async concluir(preMatriculaId: string, body: { turma_id: string; approved_by: string }) {
    if (!body?.turma_id) {
      throw new BadRequestException('turma_id é obrigatório');
    }
    if (!body?.approved_by) {
      throw new BadRequestException('approved_by é obrigatório');
    }

    const client = this.supabase.getAdminClient();

    const { data: preMatricula, error: preError } = await client
      .from('pre_matriculas')
      .select('*')
      .eq('id', preMatriculaId)
      .single();

    if (preError || !preMatricula) {
      throw new NotFoundException('Pré-matrícula não encontrada');
    }

    if (preMatricula.status !== 'em_analise' && preMatricula.status !== 'ativo') {
      throw new BadRequestException('Pré-matrícula não está em um status que permita conclusão');
    }

    const { data: turma, error: turmaError } = await client
      .from('turmas')
      .select('id, polo_id, nivel_id')
      .eq('id', body.turma_id)
      .single();

    if (turmaError || !turma) {
      throw new NotFoundException('Turma não encontrada');
    }

    if (turma.polo_id !== preMatricula.polo_id) {
      throw new BadRequestException('Turma selecionada não pertence ao polo da pré-matrícula');
    }

    // Buscar ou criar aluno por CPF (normalizando)
    const cpf = String(preMatricula.cpf || '').replace(/\D/g, '');
    let alunoId: string | null = null;

    if (cpf) {
      const { data: alunoExistente } = await client
        .from('alunos')
        .select('id')
        .eq('cpf', cpf)
        .maybeSingle();

      if (alunoExistente?.id) {
        alunoId = alunoExistente.id;
      }
    }

    if (!alunoId) {
      const { data: alunoCriado, error: alunoError } = await client
        .from('alunos')
        .insert({
          nome: preMatricula.nome_completo,
          data_nascimento: preMatricula.data_nascimento,
          sexo: preMatricula.sexo || 'M',
          nacionalidade: preMatricula.nacionalidade || 'Brasileira',
          naturalidade: preMatricula.naturalidade,
          cpf: cpf || null,
          rg: preMatricula.rg,
          rg_orgao: preMatricula.rg_orgao,
          rg_data_expedicao: preMatricula.rg_data_expedicao,
          endereco: preMatricula.endereco || {},
          polo_id: preMatricula.polo_id,
          turma_id: body.turma_id,
          nivel_atual_id: turma.nivel_id,
          status: 'ativo',
          // Health mapping
          alergias: preMatricula.alergias || '',
          restricao_alimentar: preMatricula.restricao_alimentar || '',
          medicacao_continua: preMatricula.medicacao_continua || '',
          doencas_cronicas: preMatricula.doencas_cronicas || '',
          contato_emergencia_nome: preMatricula.contato_emergencia_nome || '',
          contato_emergencia_telefone: preMatricula.contato_emergencia_telefone || '',
          convenio_medico: preMatricula.convenio_medico || '',
          hospital_preferencia: preMatricula.hospital_preferencia || '',
          autorizacao_medica: preMatricula.autorizacao_medica || false,
          // Guardian 1 mapping
          nome_responsavel: preMatricula.nome_responsavel,
          cpf_responsavel: preMatricula.cpf_responsavel,
          telefone_responsavel: preMatricula.telefone_responsavel,
          email_responsavel: preMatricula.email_responsavel,
          tipo_parentesco: preMatricula.tipo_parentesco,
          // Responsable 2 mapping
          nome_responsavel_2: preMatricula.nome_responsavel_2,
          cpf_responsavel_2: preMatricula.cpf_responsavel_2,
          telefone_responsavel_2: preMatricula.telefone_responsavel_2,
          email_responsavel_2: preMatricula.email_responsavel_2,
          tipo_parentesco_2: preMatricula.tipo_parentesco_2,
          observacoes: preMatricula.observacoes,
        })
        .select('id')
        .single();

      if (alunoError || !alunoCriado) {
        throw new BadRequestException(`Erro ao criar aluno: ${alunoError?.message || 'erro desconhecido'}`);
      }

      alunoId = alunoCriado.id;
    }

    // --- CRIAÇÃO DE USUÁRIO PARA O ALUNO ---
    const { data: usuarioExistente } = await client
      .from('usuarios')
      .select('id')
      .eq('cpf', cpf)
      .maybeSingle();

    let usuarioId = usuarioExistente?.id;

    if (!usuarioId) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('senha123', salt);
      
      const { data: novoUsuario, error: userError } = await client
        .from('usuarios')
        .insert({
          email: `${cpf}@aluno.ibuc.sistema`,
          nome_completo: preMatricula.nome_completo,
          cpf: cpf,
          role: 'aluno',
          password_hash: passwordHash,
          polo_id: preMatricula.polo_id,
          ativo: true,
          metadata: { created_via: 'concluir_matricula' }
        })
        .select('id')
        .single();

      if (userError || !novoUsuario) {
        throw new BadRequestException(`Erro ao criar usuário do aluno: ${userError?.message || 'erro desconhecido'}`);
      }

      usuarioId = novoUsuario.id;
    }

    await client
      .from('alunos')
      .update({ usuario_id: usuarioId })
      .eq('id', alunoId);

    // Regra: aluno não pode ter 2 matrículas ativas
    const { data: matriculaAtiva } = await client
      .from('matriculas')
      .select('id')
      .eq('aluno_id', alunoId)
      .eq('status', 'ativa')
      .maybeSingle();

    if (matriculaAtiva?.id) {
      throw new BadRequestException('Aluno já possui matrícula ativa');
    }

    // Criar matrícula ativa
    const { data: matriculaCriada, error: matriculaError } = await client
      .from('matriculas')
      .insert({
        aluno_id: alunoId,
        turma_id: body.turma_id,
        polo_id: preMatricula.polo_id,
        tipo: 'online',
        status: 'ativa',
        origem: 'site',
        created_by: body.approved_by,
        approved_by: body.approved_by,
        approved_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (matriculaError || !matriculaCriada) {
      throw new BadRequestException(`Erro ao criar matrícula: ${matriculaError?.message || 'erro desconhecido'}`);
    }

    // Garantir vínculo do aluno com turma e nível
    const { error: alunoUpdateError } = await client
      .from('alunos')
      .update({
        status: 'ativo',
        turma_id: body.turma_id,
        nivel_atual_id: turma.nivel_id,
        data_atualizacao: new Date().toISOString(),
      })
      .eq('id', alunoId);

    if (alunoUpdateError) {
      throw new BadRequestException(`Erro ao atualizar aluno: ${alunoUpdateError.message}`);
    }

    // Marcar pré-matrícula como concluída
    const { error: preUpdateError } = await client
      .from('pre_matriculas')
      .update({ status: 'concluido' })
      .eq('id', preMatriculaId);

    if (preUpdateError) {
      throw new BadRequestException(`Erro ao atualizar pré-matrícula: ${preUpdateError.message}`);
    }

    // Trigger notification safely
    this.notificacoesService.enviarNotificacaoAprovacao(matriculaCriada.id)
      .catch(err => console.error('Erro ao enviar notificação de aprovação:', err));

    return {
      pre_matricula_id: preMatriculaId,
      aluno_id: alunoId,
      matricula: matriculaCriada,
    };
  }
}
