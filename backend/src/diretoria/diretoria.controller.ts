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
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DiretoriaService, CreateDiretoriaGeralDto, UpdateDiretoriaGeralDto } from './diretoria.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Diretoria')
@Controller('diretoria')
export class DiretoriaController {
  constructor(private readonly diretoriaService: DiretoriaService) { }

  // ========== DIRETORIA GERAL ==========

  @Post('geral')
  @HttpCode(HttpStatus.CREATED)
  async criarDiretoriaGeral(@Body() dto: CreateDiretoriaGeralDto) {
    return this.diretoriaService.criarDiretoriaGeral(dto);
  }

  @Get('geral')
  async listarDiretoriaGeral(@Query('ativo') ativo?: string) {
    const ativoBool = ativo === 'true' ? true : ativo === 'false' ? false : undefined;
    return this.diretoriaService.listarDiretoriaGeral(ativoBool);
  }

  @Get('geral/:id')
  async buscarDiretoriaGeralPorId(@Param('id') id: string) {
    return this.diretoriaService.buscarDiretoriaGeralPorId(id);
  }

  @Put('geral/:id')
  async atualizarDiretoriaGeral(
    @Param('id') id: string,
    @Body() dto: UpdateDiretoriaGeralDto
  ) {
    return this.diretoriaService.atualizarDiretoriaGeral(id, dto);
  }

  @Put('geral/:id/desativar')
  async desativarDiretoriaGeral(@Param('id') id: string) {
    return this.diretoriaService.desativarDiretoriaGeral(id);
  }

  @Delete('geral/:id')
  async deletarDiretoriaGeral(@Request() req: any, @Param('id') id: string) {
    const user = req.user;
    const isGlobalAdmin = ['super_admin', 'diretor_geral', 'admin_geral'].includes(user?.role);
    if (!isGlobalAdmin) {
      throw new ForbiddenException('Apenas administradores globais podem excluir membros da diretoria geral.');
    }
    return this.diretoriaService.deletarDiretoriaGeral(id);
  }

  // ========== DIRETORIA POLO ==========

  @Post('polo/:poloId')
  @HttpCode(HttpStatus.CREATED)
  async criarDiretoriaPolo(
    @Param('poloId') poloId: string,
    @Body() dto: CreateDiretoriaGeralDto
  ) {
    return this.diretoriaService.criarDiretoriaPolo(poloId, dto);
  }

  @Get('polo')
  async listarDiretoriaPolo(
    @Request() req: any,
    @Query('polo_id') poloId?: string,
    @Query('ativo') ativo?: string
  ) {
    const filtros: any = {};
    const user = req.user;
    const isGlobalAdmin = ['super_admin', 'diretor_geral', 'admin_geral'].includes(user?.role);

    let finalPoloId = poloId;

    // Segurança: Se não for admin global, força o polo do usuário
    if (!isGlobalAdmin) {
      finalPoloId = user.polo_id;
    }

    const ativoBool = ativo === 'true' ? true : ativo === 'false' ? false : undefined;
    return this.diretoriaService.listarDiretoriaPolo(finalPoloId, ativoBool);
  }

  @Get('polo/:id')
  async buscarDiretoriaPoloPorId(@Param('id') id: string) {
    return this.diretoriaService.buscarDiretoriaPoloPorId(id);
  }

  @Put('polo/:id')
  async atualizarDiretoriaPolo(
    @Param('id') id: string,
    @Body() dto: UpdateDiretoriaGeralDto
  ) {
    return this.diretoriaService.atualizarDiretoriaPolo(id, dto);
  }

  @Put('polo/:id/desativar')
  async desativarDiretoriaPolo(@Param('id') id: string) {
    return this.diretoriaService.desativarDiretoriaPolo(id);
  }

  @Delete('polo/:id')
  async deletarDiretoriaPolo(@Request() req: any, @Param('id') id: string) {
    const user = req.user;
    const isGlobalAdmin = ['super_admin', 'diretor_geral', 'admin_geral'].includes(user?.role);

    if (!isGlobalAdmin) {
      const diretoria = await this.diretoriaService.buscarDiretoriaPoloPorId(id);
      if (diretoria.polo_id !== user.polo_id) {
        throw new ForbiddenException('Você não tem permissão para deletar membros da diretoria de outro polo.');
      }
    }

    return this.diretoriaService.deletarDiretoriaPolo(id);
  }
}






