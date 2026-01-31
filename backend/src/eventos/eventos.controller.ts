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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EventosService } from './eventos.service';

@ApiTags('Eventos')
@Controller('eventos')
export class EventosController {
  constructor(private readonly service: EventosService) { }

  private extractToken(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token inválido ou inexistente');
    }
    return authHeader.split(' ')[1];
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar evento (geral ou por polo)' })
  async criar(@Headers('authorization') auth: string, @Body() dto: any) {
    const token = this.extractToken(auth);
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      console.log('JWT Payload:', JSON.stringify(payload, null, 2));
    } catch (e) {
      console.error('Erro ao decodificar token para debug:', e);
    }
    console.log('Token recebido (criar):', token.substring(0, 15) + '...');
    return this.service.criar(dto, token);
  }

  @Get()
  @ApiOperation({ summary: 'Listar eventos com filtros opcionais' })
  async listar(
    @Headers('authorization') auth?: string,
    @Query('polo_id') poloId?: string,
    @Query('include_geral') includeGeral?: string,
    @Query('date_from') dateFrom?: string,
    @Query('limit') limit?: string,
  ) {
    const token = auth?.startsWith('Bearer ') ? auth.split(' ')[1] : undefined;
    if (token) {
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        console.log('JWT Payload (listar):', JSON.stringify(payload, null, 2));
      } catch (e) {
        console.error('Erro ao decodificar token para debug:', e);
      }
      console.log('Token recebido (listar):', token.substring(0, 15) + '...');
    } else {
      console.log('Nenhum token fornecido (listar pública)');
    }
    const include = includeGeral === 'true';
    const limitNum = limit ? parseInt(limit, 10) : undefined;

    return this.service.listar({
      polo_id: poloId,
      include_geral: include,
      date_from: dateFrom,
      limit: limitNum,
    }, token);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar evento por ID' })
  async buscarPorId(@Headers('authorization') auth: string, @Param('id') id: string) {
    const token = auth?.startsWith('Bearer ') ? auth.split(' ')[1] : undefined;
    return this.service.buscarPorId(id, token);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar evento por ID' })
  async atualizar(
    @Headers('authorization') auth: string,
    @Param('id') id: string,
    @Body() dto: any
  ) {
    const token = this.extractToken(auth);
    return this.service.atualizar(id, dto, token);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir evento por ID' })
  async deletar(@Headers('authorization') auth: string, @Param('id') id: string) {
    const token = this.extractToken(auth);
    return this.service.deletar(id, token);
  }
}
