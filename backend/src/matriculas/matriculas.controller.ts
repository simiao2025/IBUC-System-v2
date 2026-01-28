import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MatriculasService } from './matriculas.service';
import { CreateMatriculaDto, UpdateMatriculaDto, AprovarMatriculaDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Matrículas')
@Controller('matriculas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MatriculasController {
  constructor(private readonly service: MatriculasService) { }

  @Post()
  @ApiOperation({ summary: 'Criar nova matrícula' })
  async criar(@Body() dto: CreateMatriculaDto) {
    return this.service.criarMatricula(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar matrículas' })
  async listar(@Query('polo_id') poloId?: string, @Query('status') status?: string, @Query('aluno_id') alunoId?: string) {
    return this.service.listarMatriculas(poloId, status, alunoId);
  }

  @Get('protocolo/:protocolo')
  @ApiOperation({ summary: 'Buscar matrícula por protocolo' })
  async buscarPorProtocolo(@Param('protocolo') protocolo: string) {
    return this.service.buscarPorProtocolo(protocolo);
  }

  @Put(':id/aprovar')
  @ApiOperation({ summary: 'Aprovar matrícula' })
  async aprovar(@Param('id') id: string, @Body() dto: AprovarMatriculaDto) {
    return this.service.aprovarMatricula(id, dto);
  }

  @Put(':id/recusar')
  @ApiOperation({ summary: 'Recusar matrícula' })
  async recusar(
    @Param('id') id: string,
    @Body() body: { motivo: string; user_id: string },
  ) {
    return this.service.recusarMatricula(id, body.motivo, body.user_id);
  }
}






