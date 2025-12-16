import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsString, IsUUID } from 'class-validator';

export class CreatePreMatriculaDto {
  @ApiProperty()
  @IsString()
  nome_completo: string;

  @ApiProperty()
  @IsString()
  cpf: string;

  @ApiProperty({ description: 'Data de nascimento (ISO date)', example: '2019-01-31' })
  @IsISO8601({ strict: true })
  data_nascimento: string;

  @ApiProperty({ description: 'E-mail do responsável' })
  @IsString()
  email_responsavel: string;

  @ApiProperty({ description: 'Telefone do responsável' })
  @IsString()
  telefone_responsavel: string;

  @ApiProperty()
  @IsUUID()
  polo_id: string;

  @ApiProperty({ required: false, enum: ['em_analise', 'ativo', 'trancado', 'concluido'] })
  @IsEnum(['em_analise', 'ativo', 'trancado', 'concluido'])
  status?: 'em_analise' | 'ativo' | 'trancado' | 'concluido';
}
