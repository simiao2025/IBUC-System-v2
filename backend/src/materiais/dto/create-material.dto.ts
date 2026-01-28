import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateMaterialDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  valor_padrao_cents: number;

  @IsString()
  @IsOptional()
  modulo_id?: string;

  @IsString()
  @IsOptional()
  nivel_id?: string;

  @IsString()
  @IsOptional()
  unidade?: string;

  @IsString()
  @IsOptional()
  url_imagem?: string;
}

export class UpdateMaterialDto {
  @IsString()
  @IsOptional()
  nome?: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  valor_padrao_cents?: number;

  @IsString()
  @IsOptional()
  modulo_id?: string;

  @IsString()
  @IsOptional()
  nivel_id?: string;

  @IsString()
  @IsOptional()
  unidade?: string;

  @IsString()
  @IsOptional()
  url_imagem?: string;
}
