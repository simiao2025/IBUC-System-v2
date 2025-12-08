import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TurmasService } from './turmas.service';

@ApiTags('Turmas')
@Controller('turmas')
export class TurmasController {
  constructor(private readonly service: TurmasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar turmas' })
  async listar(
    @Query('polo_id') poloId?: string,
    @Query('nivel_id') nivelId?: string,
    @Query('status') status?: string,
    @Query('ano_letivo') anoLetivo?: string,
  ) {
    const filtros: any = {};
    if (poloId) filtros.polo_id = poloId;
    if (nivelId) filtros.nivel_id = nivelId;
    if (status) filtros.status = status;
    if (anoLetivo) filtros.ano_letivo = parseInt(anoLetivo, 10);

    return this.service.listarTurmas(filtros);
  }
}
