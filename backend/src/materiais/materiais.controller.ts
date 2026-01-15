import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MateriaisService } from './materiais.service';
import { CreateMaterialDto, UpdateMaterialDto } from './dto';

@ApiTags('Materiais')
@Controller('materiais')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MateriaisController {
  constructor(private readonly materiaisService: MateriaisService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os materiais katalogados' })
  async listar() {
    return this.materiaisService.listar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um material por ID' })
  async buscarPorId(@Param('id') id: string) {
    return this.materiaisService.buscarPorId(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Cadastrar um novo material' })
  async criar(@Body() dto: CreateMaterialDto) {
    return this.materiaisService.criar(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualizar dados de um material' })
  async atualizar(@Param('id') id: string, @Body() dto: UpdateMaterialDto) {
    return this.materiaisService.atualizar(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um material do catálogo' })
  async deletar(@Param('id') id: string) {
    return this.materiaisService.deletar(id);
  }
}
