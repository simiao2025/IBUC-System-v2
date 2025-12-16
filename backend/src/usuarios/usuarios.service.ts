import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

export interface CreateUsuarioDto {
  email: string;
  nome_completo: string;
  cpf?: string;
  telefone?: string;
  role: string;
  polo_id?: string;
  password?: string;
  password_hash?: string;
  ativo?: boolean;
  metadata?: any;
}

export interface UpdateUsuarioDto {
  email?: string;
  nome_completo?: string;
  cpf?: string;
  telefone?: string;
  role?: string;
  polo_id?: string;
  ativo?: boolean;
  metadata?: any;
  password?: string;
  password_hash?: string;
}

@Injectable()
export class UsuariosService {
  constructor(
    private supabase: SupabaseService,
    private jwtService: JwtService,
    private notificacoesService: NotificacoesService,
  ) {}

  private stripSensitiveFields(usuario: any) {
    if (!usuario) return usuario;
    const { password_hash, ...safeUser } = usuario;
    return safeUser;
  }

  private async signToken(usuario: any): Promise<string> {
    const payload = {
      sub: usuario.id,
      role: usuario.role,
      polo_id: usuario.polo_id || null,
    };
    return this.jwtService.signAsync(payload);
  }

  private extractBearerToken(authHeader?: string): string | null {
    if (!authHeader) return null;
    const [type, token] = authHeader.split(' ');
    if (!type || type.toLowerCase() !== 'bearer' || !token) return null;
    return token;
  }

