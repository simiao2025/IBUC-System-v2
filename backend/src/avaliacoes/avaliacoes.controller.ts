import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvaliacoesService } from './avaliacoes.service';

@ApiTags('Avaliações')
@Controller('avaliacoes')
export class AvaliacoesController {
  constructor(private readonly service: AvaliacoesService) {}
}






