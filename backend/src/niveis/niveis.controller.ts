import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth-v2/guards/jwt-auth.guard';
import { NiveisService } from './niveis.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Níveis')
@Controller('niveis')
export class NiveisController {
  constructor(private readonly service: NiveisService) { }

  @Get()
  @ApiOperation({ summary: 'Listar níveis' })
  async listar() {
    return this.service.listar();
  }
}
