import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AlunosService } from './alunos.service';

@ApiTags('Alunos')
@Controller('alunos')
export class AlunosController {
  constructor(private readonly service: AlunosService) {}

  @Post()
  async criar(@Body() dto: any) {
    return this.service.criarAluno(dto);
  }
}

