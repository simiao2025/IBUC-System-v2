import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PolosService } from './polos.service';

@ApiTags('Polos')
@Controller('polos')
export class PolosController {
  constructor(private readonly service: PolosService) {}

  @Get()
  async listar() {
    return this.service.listarPolos();
  }
}

