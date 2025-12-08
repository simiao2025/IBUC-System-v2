import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

export interface CreateDiretoriaGeralDto {
  usuario_id?: string; // Opcional - será criado se não fornecido
  cargo: 'diretor' | 'vice_diretor' | 'coordenador' | 'vice_coordenador' | 'secretario' | 'tesoureiro';
  nome_completo: string;
  cpf?: string;
  rg?: string;
  telefone?: string;
  email: string; // Obrigatório se usuario_id não for fornecido
  data_inicio: string;
  data_fim?: string;
  observacoes?: string;
}

export interface UpdateDiretoriaGeralDto {
  cargo?: string;
  nome_completo?: string;
  cpf?: string;
  rg?: string;
  telefone?: string;
  email?: string;
  data_inicio?: string;
  data_fim?: string;
  status?: 'ativa' | 'inativa' | 'suspensa';
  observacoes?: string;
}

@Injectable()
export class DiretoriaService {
  constructor(private supabase: SupabaseService) {}

  // ========== DIRETORIA GERAL ==========

  async criarDiretoriaGeral(dto: CreateDiretoriaGeralDto) {
    // Verificar se já existe um cargo ativo do mesmo tipo
    const { data: existing } = await this.supabase
      .getAdminClient()
      .from('diretoria_geral')
      .select('id')
      .eq('cargo', dto.cargo)
      .eq('status', 'ativa')
      .single();

    if (existing) {
      throw new BadRequestException(
        `Já existe um ${this.getCargoLabel(dto.cargo)} ativo. Desative o cargo atual antes de criar um novo.`
      );
    }

    // Buscar ou criar usuário
    let usuarioId = dto.usuario_id;
    
    if (!usuarioId && dto.email) {
      // Tentar buscar usuário pelo email
      const { data: usuarioExistente } = await this.supabase
        .getAdminClient()
        .from('usuarios')
        .select('id, nome_completo, email')
        .eq('email', dto.email)
        .single();

      if (usuarioExistente) {
        usuarioId = usuarioExistente.id;
      } else {
        // Criar novo usuário se não existir
        // Mapear cargo para role
        const roleMapping: Record<string, string> = {
          diretor: 'diretor_geral',
          vice_diretor: 'diretor_geral',
          coordenador: 'coordenador_geral',
          vice_coordenador: 'coordenador_geral',
          secretario: 'admin_geral', // Secretário geral pode ter role admin_geral
          tesoureiro: 'admin_geral',
        };

        const { data: novoUsuario, error: erroUsuario } = await this.supabase
          .getAdminClient()
          .from('usuarios')
          .insert({
            email: dto.email,
            nome_completo: dto.nome_completo,
            cpf: dto.cpf,
            telefone: dto.telefone,
            role: roleMapping[dto.cargo] || 'admin_geral',
            ativo: true,
          })
          .select('id, nome_completo, email')
          .single();

        if (erroUsuario) {
          throw new BadRequestException(`Erro ao criar usuário: ${erroUsuario.message}`);
        }

        usuarioId = novoUsuario.id;
      }
    }

    if (!usuarioId) {
      throw new BadRequestException('É necessário fornecer usuario_id ou email para criar a diretoria');
    }

    // Verificar se o usuário existe (garantia)
    const { data: usuario } = await this.supabase
      .getAdminClient()
      .from('usuarios')
      .select('id, nome_completo, email')
      .eq('id', usuarioId)
      .single();

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Criar registro na diretoria_geral
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('diretoria_geral')
      .insert({
        usuario_id: usuarioId,
        cargo: dto.cargo,
        nome_completo: dto.nome_completo || usuario.nome_completo,
        cpf: dto.cpf,
        rg: dto.rg,
        telefone: dto.telefone,
        email: dto.email || usuario.email,
        data_inicio: dto.data_inicio,
        data_fim: dto.data_fim || null,
        observacoes: dto.observacoes || null,
        status: 'ativa',
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Erro ao criar diretoria: ${error.message}`);
    }

    return data;
  }

  async listarDiretoriaGeral(ativo?: boolean) {
    try {
      // 1) Busca básica da tabela diretoria_geral
      let query = this.supabase
        .getAdminClient()
        .from('diretoria_geral')
        .select('*')
        .order('data_inicio', { ascending: false });

      if (ativo !== undefined) {
        query = query.eq('status', ativo ? 'ativa' : 'inativa');
      }

      const { data: diretoria, error: diretoriaError } = await query;

      if (diretoriaError) {
        throw diretoriaError;
      }

      if (!diretoria || diretoria.length === 0) {
        return [];
      }

      // 2) Buscar usuários relacionados em uma segunda consulta
      const usuarioIds = [...new Set(diretoria.map(d => d.usuario_id).filter(Boolean))];
      let usuarios: any[] = [];

      if (usuarioIds.length > 0) {
        const { data: usuariosData, error: usuariosError } = await this.supabase
          .getAdminClient()
          .from('usuarios')
          .select('id, nome_completo, email, role')
          .in('id', usuarioIds);

        if (usuariosError) {
          console.error('Erro ao buscar usuários da diretoria:', usuariosError);
        } else {
          usuarios = usuariosData || [];
        }
      }

      const usuariosMap = new Map(usuarios.map(u => [u.id, u]));

      // 3) Combinar dados
      const diretoriaComUsuarios = diretoria.map(item => ({
        ...item,
        usuario: item.usuario_id ? usuariosMap.get(item.usuario_id) || null : null,
      }));

      return diretoriaComUsuarios;
    } catch (error: any) {
      console.error('Erro detalhado ao listar diretoria geral:', error);
      throw new BadRequestException(
        error.message || 'Erro ao listar diretoria. Por favor, tente novamente.'
      );
    }
  }

  async buscarDiretoriaGeralPorId(id: string) {
    try {
      // 1) Busca o registro da diretoria
      const { data: diretoria, error: dirError } = await this.supabase
        .getAdminClient()
        .from('diretoria_geral')
        .select('*')
        .eq('id', id)
        .single();

      if (dirError || !diretoria) {
        throw new NotFoundException('Diretoria não encontrada');
      }

      // 2) Busca o usuário relacionado, se houver
      if (diretoria.usuario_id) {
        const { data: usuario, error: usuarioError } = await this.supabase
          .getAdminClient()
          .from('usuarios')
          .select('id, nome_completo, email, role')
          .eq('id', diretoria.usuario_id)
          .single();

        if (!usuarioError && usuario) {
          return {
            ...diretoria,
            usuario,
          };
        }
      }

      return {
        ...diretoria,
        usuario: null,
      };
    } catch (error: any) {
      console.error('Erro detalhado ao buscar diretoria por ID:', error);
      throw new NotFoundException(
        error.message || 'Diretoria não encontrada'
      );
    }
  }

  async atualizarDiretoriaGeral(id: string, dto: UpdateDiretoriaGeralDto) {
    // Verificar se existe
    const existing = await this.buscarDiretoriaGeralPorId(id);

    // Se estiver ativando um cargo, verificar se já existe outro ativo do mesmo tipo
    if (dto.status === 'ativa' && existing.status !== 'ativa' && existing.cargo) {
      const { data: active } = await this.supabase
        .getAdminClient()
        .from('diretoria_geral')
        .select('id')
        .eq('cargo', existing.cargo)
        .eq('status', 'ativa')
        .neq('id', id)
        .single();

      if (active) {
        throw new BadRequestException(
          `Já existe um ${this.getCargoLabel(existing.cargo)} ativo. Desative o cargo atual antes de ativar este.`
        );
      }
    }

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('diretoria_geral')
      .update({
        ...(dto.cargo && { cargo: dto.cargo }),
        ...(dto.nome_completo && { nome_completo: dto.nome_completo }),
        ...(dto.cpf !== undefined && { cpf: dto.cpf }),
        ...(dto.rg !== undefined && { rg: dto.rg }),
        ...(dto.telefone !== undefined && { telefone: dto.telefone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.data_inicio && { data_inicio: dto.data_inicio }),
        ...(dto.data_fim !== undefined && { data_fim: dto.data_fim }),
        ...(dto.status && { status: dto.status }),
        ...(dto.observacoes !== undefined && { observacoes: dto.observacoes }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Erro ao atualizar diretoria: ${error.message}`);
    }

    return data;
  }

