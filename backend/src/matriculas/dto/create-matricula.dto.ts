import { IsUUID, IsEnum, IsOptional, IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMatriculaDto {
  @ApiProperty()
  @IsUUID()
  aluno_id: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  turma_id?: string;

  @ApiProperty()
  @IsUUID()
  polo_id: string;

  @ApiProperty({ enum: ['online', 'presencial'] })
  @IsEnum(['online', 'presencial'])
  tipo: 'online' | 'presencial';

  @ApiProperty({ required: false, enum: ['pendente', 'em_analise', 'ativa', 'recusada', 'cancelada'] })
  @IsEnum(['pendente', 'em_analise', 'ativa', 'recusada', 'cancelada'])
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  origem?: string;

  @ApiProperty({ required: false, description: 'Período letivo, ex: 2025.1, 2025.2' })
  @IsString()
  @IsOptional()
  periodo_letivo?: string;

  @ApiProperty({ required: false, description: 'Número do módulo (1 a 10) associado à matrícula' })
  @IsInt()
  @IsOptional()
  modulo_numero?: number;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  created_by?: string;
}

export class UpdateMatriculaDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  turma_id?: string;

  @ApiProperty({ required: false })
  @IsEnum(['pendente', 'em_analise', 'ativa', 'recusada', 'cancelada'])
  @IsOptional()
  status?: string;
}

export class AprovarMatriculaDto {
  @ApiProperty()
  @IsUUID()
  approved_by: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  turma_id?: string;
}






