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
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth-v2/guards/jwt-auth.guard';
import { Public } from '../auth-v2/decorators/public.decorator';
import { PolosService, CreatePoloDto, UpdatePoloDto } from './polos.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Polos')
@Controller('polos')
export class PolosController {
  constructor(private readonly service: PolosService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo polo' })
  async criar(@Body() dto: CreatePoloDto) {
    return this.service.criarPolo(dto);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar polos (público para homepage)' })
  async listar(@Query('ativo') ativo?: string) {
    const ativoBool = ativo === 'true' ? true : ativo === 'false' ? false : undefined;
    return this.service.listarPolos(ativoBool);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar polo por ID' })
  async buscarPorId(@Param('id') id: string) {
    return this.service.buscarPoloPorId(id);
  }

  @Get('codigo/:codigo')
  @ApiOperation({ summary: 'Buscar polo por código' })
  async buscarPorCodigo(@Param('codigo') codigo: string) {
    return this.service.buscarPoloPorCodigo(codigo);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar polo' })
  async atualizar(@Param('id') id: string, @Body() dto: UpdatePoloDto) {
    return this.service.atualizarPolo(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deletar polo' })
  async deletar(@Param('id') id: string) {
    return this.service.deletarPolo(id);
  }
}

