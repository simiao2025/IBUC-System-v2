import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { CreateEquipePoloDto, UpdateEquipePoloDto } from './dto/equipe-polo.dto';

@Injectable()
export class EquipesPolosService {
  constructor(
    private supabase: SupabaseService,
    private usuariosService: UsuariosService,
  ) {}

  async criar(dto: CreateEquipePoloDto) {
    // 1. Resolver Usuário (Criar se não existir)
    const usuarioId = await this.resolveUsuarioId(dto);

    // 2. Criar registro em equipes_polos
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('equipes_polos')
      .insert({
        polo_id: dto.polo_id,
        usuario_id: usuarioId,
        nome: dto.nome,
        email: dto.email,
        cpf: dto.cpf,
        telefone: dto.telefone,
        cargo: dto.cargo,
        status: 'ativo',
        observacoes: dto.observacoes,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new BadRequestException('Este membro já está cadastrado neste polo.');
      }
      throw new BadRequestException(`Erro ao criar membro da equipe: ${error.message}`);
    }

    return data;
  }

  async listar(poloId?: string) {
    let query = this.supabase
      .getAdminClient()
      .from('equipes_polos')
      .select('*, polo:polos(nome, codigo)')
      .order('nome');

    if (poloId) {
      query = query.eq('polo_id', poloId);
    }

    const { data, error } = await query;
    if (error) throw new BadRequestException(error.message);
    return data;
  }

  async buscarPorId(id: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('equipes_polos')
      .select('*, polo:polos(nome, codigo)')
      .eq('id', id)
      .single();

    if (error || !data) throw new NotFoundException('Membro da equipe não encontrado');
    return data;
  }

  async atualizar(id: string, dto: UpdateEquipePoloDto) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('equipes_polos')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new BadRequestException(error.message);

    // Sincronizar status com o usuário se necessário
    if (dto.status && data.usuario_id) {
       await this.usuariosService.atualizarUsuario(data.usuario_id, {
         ativo: dto.status === 'ativo'
       });
    }

    return data;
  }

  async deletar(id: string) {
    const membro = await this.buscarPorId(id);
    
    const { error } = await this.supabase
      .getAdminClient()
      .from('equipes_polos')
      .delete()
      .eq('id', id);

    if (error) throw new BadRequestException(error.message);

    // Opcional: Deletar usuário também se for o desejo do negócio, 
    // mas seguindo o padrão da diretoria:
    if (membro.usuario_id) {
      try {
        await this.usuariosService.deletarUsuario(membro.usuario_id);
      } catch (e) {
        console.error('Erro ao deletar usuário vinculado:', e);
      }
    }

    return { message: 'Membro deletado com sucesso' };
  }

  private async resolveUsuarioId(dto: CreateEquipePoloDto): Promise<string> {
    // Tenta buscar por email primeiro
    try {
      const usuario = await this.usuariosService.buscarUsuarioPorEmail(dto.email);
      return usuario.id;
    } catch (e) {
      // Se não encontrar, cria um novo
      if (!dto.cpf) {
        throw new BadRequestException('CPF é obrigatório para criar novo usuário automaticamente');
      }

      const cpfDigits = dto.cpf.replace(/\D/g, '');
      const password = cpfDigits.substring(0, 6);

      const created = await this.usuariosService.criarUsuario({
        email: dto.email,
        nome_completo: dto.nome,
        cpf: dto.cpf,
        telefone: dto.telefone,
        role: dto.cargo,
        polo_id: dto.polo_id,
        password,
        ativo: true,
      });

      return created.id;
    }
  }
}
