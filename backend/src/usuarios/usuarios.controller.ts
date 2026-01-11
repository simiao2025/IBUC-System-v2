import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Headers,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  UsuariosService,
  CreateUsuarioDto,
  UpdateUsuarioDto,
  LoginDto,
  LoginPorCpfDto,
  AlterarSenhaDto,
  SolicitarCodigoDto,
  ConfirmarCodigoDto
} from './usuarios.service';

@ApiTags('Usuários')
@ApiBearerAuth()
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obter usuário autenticado via JWT' })
  async me(@Headers('authorization') authorization?: string) {
    return this.usuariosService.meFromAuthHeader(authorization);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo usuário' })
  async criarUsuario(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.criarUsuario(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login de usuário (admin/funcional)' })
  async login(@Body() dto: LoginDto) {
    return this.usuariosService.login(dto.email, dto.password);
  }

  @Post('login-aluno')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login de aluno via CPF' })
  async loginAluno(@Body() dto: LoginPorCpfDto) {
    return this.usuariosService.loginPorCpf(dto.cpf, dto.password);
  }

  @Post('alterar-senha')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Alterar senha do usuário' })
  async alterarSenha(@Body() dto: AlterarSenhaDto) {
    return this.usuariosService.alterarSenha(dto.email, dto.senhaAtual, dto.senhaNova);
  }

  @Post('recuperar-senha/solicitar-codigo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar código de recuperação de senha via e-mail' })
  async solicitarCodigoRecuperacaoSenha(@Body() dto: SolicitarCodigoDto) {
    return this.usuariosService.solicitarCodigoRecuperacaoSenha(dto.email);
  }

  @Post('recuperar-senha/confirmar-codigo')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmar código e redefinir senha via e-mail' })
  async confirmarCodigoRecuperacaoSenha(@Body() dto: ConfirmarCodigoDto) {
    return this.usuariosService.confirmarCodigoRecuperacaoSenha(dto.email, dto.codigo, dto.senhaNova);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar usuários' })
  async listarUsuarios(
    @Query('role') role?: string,
    @Query('polo_id') poloId?: string,
    @Query('ativo') ativo?: string,
    @Query('search') search?: string,
  ) {
    const filtros: any = {};
    if (role) filtros.role = role;
    if (poloId) filtros.polo_id = poloId;
    if (ativo !== undefined) filtros.ativo = ativo === 'true';
    if (search) filtros.search = search;

    return this.usuariosService.listarUsuarios(filtros);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Buscar usuário por email' })
  async buscarUsuarioPorEmail(@Param('email') email: string) {
    try {
      return await this.usuariosService.buscarUsuarioPorEmail(email);
    } catch (e) {
      if (e instanceof NotFoundException) {
        return null;
      }
      throw e;
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  async buscarUsuarioPorId(@Param('id') id: string) {
    return this.usuariosService.buscarUsuarioPorId(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar usuário' })
  async atualizarUsuario(
    @Param('id') id: string,
    @Body() dto: UpdateUsuarioDto
  ) {
    return this.usuariosService.atualizarUsuario(id, dto);
  }

  @Put(':id/ativar')
  @ApiOperation({ summary: 'Ativar usuário' })
  async ativarUsuario(@Param('id') id: string) {
    return this.usuariosService.ativarUsuario(id);
  }

  @Put(':id/desativar')
  @ApiOperation({ summary: 'Desativar usuário' })
  async desativarUsuario(@Param('id') id: string) {
    return this.usuariosService.desativarUsuario(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar usuário' })
  async deletarUsuario(@Param('id') id: string) {
    return this.usuariosService.deletarUsuario(id);
  }

  @Get('meta/roles')
  @ApiOperation({ summary: 'Listar funções (roles) disponíveis' })
  async listarRoles() {
    return this.usuariosService.listarRoles();
  }

  @Get('meta/access-levels')
  @ApiOperation({ summary: 'Listar níveis de acesso disponíveis' })
  async listarAccessLevels() {
    return this.usuariosService.listarAccessLevels();
  }
}






