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
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UsuariosService, CreateUsuarioDto, UpdateUsuarioDto } from './usuarios.service';

@ApiTags('Usuários')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo usuário' })
  async criarUsuario(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.criarUsuario(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login de usuário (admin/funcional)' })
  async login(@Body() body: any) {
    const { email, password } = body || {};
    return this.usuariosService.login(email, password);
  }

  @Post('login-aluno')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login de aluno via CPF' })
  async loginAluno(@Body() body: any) {
    const { cpf, password } = body || {};
    return this.usuariosService.loginPorCpf(cpf, password);
  }

  @Post('alterar-senha')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Alterar senha do usuário' })
  async alterarSenha(@Body() body: any) {
    const { email, senhaAtual, senhaNova } = body || {};
    return this.usuariosService.alterarSenha(email, senhaAtual, senhaNova);
  }

  @Get()
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

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  async buscarUsuarioPorId(@Param('id') id: string) {
    return this.usuariosService.buscarUsuarioPorId(id);
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Buscar usuário por email' })
  async buscarUsuarioPorEmail(@Param('email') email: string) {
    return this.usuariosService.buscarUsuarioPorEmail(email);
  }

  @Put(':id')
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
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar usuário' })
  async deletarUsuario(@Param('id') id: string) {
    return this.usuariosService.deletarUsuario(id);
  }
}






