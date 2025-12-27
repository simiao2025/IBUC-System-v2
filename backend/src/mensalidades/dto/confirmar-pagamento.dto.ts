import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmarPagamentoDto {
  @ApiProperty({ required: false, description: 'URL do comprovante de pagamento' })
  @IsString()
  @IsOptional()
  comprovante_url?: string;
}
