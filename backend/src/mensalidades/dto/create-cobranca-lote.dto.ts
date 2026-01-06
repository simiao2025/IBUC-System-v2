import { IsUUID, IsString, IsInt, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCobrancaLoteDto {
  @ApiProperty({ description: 'ID da turma para gerar cobranças' })
  @IsUUID()
  turma_id: string;

  @ApiProperty({ description: 'Título da cobrança (ex: Módulo 1)', example: 'Módulo 1' })
  @IsString()
  titulo: string;

  @ApiProperty({ description: 'Valor em centavos', example: 5000 })
  @IsInt()
  @Min(1)
  valor_cents: number;

  @ApiProperty({ description: 'Data de vencimento (YYYY-MM-DD)', example: '2025-02-15' })
  @IsDateString()
  vencimento: string;
}
