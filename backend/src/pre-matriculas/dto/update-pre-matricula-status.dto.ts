import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdatePreMatriculaStatusDto {
  @ApiProperty({ enum: ['em_analise', 'ativo', 'trancado', 'concluido'] })
  @IsEnum(['em_analise', 'ativo', 'trancado', 'concluido'])
  status: 'em_analise' | 'ativo' | 'trancado' | 'concluido';
}
