import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePreMatriculaDto, UpdatePreMatriculaStatusDto } from './dto';

@Injectable()
export class PreMatriculasService {
  constructor(private supabase: SupabaseService) {}

  async criar(dto: CreatePreMatriculaDto) {
    const status = dto.status || 'em_analise';

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('pre_matriculas')
      .insert({
        nome_completo: dto.nome_completo,
        nome_social: dto.nome_social,
        cpf: dto.cpf,
        rg: dto.rg,
        data_nascimento: dto.data_nascimento,
        sexo: dto.sexo || 'Outro',
        naturalidade: dto.naturalidade,
        nacionalidade: dto.nacionalidade,
        email_responsavel: dto.email_responsavel,
        telefone_responsavel: dto.telefone_responsavel,
        endereco: dto.endereco || {},
        saude: dto.saude || {},
        responsaveis: dto.responsaveis || [],
        polo_id: dto.polo_id,
        nivel_id: dto.nivel_id,
        escola_origem: dto.escola_origem,
        ano_escolar: dto.ano_escolar,
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
          nome_social: preMatricula.nome_social,
          data_nascimento: preMatricula.data_nascimento,
          sexo: preMatricula.sexo || 'Outro',
          nacionalidade: preMatricula.nacionalidade || 'Brasileira',
          naturalidade: preMatricula.naturalidade,
          cpf: cpf || null,
          rg: preMatricula.rg,
          endereco: preMatricula.endereco || {},
          polo_id: preMatricula.polo_id,
          turma_id: body.turma_id,
          nivel_atual_id: turma.nivel_id,
          status: 'ativo',
          // Mapeamento de Saúde (JSONB -> Colunas Flat)
          alergias: preMatricula.saude?.alergias || '',
          medicacao_continua: preMatricula.saude?.medicamentos || '',
          convenio_medico: preMatricula.saude?.plano_saude || '',
          hospital_preferencia: preMatricula.saude?.hospital_preferencia || '',
          autorizacao_medica: preMatricula.saude?.autorizacao_medica || false,
          observacoes: preMatricula.observacoes,
        })
        .select('id')
        .single();

      if (alunoError || !alunoCriado) {
        throw new BadRequestException(`Erro ao criar aluno: ${alunoError?.message || 'erro desconhecido'}`);
      }

      alunoId = alunoCriado.id;
    }

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

    return {
      pre_matricula_id: preMatriculaId,
      aluno_id: alunoId,
      matricula: matriculaCriada,
    };
  }
}
