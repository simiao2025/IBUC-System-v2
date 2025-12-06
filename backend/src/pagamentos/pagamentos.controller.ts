import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PagamentosService } from './pagamentos.service';

@ApiTags('Pagamentos')
@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly service: PagamentosService) {}
}

