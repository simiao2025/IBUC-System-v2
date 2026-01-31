import { IsNotEmpty, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';

export class CreateAulaDto {
  @IsNotEmpty()
  @IsUUID()
  turma_id: string;

  @IsNotEmpty()
  @IsUUID()
  modulo_id: string;

  @IsNotEmpty()
  @IsUUID()
  licao_id: string;

  @IsNotEmpty()
  @IsDateString()
  data_aula: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}

export class UpdateAulaDto {
    @IsOptional()
    @IsUUID()
    turma_id?: string;
  
    @IsOptional()
    @IsUUID()
    modulo_id?: string;
  
    @IsOptional()
    @IsUUID()
    licao_id?: string;
  
    @IsOptional()
    @IsDateString()
    data_aula?: string;
  
    @IsOptional()
    @IsString()
    observacoes?: string;
}
