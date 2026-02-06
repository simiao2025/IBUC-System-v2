import { IsUUID, IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TransferirAlunoDto {
  @IsUUID()
  @IsNotEmpty()
  polo_destino_id: string;

  @IsString()
  @IsNotEmpty()
  motivo: string;

  @IsString()
  @IsOptional()
  observacoes?: string;
}
