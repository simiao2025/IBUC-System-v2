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
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TurmasService } from './turmas.service';

@ApiTags('Turmas')
@Controller('turmas')
export class TurmasController {
  constructor(private readonly service: TurmasService) {}

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
    @Query('ano_letivo') anoLetivo?: string,
  ) {
    const filtros: any = {};
    if (poloId) filtros.polo_id = poloId;
    if (nivelId) filtros.nivel_id = nivelId;
    if (professorId) filtros.professor_id = professorId;
    if (status) filtros.status = status;
    if (anoLetivo) filtros.ano_letivo = parseInt(anoLetivo, 10);

    return this.service.listarTurmas(filtros);
  }
}
