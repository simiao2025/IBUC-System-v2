import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsString, IsUUID, IsObject, IsArray } from 'class-validator';

export class CreatePreMatriculaDto {
  @ApiProperty()
  @IsString()
  nome_completo: string;

  @ApiProperty()
  @IsString()
  cpf: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  rg?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  rg_orgao?: string;

  @ApiPropertyOptional()
  @IsISO8601()
  @IsOptional()
  rg_data_expedicao?: string;

  @ApiProperty({ description: 'Data de nascimento (ISO date)', example: '2019-01-31' })
  @IsISO8601({ strict: true })
  data_nascimento: string;

  @ApiProperty({ enum: ['M', 'F'] })
  @IsEnum(['M', 'F'])
  sexo: 'M' | 'F';

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

  // Explicit Health Fields
  @ApiPropertyOptional() @IsString() @IsOptional() alergias?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() restricao_alimentar?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() medicacao_continua?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() doencas_cronicas?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() contato_emergencia_nome?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() contato_emergencia_telefone?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() convenio_medico?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() hospital_preferencia?: string;
  @ApiPropertyOptional() @IsOptional() autorizacao_medica?: boolean;

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

  @ApiPropertyOptional({ description: 'Nome do responsável' })
  @IsString()
  @IsOptional()
  nome_responsavel?: string;

  @ApiPropertyOptional({ description: 'CPF do responsável' })
  @IsString()
  @IsOptional()
  cpf_responsavel?: string;

  @ApiPropertyOptional({ description: 'Tipo de parentesco', enum: ['pai', 'mae', 'tutor', 'outro'] })
  @IsEnum(['pai', 'mae', 'tutor', 'outro'])
  @IsOptional()
  tipo_parentesco?: 'pai' | 'mae' | 'tutor' | 'outro';

  // Second Guardian
  @ApiPropertyOptional() @IsString() @IsOptional() nome_responsavel_2?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() cpf_responsavel_2?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() telefone_responsavel_2?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() email_responsavel_2?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() tipo_parentesco_2?: string;

  @ApiPropertyOptional({ description: 'Observações adicionais' })
  @IsString()
  @IsOptional()
  observacoes?: string;

  @ApiPropertyOptional({ required: false, enum: ['em_analise', 'ativo', 'trancado', 'concluido'] })
  @IsEnum(['em_analise', 'ativo', 'trancado', 'concluido'])
  @IsOptional()
  status?: 'em_analise' | 'ativo' | 'trancado' | 'concluido';

  @ApiPropertyOptional()
  @IsOptional()
  autorizacao_imagem?: boolean;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  turma_id?: string;
}
