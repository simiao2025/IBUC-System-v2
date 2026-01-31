import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CalendarioService } from './calendario.service';
import { CreateAulaDto, UpdateAulaDto } from './dto/create-aula.dto';

@Controller('calendario')
@UseGuards(AuthGuard('jwt'))
export class CalendarioController {
  constructor(private readonly calendarioService: CalendarioService) {}

  @Post()
  create(@Body() createAulaDto: CreateAulaDto, @Request() req) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.calendarioService.criar(createAulaDto, token);
  }

  @Get('turma/:turmaId')
  findAll(@Param('turmaId') turmaId: string, @Query('mes') mes: string, @Query('ano') ano: string, @Request() req) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.calendarioService.listarPorTurma(turmaId, token, mes ? +mes : undefined, ano ? +ano : undefined);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAulaDto: UpdateAulaDto, @Request() req) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.calendarioService.atualizar(id, updateAulaDto, token);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.calendarioService.deletar(id, token);
  }
}
