import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreatePreMatriculaDto } from './create-pre-matricula.dto';

export class UpdatePreMatriculaDto extends PartialType(CreatePreMatriculaDto) {}
