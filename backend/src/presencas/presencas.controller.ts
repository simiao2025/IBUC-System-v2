import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PresencasService } from './presencas.service';

@ApiTags('Presenças')
@Controller('presencas')
export class PresencasController {
  constructor(private readonly service: PresencasService) {}

  @Post()
  async lancar(@Body() dto: any) {
    return this.service.lancarPresenca(dto);
  }
}