  async desativarDiretoriaGeral(id: string) {
    return this.atualizarDiretoriaGeral(id, { status: 'inativa' });
  }

  // ========== DIRETORIA POLO ==========

  async criarDiretoriaPolo(poloId: string, dto: CreateDiretoriaGeralDto) {
    // Verificar se o polo existe
    const { data: polo } = await this.supabase
      .getAdminClient()
      .from('polos')
      .select('id, nome')
      .eq('id', poloId)
      .single();

    if (!polo) {
      throw new NotFoundException('Polo não encontrado');
    }

    // Verificar se já existe um cargo ativo do mesmo tipo no polo
    const { data: existing } = await this.supabase
      .getAdminClient()
      .from('diretoria_polo')
      .select('id')
      .eq('polo_id', poloId)
      .eq('cargo', dto.cargo)
      .eq('status', 'ativa')
      .single();

    if (existing) {
      throw new BadRequestException(
        `Já existe um ${this.getCargoLabel(dto.cargo)} ativo neste polo. Desative o cargo atual antes de criar um novo.`
      );
    }

    // Verificar se o usuário existe
    const { data: usuario } = await this.supabase
      .getAdminClient()
      .from('usuarios')
      .select('id, nome_completo, email')
      .eq('id', dto.usuario_id)
      .single();

    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Criar registro na diretoria_polo
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('diretoria_polo')
      .insert({
        polo_id: poloId,
        usuario_id: dto.usuario_id,
        cargo: dto.cargo,
        nome_completo: dto.nome_completo || usuario.nome_completo,
        cpf: dto.cpf,
        rg: dto.rg,
        telefone: dto.telefone,
        email: dto.email || usuario.email,
        data_inicio: dto.data_inicio,
        data_fim: dto.data_fim || null,
        observacoes: dto.observacoes || null,
        status: 'ativa',
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Erro ao criar diretoria do polo: ${error.message}`);
    }

    return data;
  }

  async listarDiretoriaPolo(poloId?: string, ativo?: boolean) {
    let query = this.supabase
      .getAdminClient()
      .from('diretoria_polo')
      .select(`
        *,
        polo:polos(id, nome, codigo),
        usuario:usuarios(id, nome_completo, email, role)
      `)
      .order('data_inicio', { ascending: false });

    if (poloId) {
      query = query.eq('polo_id', poloId);
    }

    if (ativo !== undefined) {
      query = query.eq('status', ativo ? 'ativa' : 'inativa');
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(`Erro ao listar diretoria do polo: ${error.message}`);
    }

    return data;
  }

  async buscarDiretoriaPoloPorId(id: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('diretoria_polo')
      .select(`
        *,
        polo:polos(id, nome, codigo),
        usuario:usuarios(id, nome_completo, email, role)
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Diretoria do polo não encontrada');
    }

    return data;
  }

  async atualizarDiretoriaPolo(id: string, dto: UpdateDiretoriaGeralDto) {
    const existing = await this.buscarDiretoriaPoloPorId(id);

    // Se estiver ativando um cargo, verificar se já existe outro ativo do mesmo tipo no mesmo polo
    if (dto.status === 'ativa' && existing.status !== 'ativa' && existing.cargo) {
      const { data: active } = await this.supabase
        .getAdminClient()
        .from('diretoria_polo')
        .select('id')
        .eq('polo_id', existing.polo_id)
        .eq('cargo', existing.cargo)
        .eq('status', 'ativa')
        .neq('id', id)
        .single();

      if (active) {
        throw new BadRequestException(
          `Já existe um ${this.getCargoLabel(existing.cargo)} ativo neste polo. Desative o cargo atual antes de ativar este.`
        );
      }
    }

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('diretoria_polo')
      .update({
        ...(dto.cargo && { cargo: dto.cargo }),
        ...(dto.nome_completo && { nome_completo: dto.nome_completo }),
        ...(dto.cpf !== undefined && { cpf: dto.cpf }),
        ...(dto.rg !== undefined && { rg: dto.rg }),
        ...(dto.telefone !== undefined && { telefone: dto.telefone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.data_inicio && { data_inicio: dto.data_inicio }),
        ...(dto.data_fim !== undefined && { data_fim: dto.data_fim }),
        ...(dto.status && { status: dto.status }),
        ...(dto.observacoes !== undefined && { observacoes: dto.observacoes }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Erro ao atualizar diretoria do polo: ${error.message}`);
    }

    return data;
  }

  async desativarDiretoriaPolo(id: string) {
    return this.atualizarDiretoriaPolo(id, { status: 'inativa' });
  }

  // ========== HELPERS ==========

  private getCargoLabel(cargo: string): string {
    const labels: Record<string, string> = {
      diretor: 'Diretor',
      vice_diretor: 'Vice-Diretor',
      coordenador: 'Coordenador',
      vice_coordenador: 'Vice-Coordenador',
      secretario: 'Secretário',
      tesoureiro: 'Tesoureiro',
    };
    return labels[cargo] || cargo;
  }
}

