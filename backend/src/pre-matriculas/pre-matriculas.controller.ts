import { Body, Controller, Get, Param, Post, Put, Query, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { PreMatriculasService } from './pre-matriculas.service';
import { CreatePreMatriculaDto, UpdatePreMatriculaStatusDto, UpdatePreMatriculaDto } from './dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Pré-matrículas')
@Controller('pre-matriculas')
export class PreMatriculasController {
  constructor(private readonly service: PreMatriculasService) { }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Criar pré-matrícula (público para formulário online)' })
  async criar(@Body() dto: CreatePreMatriculaDto) {
    return this.service.criar(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pré-matrículas' })
  async listar(@Query('polo_id') poloId?: string, @Query('status') status?: string) {
    return this.service.listar(poloId, status);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar dados da pré-matrícula' })
  async atualizar(@Param('id') id: string, @Body() dto: UpdatePreMatriculaDto) {
    return this.service.atualizar(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover pré-matrícula permanentemente' })
  async remover(@Param('id') id: string) {
    return this.service.remover(id);
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
