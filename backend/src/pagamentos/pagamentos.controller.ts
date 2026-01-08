import { Controller, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth-v2/guards/jwt-auth.guard';
import { PagamentosService } from './pagamentos.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Pagamentos')
@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly service: PagamentosService) { }
}






