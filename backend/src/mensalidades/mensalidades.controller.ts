import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MensalidadesService } from './mensalidades.service';

@ApiTags('Mensalidades')
@Controller('mensalidades')
export class MensalidadesController {
  constructor(private readonly service: MensalidadesService) {}
}

