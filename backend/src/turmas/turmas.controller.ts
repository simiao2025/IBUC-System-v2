import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TurmasService } from './turmas.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@ApiTags('Turmas')
@Controller('turmas')
export class TurmasController {
  constructor(private readonly service: TurmasService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar turma' })
  async criar(@Body() dto: any) {
    return this.service.criarTurma(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar turma por ID' })
  async buscarPorId(@Param('id') id: string) {
    return this.service.buscarTurmaPorId(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar turma' })
  async atualizar(@Param('id') id: string, @Body() dto: any) {
    return this.service.atualizarTurma(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar turma' })
  async deletar(@Param('id') id: string) {
    return this.service.deletarTurma(id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar turmas' })
  async listar(
    @Query('polo_id') poloId?: string,
    @Query('nivel_id') nivelId?: string,
    @Query('professor_id') professorId?: string,
    @Query('status') status?: string,
    @Query('modulo_atual_id') moduloAtualId?: string,
    @Query('ano_letivo') anoLetivo?: string,
  ) {
    const filtros: any = {};
    if (poloId) filtros.polo_id = poloId;
    if (nivelId) filtros.nivel_id = nivelId;
    if (professorId) filtros.professor_id = professorId;
    if (status) filtros.status = status;
    if (moduloAtualId) filtros.modulo_atual_id = moduloAtualId;
    if (anoLetivo) filtros.ano_letivo = parseInt(anoLetivo, 10);

    return this.service.listarTurmas(filtros);
  }


  @Get(':id/preview-transition')
  @ApiOperation({ summary: 'Visualizar prévia da transição de módulo (frequência)' })
  async previewTransicao(@Param('id') id: string) {
    return this.service.previewTransicao(id);
  }

  @Post(':id/close-module')
  @Roles('diretor_geral', 'super_admin')
  @ApiOperation({ summary: 'Encerrar módulo e avançar aprovados' })
  async encerrarModulo(
    @Param('id') id: string,
    @Body('alunos_confirmados') alunos_confirmados: string[],
    @Body('valor_cents') valor_cents?: number,
  ) {
    return this.service.encerrarModulo(id, alunos_confirmados, valor_cents);
  }

  @Post(':id/trazer-alunos')
  @ApiOperation({ summary: 'Migrar alunos aprovados do módulo anterior para esta nova turma' })
  async trazerAlunos(
    @Param('id') id: string,
    @Body('modulo_anterior_numero') moduloAnteriorNumero: number,
  ) {
    return this.service.trazerAlunos(id, moduloAnteriorNumero);
  }

  @Get(':id/occupancy')
  @ApiOperation({ summary: 'Obter ocupação atual da turma' })
  async getOccupancy(@Param('id') id: string) {
    return this.service.getOccupancy(id);
  }


}
