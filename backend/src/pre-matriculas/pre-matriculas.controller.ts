import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PreMatriculasService } from './pre-matriculas.service';
import { CreatePreMatriculaDto, UpdatePreMatriculaStatusDto } from './dto';

@ApiTags('Pré-matrículas')
@Controller('pre-matriculas')
export class PreMatriculasController {
  constructor(private readonly service: PreMatriculasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar pré-matrícula' })
  async criar(@Body() dto: CreatePreMatriculaDto) {
    return this.service.criar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pré-matrículas' })
  async listar(@Query('polo_id') poloId?: string, @Query('status') status?: string) {
    return this.service.listar(poloId, status);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Atualizar status da pré-matrícula' })
  async atualizarStatus(@Param('id') id: string, @Body() dto: UpdatePreMatriculaStatusDto) {
    return this.service.atualizarStatus(id, dto);
  }

  @Post(':id/concluir')
  @ApiOperation({ summary: 'Concluir pré-matrícula (criar aluno + matrícula e vincular à turma)' })
  async concluir(
    @Param('id') id: string,
    @Body() body: { turma_id: string; approved_by: string },
  ) {
    return this.service.concluir(id, body);
  }
}
