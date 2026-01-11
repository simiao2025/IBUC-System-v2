import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LgpdService } from './lgpd.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('LGPD')
@Controller('lgpd')
export class LgpdController {
  constructor(private readonly service: LgpdService) { }

  @Get('export/:type/:id')
  async exportar(@Param('type') type: string, @Param('id') id: string) {
    return this.service.exportarDados(type, id);
  }

  @Post('anonymize/:type/:id')
  async anonymizar(@Param('type') type: string, @Param('id') id: string) {
    return this.service.anonymizarDados(type, id);
  }
}






