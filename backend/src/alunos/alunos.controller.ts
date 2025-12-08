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
import { AlunosService, CreateAlunoDto, UpdateAlunoDto } from './alunos.service';

@ApiTags('Alunos')
@Controller('alunos')
export class AlunosController {
  constructor(private readonly service: AlunosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo aluno' })
  async criar(@Body() dto: CreateAlunoDto) {
    return this.service.criarAluno(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar alunos' })
  async listar(
    @Query('polo_id') poloId?: string,
    @Query('turma_id') turmaId?: string,
    @Query('nivel_id') nivelId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const filtros: any = {};
    if (poloId) filtros.polo_id = poloId;
    if (turmaId) filtros.turma_id = turmaId;
    if (nivelId) filtros.nivel_id = nivelId;
    if (status) filtros.status = status;
    if (search) filtros.search = search;

    return this.service.listarAlunos(filtros);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar aluno por ID' })
  async buscarPorId(@Param('id') id: string) {
    return this.service.buscarAlunoPorId(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar aluno' })
  async atualizar(@Param('id') id: string, @Body() dto: UpdateAlunoDto) {
    return this.service.atualizarAluno(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar aluno' })
  async deletar(@Param('id') id: string) {
    return this.service.deletarAluno(id);
  }
}

