import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConfiguracaoFinanceiraDto {
  @ApiProperty({ example: '12345678900' })
  @IsString()
  chave_pix: string;

  @ApiProperty({ example: 'Instituto Bíblico' })
  @IsString()
  beneficiario_nome: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  beneficiario_cidade: string;
}
