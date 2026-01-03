import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional, IsString, IsUUID, IsObject } from 'class-validator';

export class CreateAlunoDirectDto {
  // Dados do Aluno
  @ApiProperty({ description: 'Nome completo do aluno' })
  @IsString()
  nome: string;

  @ApiProperty({ description: 'Data de nascimento (ISO date)', example: '2010-01-31' })
  @IsISO8601({ strict: true })
  data_nascimento: string;

  @ApiProperty({ enum: ['M', 'F'] })
  @IsEnum(['M', 'F'])
  sexo: 'M' | 'F';

  @ApiProperty({ description: 'CPF do aluno' })
  @IsString()
  cpf: string;

  @ApiPropertyOptional({ description: 'RG do aluno' })
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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  naturalidade?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nacionalidade?: string;

  // Endereço
  @ApiProperty({ description: 'Dados de endereço em JSON' })
  @IsObject()
  endereco: {
    cep: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };

  // Responsável
  @ApiProperty({ description: 'Nome do responsável legal' })
  @IsString()
  nome_responsavel: string;

  @ApiProperty({ description: 'CPF do responsável' })
  @IsString()
  cpf_responsavel: string;

  @ApiProperty({ description: 'E-mail do responsável' })
  @IsString()
  email_responsavel: string;

  @ApiProperty({ description: 'Telefone do responsável' })
  @IsString()
  telefone_responsavel: string;

  // Guardian 2
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nome_responsavel_2?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  cpf_responsavel_2?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  telefone_responsavel_2?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email_responsavel_2?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tipo_parentesco_2?: string;

  @ApiProperty({ description: 'Tipo de parentesco', enum: ['pai', 'mae', 'tutor', 'outro'] })
  @IsEnum(['pai', 'mae', 'tutor', 'outro'])
  tipo_parentesco: 'pai' | 'mae' | 'tutor' | 'outro';

  // Health
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  alergias?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  restricao_alimentar?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  medicacao_continua?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  doencas_cronicas?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contato_emergencia_nome?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contato_emergencia_telefone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  convenio_medico?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  hospital_preferencia?: string;

  @ApiPropertyOptional()
  @IsOptional()
  autorizacao_medica?: boolean;

  // Matrícula
  @ApiProperty({ description: 'ID da turma' })
  @IsUUID()
  turma_id: string;

  @ApiProperty({ description: 'ID do polo' })
  @IsUUID()
  polo_id: string;

  @ApiPropertyOptional({ description: 'ID do nível' })
  @IsUUID()
  @IsOptional()
  nivel_id?: string;

  @ApiPropertyOptional({ description: 'Observações adicionais' })
  @IsString()
  @IsOptional()
  observacoes?: string;
}
