import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsISO8601, 
  IsOptional, 
  IsString, 
  IsUUID, 
  IsObject, 
  IsBoolean, 
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';

export class EnderecoDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  cep?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  rua?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  numero?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  complemento?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  bairro?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  cidade?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  estado?: string;
}

export class CreateAlunoDto {
  @ApiProperty({ description: 'Nome completo do aluno' })
  @IsString()
  nome: string;

  @ApiProperty({ description: 'Data de nascimento (ISO date)', example: '2010-01-31' })
  @IsISO8601({ strict: true })
  data_nascimento: string;

  @ApiProperty({ enum: ['M', 'F'] })
  @IsEnum(['M', 'F'])
  sexo: 'M' | 'F';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nacionalidade?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  naturalidade?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  cpf?: string;

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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  certidao_numero?: string;

  @ApiPropertyOptional({ type: EnderecoDto })
  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => EnderecoDto)
  endereco?: EnderecoDto;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  foto_url?: string;

  @ApiProperty({ description: 'ID do polo' })
  @IsUUID()
  polo_id: string;

  @ApiPropertyOptional({ description: 'ID da turma' })
  @IsUUID()
  @IsOptional()
  turma_id?: string;

  @ApiProperty({ description: 'ID do nível inicial' })
  @IsUUID()
  nivel_atual_id: string;

  @ApiPropertyOptional({ enum: ['pendente', 'ativo', 'inativo', 'concluido'] })
  @IsEnum(['pendente', 'ativo', 'inativo', 'concluido'])
  @IsOptional()
  status?: 'pendente' | 'ativo' | 'inativo' | 'concluido';

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observacoes?: string;

  // Dados de saúde (Root level conforme service atual)
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
  @IsBoolean()
  @IsOptional()
  autorizacao_medica?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  observacoes_medicas?: string;

  // Dados escolares
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  escola_atual?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  serie?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  dificuldades_aprendizagem?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  descricao_dificuldades?: string;

  // Responsáveis
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  nome_responsavel?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  cpf_responsavel?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  telefone_responsavel?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email_responsavel?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tipo_parentesco?: string;

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
}
