import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsuariosService } from '../usuarios/usuarios.service';
import {
  CreateLicaoDto,
  CreateModuloDto,
  ModulosService,
  UpdateLicaoDto,
  UpdateModuloDto,
} from './modulos.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Módulos')
@Controller()
export class ModulosController {
  constructor(
    private readonly service: ModulosService,
    private readonly usuariosService: UsuariosService,
  ) { }

  private async assertAdmin(authorization?: string) {
    const usuario = await this.usuariosService.meFromAuthHeader(authorization);
    if (['aluno', 'responsavel'].includes(usuario?.role)) {
      throw new ForbiddenException('Acesso negado');
    }
    return usuario;
  }

  private async assertCanEdit(authorization?: string) {
    const usuario = await this.assertAdmin(authorization);
    if (!['coordenador_geral', 'secretario_geral'].includes(usuario?.role)) {
      throw new ForbiddenException('Acesso restrito');
    }
    return usuario;
  }

  @Get('modulos')
  @ApiOperation({ summary: 'Listar módulos' })
  @ApiBearerAuth()
  async listarModulos() {
    return this.service.listarModulos();
  }

  @Get('modulos/ativo')
  @ApiOperation({ summary: 'Obter o módulo do ciclo ativo' })
  @ApiBearerAuth()
  async buscarCicloAtivo() {
    return this.service.buscarCicloAtivo();
  }

  @Get('modulos/:id')
  @ApiOperation({ summary: 'Buscar módulo por ID' })
  @ApiBearerAuth()
  async buscarModuloPorId(@Param('id') id: string) {
    return this.service.buscarModuloPorId(id);
  }

  @Post('modulos')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar módulo (restrito)' })
  @ApiBearerAuth()
  async criarModulo(
    @Headers('authorization') authorization: string | undefined,
    @Body() dto: CreateModuloDto,
  ) {
    await this.assertCanEdit(authorization);
    return this.service.criarModulo(dto);
  }

  @Put('modulos/:id')
  @ApiOperation({ summary: 'Atualizar módulo (restrito)' })
  @ApiBearerAuth()
  async atualizarModulo(
    @Headers('authorization') authorization: string | undefined,
    @Param('id') id: string,
    @Body() dto: UpdateModuloDto,
  ) {
    await this.assertCanEdit(authorization);
    return this.service.atualizarModulo(id, dto);
  }

  @Delete('modulos/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar módulo (restrito)' })
  @ApiBearerAuth()
  async deletarModulo(
    @Headers('authorization') authorization: string | undefined,
    @Param('id') id: string,
  ) {
    await this.assertCanEdit(authorization);
    await this.service.deletarModulo(id);
  }

  @Get('licoes')
  @ApiOperation({ summary: 'Listar lições (filtro opcional por módulo)' })
  @ApiBearerAuth()
  async listarLicoes(@Query('modulo_id') moduloId?: string) {
    return this.service.listarLicoes(moduloId);
  }

  @Get('licoes/:id')
  @ApiOperation({ summary: 'Buscar lição por ID' })
  @ApiBearerAuth()
  async buscarLicaoPorId(@Param('id') id: string) {
    return this.service.buscarLicaoPorId(id);
  }

  @Post('licoes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar lição (restrito)' })
  @ApiBearerAuth()
  async criarLicao(
    @Headers('authorization') authorization: string | undefined,
    @Body() dto: CreateLicaoDto,
  ) {
    await this.assertCanEdit(authorization);
    return this.service.criarLicao(dto);
  }

  @Put('licoes/:id')
  @ApiOperation({ summary: 'Atualizar lição (restrito)' })
  @ApiBearerAuth()
  async atualizarLicao(
    @Headers('authorization') authorization: string | undefined,
    @Param('id') id: string,
    @Body() dto: UpdateLicaoDto,
  ) {
    await this.assertCanEdit(authorization);
    return this.service.atualizarLicao(id, dto);
  }

  @Delete('licoes/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar lição (restrito)' })
  @ApiBearerAuth()
  async deletarLicao(
    @Headers('authorization') authorization: string | undefined,
    @Param('id') id: string,
  ) {
    await this.assertCanEdit(authorization);
    await this.service.deletarLicao(id);
  }
}
