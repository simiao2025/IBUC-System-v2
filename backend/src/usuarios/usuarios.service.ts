import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserAuthService } from './services/user-auth.service';
import { UserManagementService } from './services/user-management.service';
import { UserPasswordService } from './services/user-password.service';
import { UserMetaService } from './services/user-meta.service';

export interface CreateUsuarioDto {
  email: string;
  nome_completo: string;
  cpf?: string;
  telefone?: string;
  role: string;
  polo_id?: string;
  regionalPoloIds?: string[];
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
  regionalPoloIds?: string[];
  ativo?: boolean;
  metadata?: any;
  password?: string;
  password_hash?: string;
  updated_at?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginPorCpfDto {
  cpf: string;
  password: string;
}

export interface AlterarSenhaDto {
  email: string;
  senhaAtual: string;
  senhaNova: string;
}

export interface SolicitarCodigoDto {
  email: string;
}

export interface ConfirmarCodigoDto {
  email: string;
  codigo: string;
  senhaNova: string;
}

@Injectable()
export class UsuariosService {
  constructor(
    private jwtService: JwtService,
    private authService: UserAuthService,
    private managementService: UserManagementService,
    private passwordService: UserPasswordService,
    private metaService: UserMetaService,
  ) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing. Application cannot start securely.');
    }
  }

  // --- Facade Methods ---

  private stripSensitiveFields(usuario: any) {
    if (!usuario) return usuario;
    const { password_hash, ...safeUser } = usuario;
    return safeUser;
  }

  async meFromAuthHeader(authHeader?: string) {
    if (!authHeader) throw new BadRequestException('Token ausente');
    const [type, token] = authHeader.split(' ');
    if (!type || type.toLowerCase() !== 'bearer' || !token) throw new BadRequestException('Token ausente');

    try {
      const decoded = await this.jwtService.verifyAsync(token);
      const userId = decoded?.sub;
      if (!userId) throw new BadRequestException('Token inválido');

      const usuario = await this.managementService.buscarUsuarioPorId(userId);
      return this.stripSensitiveFields(usuario);
    } catch (e) {
      throw new BadRequestException('Token inválido');
    }
  }

  async criarUsuario(dto: CreateUsuarioDto) {
    const rawPassword = (dto as any)?.password;
    if (typeof rawPassword === 'string') {
      if (rawPassword.length < 6) throw new BadRequestException('Senha deve ter no mínimo 6 caracteres');
      dto.password_hash = await bcrypt.hash(rawPassword, 10);
    }
    return this.managementService.criarUsuario(dto);
  }

  async login(email: string, password: string) {
    return this.authService.login(email, password);
  }

  async loginPorCpf(cpf: string, password: string) {
    return this.authService.loginPorCpf(cpf, password);
  }

  async listarUsuarios(filtros: any) {
    return this.managementService.listarUsuarios(filtros);
  }

  async buscarUsuarioPorId(id: string) {
    return this.managementService.buscarUsuarioPorId(id);
  }

  async buscarUsuarioPorEmail(email: string) {
    return this.managementService.buscarUsuarioPorEmail(email);
  }

  async atualizarUsuario(id: string, dto: UpdateUsuarioDto) {
    const updateData: any = { updated_at: new Date().toISOString() };
    const rawPassword = (dto as any)?.password;
    if (typeof rawPassword === 'string') {
      if (rawPassword.length < 6) throw new BadRequestException('Senha deve ter no mínimo 6 caracteres');
      updateData.password_hash = await bcrypt.hash(rawPassword, 10);
    }

    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.nome_completo !== undefined) updateData.nome_completo = dto.nome_completo;
    if (dto.cpf !== undefined) updateData.cpf = dto.cpf;
    if (dto.telefone !== undefined) updateData.telefone = dto.telefone;
    if (dto.role !== undefined) updateData.role = dto.role;
    if (dto.polo_id !== undefined) updateData.polo_id = dto.polo_id || null;
    if (dto.regionalPoloIds !== undefined) updateData.regionalPoloIds = dto.regionalPoloIds;
    if (dto.ativo !== undefined) updateData.ativo = dto.ativo;
    if (dto.metadata !== undefined) updateData.metadata = dto.metadata;

    return this.managementService.atualizarUsuario(id, updateData);
  }

  async desativarUsuario(id: string) {
    return this.atualizarUsuario(id, { ativo: false });
  }

  async ativarUsuario(id: string) {
    return this.atualizarUsuario(id, { ativo: true });
  }

  async deletarUsuario(id: string) {
    return this.managementService.deletarUsuario(id);
  }

  async alterarSenha(email: string, senhaAtual: string, senhaNova: string) {
    if (senhaNova.length < 6) throw new BadRequestException('Senha deve ter no mínimo 6 caracteres');
    return this.passwordService.alterarSenha(email, senhaAtual, senhaNova);
  }

  async solicitarCodigoRecuperacaoSenha(email: string) {
    return this.passwordService.solicitarCodigoRecuperacaoSenha(email);
  }

  async confirmarCodigoRecuperacaoSenha(email: string, codigo: string, senhaNova: string) {
    return this.passwordService.confirmarCodigoRecuperacaoSenha(email, codigo, senhaNova);
  }

  async listarRoles() {
    return this.metaService.listarRoles();
  }

  async listarAccessLevels() {
    return this.metaService.listarAccessLevels();
  }
}