  async meFromAuthHeader(authHeader?: string) {
    const token = this.extractBearerToken(authHeader);
    if (!token) {
      throw new BadRequestException('Token ausente');
    }

    let decoded: any;
    try {
      decoded = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'dev_secret_change_me',
      });
    } catch (e) {
      throw new BadRequestException('Token inválido');
    }

    const userId = decoded?.sub;
    if (!userId) {
      throw new BadRequestException('Token inválido');
    }

    const usuario = await this.buscarUsuarioPorId(userId);
    return this.stripSensitiveFields(usuario);
  }

  async criarUsuario(dto: CreateUsuarioDto) {
    // Verificar se email já existe
    const { data: existing } = await this.supabase
      .getAdminClient()
      .from('usuarios')
      .select('id')
      .eq('email', dto.email)
      .single();

    if (existing) {
      throw new BadRequestException('Email já cadastrado');
    }

    // Verificar se CPF já existe (se fornecido)
    if (dto.cpf) {
      const { data: existingCpf } = await this.supabase
        .getAdminClient()
        .from('usuarios')
        .select('id')
        .eq('cpf', dto.cpf)
        .single();

      if (existingCpf) {
        throw new BadRequestException('CPF já cadastrado');
      }
    }

    // Verificar se polo existe (se fornecido)
    if (dto.polo_id) {
      const { data: polo } = await this.supabase
        .getAdminClient()
        .from('polos')
        .select('id')
        .eq('id', dto.polo_id)
        .single();

      if (!polo) {
        throw new NotFoundException('Polo não encontrado');
      }
    }

    const rawPassword = (dto as any)?.password;
    if (typeof rawPassword === 'string') {
      if (rawPassword.length === 0) {
        throw new BadRequestException('Senha é obrigatória');
      }
      if (rawPassword.length > 6) {
        throw new BadRequestException('Senha deve ter no máximo 6 caracteres');
      }
    }

    const passwordHashResolved = typeof rawPassword === 'string'
      ? await bcrypt.hash(rawPassword, 10)
      : dto.password_hash;

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('usuarios')
      .insert({
        email: dto.email,
        nome_completo: dto.nome_completo,
        cpf: dto.cpf,
        telefone: dto.telefone,
        role: dto.role,
        polo_id: dto.polo_id || null,
        password_hash: passwordHashResolved,
        ativo: dto.ativo !== undefined ? dto.ativo : true,
        metadata: dto.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Erro ao criar usuário: ${error.message}`);
    }

    return data;
  }

  private async buscarUsuarioPorCpf(cpf: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('usuarios')
      .select('*')
      .eq('cpf', cpf)
      .single();

    if (error || !data) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return data;
  }

  /**
   * Login específico para aluno via CPF + senha.
   * Utiliza a mesma validação de senha do login por email.
   */
  async loginPorCpf(cpf: string, password: string) {
    let usuario: any;
    try {
      usuario = await this.buscarUsuarioPorCpf(cpf);
    } catch (e) {
      throw new BadRequestException('Credenciais inválidas');
    }

    if (!usuario.ativo) {
      throw new BadRequestException('Usuário inativo');
    }

    if (!usuario.password_hash) {
      throw new BadRequestException('Usuário sem senha configurada');
    }

    const senhaCorreta = await bcrypt.compare(password, usuario.password_hash);

    if (!senhaCorreta) {
      throw new BadRequestException('Credenciais inválidas');
    }

    const safeUser = this.stripSensitiveFields(usuario);
    const token = await this.signToken(usuario);
    return { token, user: safeUser };
  }

  /**
   * Autentica um usuário pelo email/senha usando o campo password_hash.
   * Não altera o hash, apenas faz a comparação.
   */
  async login(email: string, password: string) {
    let usuario: any;
    try {
      usuario = await this.buscarUsuarioPorEmail(email);
    } catch (e) {
      throw new BadRequestException('Credenciais inválidas');
    }

    if (!usuario.ativo) {
      throw new BadRequestException('Usuário inativo');
    }

    if (!usuario.password_hash) {
      throw new BadRequestException('Usuário sem senha configurada');
    }

    // Comparação principal usando bcrypt
    const senhaCorretaBcrypt = await bcrypt.compare(password, usuario.password_hash);

    if (!senhaCorretaBcrypt) {
      throw new BadRequestException('Credenciais inválidas');
    }

    const safeUser = this.stripSensitiveFields(usuario);
    const token = await this.signToken(usuario);
    return { token, user: safeUser };
  }

  async listarUsuarios(filtros?: {
    role?: string;
    polo_id?: string;
    ativo?: boolean;
    search?: string;
  }) {
    try {
      // Primeiro, busque os usuários com os filtros básicos
      let query = this.supabase
        .getAdminClient()
        .from('usuarios')
        .select('*')
        .order('nome_completo');

      if (filtros?.role) {
        query = query.eq('role', filtros.role);
      }

      if (filtros?.polo_id) {
        query = query.eq('polo_id', filtros.polo_id);
      }

      if (filtros?.ativo !== undefined) {
        query = query.eq('ativo', filtros.ativo);
      }

      if (filtros?.search) {
        query = query.or(
          `nome_completo.ilike.%${filtros.search}%,email.ilike.%${filtros.search}%,cpf.ilike.%${filtros.search}%`
        );
      }

      const { data: usuarios, error: usuariosError } = await query;

      if (usuariosError) {
        throw usuariosError;
      }

      // Se não houver usuários, retorne um array vazio
      if (!usuarios || usuarios.length === 0) {
        return [];
      }

      // Obtenha os IDs únicos de polos
      const poloIds = [...new Set(usuarios.map(u => u.polo_id).filter(Boolean))];
      let polos = [];

      // Busque as informações dos polos em uma única consulta
      if (poloIds.length > 0) {
        const { data: polosData, error: polosError } = await this.supabase
          .getAdminClient()
          .from('polos')
          .select('id, nome, codigo')
          .in('id', poloIds);

        if (polosError) {
          console.error('Erro ao buscar polos:', polosError);
        } else {
          polos = polosData || [];
        }
      }

      // Crie um mapa de polos para acesso rápido
      const polosMap = new Map(polos.map(polo => [polo.id, polo]));

      // Combine os dados
      const usuariosComPolos = usuarios.map(usuario => ({
        ...usuario,
        polos: usuario.polo_id ? polosMap.get(usuario.polo_id) || null : null
      }));

      return usuariosComPolos;
    } catch (error) {
      console.error('Erro detalhado ao listar usuários:', error);
      throw new BadRequestException(
        error.message || 'Erro ao listar usuários. Por favor, tente novamente.'
      );
    }
  }

  async buscarUsuarioPorId(id: string) {
    try {
      // Primeiro, busque o usuário
      const { data: usuario, error: usuarioError } = await this.supabase
        .getAdminClient()
        .from('usuarios')
        .select('*')
        .eq('id', id)
        .single();

      if (usuarioError || !usuario) {
        throw new NotFoundException('Usuário não encontrado');
      }

      // Se o usuário tiver um polo_id, busque as informações do polo
      if (usuario.polo_id) {
        const { data: polo, error: poloError } = await this.supabase
          .getAdminClient()
          .from('polos')
          .select('id, nome, codigo')
          .eq('id', usuario.polo_id)
          .single();

        if (!poloError && polo) {
          return {
            ...usuario,
            polos: polo
          };
        }
      }

      // Se não houver polo ou ocorrer algum erro, retorne o usuário sem as informações do polo
      return {
        ...usuario,
        polos: null
      };
    } catch (error) {
      console.error('Erro detalhado ao buscar usuário por ID:', error);
      throw new NotFoundException(
        error.message || 'Usuário não encontrado'
      );
    }
  }

  async buscarUsuarioPorEmail(email: string) {
    const { data, error } = await this.supabase
      .getAdminClient()
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      // Log de diagnóstico para entender por que a busca por email está falhando
      console.error('Erro ao buscar usuário por email no Supabase', {
        email,
        supabaseError: error,
      });
    }

    if (error || !data) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return data;
  }

  async atualizarUsuario(id: string, dto: UpdateUsuarioDto) {
    // Verificar se usuário existe
    await this.buscarUsuarioPorId(id);

    // Verificar se email já existe em outro usuário
    if (dto.email) {
      const { data: existing } = await this.supabase
        .getAdminClient()
        .from('usuarios')
        .select('id')
        .eq('email', dto.email)
        .neq('id', id)
        .single();

      if (existing) {
        throw new BadRequestException('Email já cadastrado para outro usuário');
      }
    }

    // Verificar se CPF já existe em outro usuário
    if (dto.cpf) {
      const { data: existingCpf } = await this.supabase
        .getAdminClient()
        .from('usuarios')
        .select('id')
        .eq('cpf', dto.cpf)
        .neq('id', id)
        .single();

      if (existingCpf) {
        throw new BadRequestException('CPF já cadastrado para outro usuário');
      }
    }

    // Verificar se polo existe (se fornecido)
    if (dto.polo_id) {
      const { data: polo } = await this.supabase
        .getAdminClient()
        .from('polos')
        .select('id')
        .eq('id', dto.polo_id)
        .single();

      if (!polo) {
        throw new NotFoundException('Polo não encontrado');
      }
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    const rawPassword = (dto as any)?.password;
    if (typeof rawPassword === 'string') {
      if (rawPassword.length === 0) {
        throw new BadRequestException('Senha inválida');
      }
      if (rawPassword.length > 6) {
        throw new BadRequestException('Senha deve ter no máximo 6 caracteres');
      }
      updateData.password_hash = await bcrypt.hash(rawPassword, 10);
    }

    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.nome_completo !== undefined) updateData.nome_completo = dto.nome_completo;
    if (dto.cpf !== undefined) updateData.cpf = dto.cpf;
    if (dto.telefone !== undefined) updateData.telefone = dto.telefone;
    if (dto.role !== undefined) updateData.role = dto.role;
    if (dto.polo_id !== undefined) updateData.polo_id = dto.polo_id;
    if (dto.ativo !== undefined) updateData.ativo = dto.ativo;
    if (dto.metadata !== undefined) updateData.metadata = dto.metadata;
    if (dto.password_hash !== undefined && updateData.password_hash === undefined) updateData.password_hash = dto.password_hash;

    const { data, error } = await this.supabase
      .getAdminClient()
      .from('usuarios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new BadRequestException(`Erro ao atualizar usuário: ${error.message}`);
    }

    return data;
  }

  async desativarUsuario(id: string) {
    return this.atualizarUsuario(id, { ativo: false });
  }

  async ativarUsuario(id: string) {
    return this.atualizarUsuario(id, { ativo: true });
  }

  async deletarUsuario(id: string) {
    // Verificar se usuário existe
    await this.buscarUsuarioPorId(id);

    const { error } = await this.supabase
      .getAdminClient()
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) {
      throw new BadRequestException(`Erro ao deletar usuário: ${error.message}`);
    }

    return { message: 'Usuário deletado com sucesso' };
  }

  async alterarSenha(email: string, senhaAtual: string, senhaNova: string) {
    let usuario: any;
    try {
      usuario = await this.buscarUsuarioPorEmail(email);
    } catch (e) {
      throw new BadRequestException('Credenciais inválidas');
    }

    if (!usuario.ativo) {
      throw new BadRequestException('Usuário inativo');
    }

    if (!usuario.password_hash) {
      throw new BadRequestException('Usuário sem senha configurada');
    }

    const senhaAtualCorreta = await bcrypt.compare(senhaAtual, usuario.password_hash);

    if (!senhaAtualCorreta) {
      throw new BadRequestException('Credenciais inválidas');
    }

    const novoHash = await bcrypt.hash(senhaNova, 10);

    const { error: updateError } = await this.supabase
      .getAdminClient()
      .from('usuarios')
      .update({ password_hash: novoHash, updated_at: new Date().toISOString() })
      .eq('id', usuario.id);

    if (updateError) {
      throw new BadRequestException(`Erro ao alterar senha: ${updateError.message}`);
    }

    return { message: 'Senha alterada com sucesso' };
  }

  async solicitarCodigoRecuperacaoSenha(email: string) {
    if (typeof email !== 'string' || email.trim().length === 0) {
      throw new BadRequestException('Email é obrigatório');
    }

    let usuario: any;
    try {
      usuario = await this.buscarUsuarioPorEmail(email);
    } catch {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (!usuario.ativo) {
      throw new BadRequestException('Usuário inativo');
    }

    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const metadata = usuario.metadata && typeof usuario.metadata === 'object' ? usuario.metadata : {};
    metadata.password_reset = {
      codigo,
      expires_at: expiresAt,
    };

    const { error } = await this.supabase
      .getAdminClient()
      .from('usuarios')
      .update({ metadata, updated_at: new Date().toISOString() })
      .eq('id', usuario.id);

    if (error) {
      throw new BadRequestException(`Erro ao solicitar recuperação: ${error.message}`);
    }

    await this.notificacoesService.enviarCodigoRecuperacaoSenha(email, codigo);
    return { message: 'Código enviado para o e-mail informado' };
  }

  async confirmarCodigoRecuperacaoSenha(email: string, codigo: string, senhaNova: string) {
    if (typeof email !== 'string' || email.trim().length === 0) {
      throw new BadRequestException('Email é obrigatório');
    }
    if (typeof codigo !== 'string' || codigo.trim().length === 0) {
      throw new BadRequestException('Código é obrigatório');
    }
    if (typeof senhaNova !== 'string' || senhaNova.trim().length === 0) {
      throw new BadRequestException('Senha nova é obrigatória');
    }
    if (senhaNova.length > 6) {
      throw new BadRequestException('Senha deve ter no máximo 6 caracteres');
    }

    let usuario: any;
    try {
      usuario = await this.buscarUsuarioPorEmail(email);
    } catch {
      throw new BadRequestException('Usuário não encontrado');
    }

    const pr = usuario?.metadata?.password_reset;
    if (!pr?.codigo || !pr?.expires_at) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    const isExpired = new Date(pr.expires_at).getTime() < Date.now();
    if (isExpired) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    if (String(pr.codigo) !== String(codigo)) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    const novoHash = await bcrypt.hash(senhaNova, 10);
    const metadata = usuario.metadata && typeof usuario.metadata === 'object' ? usuario.metadata : {};
    delete metadata.password_reset;

    const { error } = await this.supabase
      .getAdminClient()
      .from('usuarios')
      .update({ password_hash: novoHash, metadata, updated_at: new Date().toISOString() })
      .eq('id', usuario.id);

    if (error) {
      throw new BadRequestException(`Erro ao redefinir senha: ${error.message}`);
    }

    return { message: 'Senha redefinida com sucesso' };
  }

  // Métodos auxiliares para metadados (roles e access levels)
  async listarRoles() {
    // Roles disponíveis no sistema (baseado no ENUM do banco)
    return [
      { value: 'super_admin', label: 'Super Admin' },
      { value: 'admin_geral', label: 'Admin Geral' },
      { value: 'diretor_geral', label: 'Diretor Geral' },
      { value: 'coordenador_geral', label: 'Coordenador Geral' },
      { value: 'diretor_polo', label: 'Diretor de Polo' },
      { value: 'coordenador_polo', label: 'Coordenador de Polo' },
      { value: 'professor', label: 'Professor' },
      { value: 'auxiliar', label: 'Auxiliar' },
      { value: 'secretario', label: 'Secretário(a)' },
      { value: 'tesoureiro', label: 'Tesoureiro(a)' },
      { value: 'aluno', label: 'Aluno' },
      { value: 'responsavel', label: 'Responsável' },
    ];
  }

  async listarAccessLevels() {
    return [
      { value: 'geral', label: 'Acesso Geral' },
      { value: 'polo_especifico', label: 'Polo Específico' },
    ];
  }
}
