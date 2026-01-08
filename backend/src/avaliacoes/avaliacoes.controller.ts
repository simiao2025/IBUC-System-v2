import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth-v2/guards/jwt-auth.guard';
import { AvaliacoesService } from './avaliacoes.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Avaliações')
@Controller('avaliacoes')
export class AvaliacoesController {
  constructor(private readonly service: AvaliacoesService) { }
}






