import { IsUUID, IsString, IsOptional, IsArray, ValidateNested, IsDateString, IsNumber, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class StudentAttendanceDto {
  @ApiProperty({ description: 'ID do Aluno', example: 'uuid' })
  @IsUUID()
  aluno_id: string;

  @ApiProperty({ description: 'Status da presença', example: 'presente' })
  @IsString()
  @IsIn(['presente', 'falta', 'justificativa', 'atraso', 'reposicao'])
  status: string;

  @ApiProperty({ description: 'Observação opcional', required: false })
  @IsOptional()
  @IsString()
  observacao?: string;
}

export class StudentDracmaDto {
  @ApiProperty({ description: 'ID do Aluno', example: 'uuid' })
  @IsUUID()
  aluno_id: string;

  @ApiProperty({ description: 'Quantidade de drácmas', example: 10 })
  @IsNumber()
  quantidade: number;

  @ApiProperty({ description: 'Tipo da transação', example: 'presenca' })
  @IsString()
  @IsIn(['presenca', 'assiduidade', 'bonus'])
  tipo: string;

  @ApiProperty({ description: 'Descrição da transação', required: false })
  @IsOptional()
  @IsString()
  descricao?: string;
}

export class UnifiedAttendanceDto {
  @ApiProperty({ description: 'ID da Turma' })
  @IsUUID()
  turma_id: string;

  @ApiProperty({ description: 'Data da aula', example: '2024-01-24' })
  @IsDateString()
  data: string;

  @ApiProperty({ description: 'ID da Lição (opcional)', required: false })
  @IsOptional()
  @IsUUID()
  licao_id?: string;

  @ApiProperty({ description: 'ID do usuário que registrou' })
  @IsUUID()
  registrado_por: string;

  @ApiProperty({ type: [StudentAttendanceDto], description: 'Lista de presenças' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceDto)
  presencas: StudentAttendanceDto[];

  @ApiProperty({ type: [StudentDracmaDto], description: 'Lista de drácmas a conceder' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentDracmaDto)
  dracmas: StudentDracmaDto[];
}
