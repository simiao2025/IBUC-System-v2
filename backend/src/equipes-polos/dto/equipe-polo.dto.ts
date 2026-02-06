import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEquipePoloDto {
  @IsUUID()
  @IsNotEmpty()
  polo_id: string;

  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  cpf?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsString()
  @IsNotEmpty()
  cargo: 'professor' | 'auxiliar' | 'coordenador_regional';

  @IsString()
  @IsOptional()
  observacoes?: string;
}

export class UpdateEquipePoloDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsString()
  @IsOptional()
  cargo?: 'professor' | 'auxiliar' | 'coordenador_regional';

  @IsString()
  @IsOptional()
  status?: 'ativo' | 'inativo';

  @IsString()
  @IsOptional()
  observacoes?: string;
}
