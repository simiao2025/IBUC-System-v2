import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import * as bcrypt from 'bcryptjs';
import { AlunoAggregate } from './domain/aluno.aggregate';

import { CreateAlunoDto, UpdateAlunoDto } from './dto';

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

    const aggregate = AlunoAggregate.fromCreateDto(dto);
    const persistenceData = aggregate.toDatabasePersistence();

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('alunos')
      .insert(persistenceData)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Erro ao criar aluno: ${error.message}`);
    }

    // --- CRIAÇÃO DE USUÁRIO PARA O ALUNO (Automática na matrícula direta) ---
    const client = this.supabase.getAdminClient();
    const cleanCpf = String(dto.cpf || '').replace(/\D/g, '');
    
    if (cleanCpf) {
      const { data: usuarioExistente } = await client
        .from('usuarios')
        .select('id')
        .eq('cpf', cleanCpf)
        .maybeSingle();

      let usuarioId = usuarioExistente?.id;

      if (!usuarioId) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('senha123', salt);
        
        const { data: novoUsuario, error: userError } = await client
          .from('usuarios')
          .insert({
            email: aggregate.generateUserEmail(),
            nome_completo: aggregate.nome,
            cpf: cleanCpf,
            telefone: dto.telefone_responsavel,
            role: 'aluno',
            password_hash: passwordHash,
            polo_id: dto.polo_id,
            ativo: true,
            metadata: { created_via: 'matricula_direta' }
          })
          .select('id')
          .single();

        if (!userError && novoUsuario) {
          usuarioId = novoUsuario.id;
        }
      }

      if (usuarioId) {
        await client
          .from('alunos')
          .update({ usuario_id: usuarioId })
          .eq('id', data.id);
      }
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

    const aggregate = AlunoAggregate.fromUpdateDto(dto);
    const updateData = aggregate.toDatabasePersistence();

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
}

