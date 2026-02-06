import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { EquipesPolosService } from './equipes-polos.service';
import { CreateEquipePoloDto, UpdateEquipePoloDto } from './dto/equipe-polo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('equipes-polos')
@UseGuards(JwtAuthGuard)
export class EquipesPolosController {
  constructor(private readonly equipesPolosService: EquipesPolosService) {}

  @Post()
  create(@Body() createDto: CreateEquipePoloDto) {
    return this.equipesPolosService.criar(createDto);
  }

  @Get()
  findAll(@Req() req: any, @Query('polo_id') poloId?: string) {
    const user = req.user;
    const isGlobalAdmin = ['super_admin', 'diretor_geral', 'admin_geral'].includes(user?.role);

    let finalPoloId = poloId;

    if (!isGlobalAdmin) {
      finalPoloId = user.polo_id;
    }

    return this.equipesPolosService.listar(finalPoloId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.equipesPolosService.buscarPorId(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateEquipePoloDto) {
    return this.equipesPolosService.atualizar(id, updateDto);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const user = req.user;
    const isGlobalAdmin = ['super_admin', 'diretor_geral', 'admin_geral'].includes(user?.role);

    if (!isGlobalAdmin) {
      const membro = await this.equipesPolosService.buscarPorId(id);
      if (membro.polo_id !== user.polo_id) {
        throw new ForbiddenException('Você não tem permissão para deletar membros de outro polo.');
      }
    }

    return this.equipesPolosService.deletar(id);
  }
}
