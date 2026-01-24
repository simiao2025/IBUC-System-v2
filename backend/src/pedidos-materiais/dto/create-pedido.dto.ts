import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateItemPedidoDto {
  @IsUUID()
  @IsNotEmpty()
  material_id: string;

  @IsInt()
  @IsNotEmpty()
  quantidade: number;

  @IsInt()
  @IsNotEmpty()
  valor_unitario_cents: number;
}

export class CreatePedidoMaterialDto {
  @IsString()
  @IsNotEmpty()
  tipo_cobranca: string;

  @IsUUID()
  @IsOptional()
  modulo_destino_id?: string;

  @IsArray()
  @IsOptional()
  @IsUUID('all', { each: true })
  niveis_destino_ids?: string[];

  @IsUUID()
  @IsNotEmpty()
  solicitante_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemPedidoDto)
  itens: CreateItemPedidoDto[];
}
