import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';
import { WorkersService } from '../workers/workers.service';
import { CreateMatriculaDto, UpdateMatriculaDto, AprovarMatriculaDto } from './dto';

@Injectable()
export class MatriculasService {
  constructor(
    private supabase: SupabaseService,
    private notificacoes: NotificacoesService,
    private workers: WorkersService,
  ) {}

  async criarMatricula(dto: CreateMatriculaDto) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('matriculas')
      .insert({
        aluno_id: dto.aluno_id,
        turma_id: dto.turma_id,
        polo_id: dto.polo_id,
        tipo: dto.tipo,
        status: dto.status || 'pendente',
        origem: dto.origem || 'site',
        created_by: dto.created_by,
      })
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    // Se for matrícula online, enviar notificação
    if (dto.tipo === 'online') {
      await this.notificacoes.enviarNotificacaoMatricula(data.id);
      // Gerar QR code e termo PDF em background
      await this.workers.gerarTermoMatricula(data.id);
    }

    return data;
  }

  async aprovarMatricula(id: string, dto: AprovarMatriculaDto) {
    const { data: matricula, error: fetchError } = await this.supabase
      .getAdminClient()
      .from('matriculas')
      .select('*, alunos(*), polos(*)')
      .eq('id', id)
      .single();

    if (fetchError || !matricula) {
      throw new NotFoundException('Matrícula não encontrada');
    }

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('matriculas')
      .update({
        status: 'ativa',
        approved_by: dto.approved_by,
        approved_at: new Date().toISOString(),
        motivo_recusa: null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    // Atualizar status do aluno
    await this.supabase
      .getAdminClient()
      .from('alunos')
      .update({ status: 'ativo' })
      .eq('id', matricula.aluno_id);

    // Notificar responsável
    await this.notificacoes.enviarNotificacaoAprovacao(matricula.id);

    // Gerar termo PDF
    await this.workers.gerarTermoMatricula(matricula.id);

    return data;
  }

  async recusarMatricula(id: string, motivo: string, userId: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('matriculas')
      .update({
        status: 'recusada',
        motivo_recusa: motivo,
        approved_by: userId,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    await this.notificacoes.enviarNotificacaoRecusa(id, motivo);

    return data;
  }

  async buscarPorProtocolo(protocolo: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('matriculas')
      .select('*, alunos(*), polos(*), turmas(*)')
      .eq('protocolo', protocolo)
      .single();

    if (error || !data) {
      throw new NotFoundException('Matrícula não encontrada');
    }

    return data;
  }

  async listarMatriculas(poloId?: string, status?: string) {
    let query = this.supabase
      .getAdminClient()
      .from('matriculas')
      .select('*, alunos(*), polos(*), turmas(*)')
      .order('created_at', { ascending: false });

    if (poloId) query = query.eq('polo_id', poloId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) throw new BadRequestException(error.message);

    return data;
  }
}

