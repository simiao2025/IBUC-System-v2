import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsString, IsUUID, IsObject, IsArray } from 'class-validator';

export class CreatePreMatriculaDto {
  @ApiProperty()
  @IsString()
  nome_completo: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nome_social?: string;

  @ApiProperty()
  @IsString()
  cpf: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  rg?: string;

  @ApiProperty({ description: 'Data de nascimento (ISO date)', example: '2019-01-31' })
  @IsISO8601({ strict: true })
  data_nascimento: string;

  @ApiPropertyOptional({ enum: ['M', 'F', 'Outro'] })
  @IsEnum(['M', 'F', 'Outro'])
  @IsOptional()
  sexo?: 'M' | 'F' | 'Outro';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  naturalidade?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nacionalidade?: string;

  @ApiProperty({ description: 'E-mail do responsável' })
  @IsString()
  email_responsavel: string;

  @ApiProperty({ description: 'Telefone do responsável' })
  @IsString()
  telefone_responsavel: string;

  @ApiPropertyOptional({ description: 'Dados de endereço em JSON' })
  @IsObject()
  @IsOptional()
  endereco?: any;

  @ApiPropertyOptional({ description: 'Dados de saúde em JSON' })
  @IsObject()
  @IsOptional()
  saude?: any;

  @ApiPropertyOptional({ description: 'Lista de responsáveis em JSON' })
  @IsArray()
  @IsOptional()
  responsaveis?: any[];

  @ApiProperty()
  @IsUUID()
  polo_id: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  nivel_id?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  escola_origem?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  ano_escolar?: string;

  @ApiPropertyOptional({ required: false, enum: ['em_analise', 'ativo', 'trancado', 'concluido'] })
  @IsEnum(['em_analise', 'ativo', 'trancado', 'concluido'])
  @IsOptional()
  status?: 'em_analise' | 'ativo' | 'trancado' | 'concluido';
}
