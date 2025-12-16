import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NiveisService } from './niveis.service';

@ApiTags('Níveis')
@Controller('niveis')
export class NiveisController {
  constructor(private readonly service: NiveisService) {}

  @Get()
  @ApiOperation({ summary: 'Listar níveis' })
  async listar() {
    return this.service.listar();
  }
}
