import { Module } from '@nestjs/common';
import { PreMatriculasController } from './pre-matriculas.controller';
import { PreMatriculasService } from './pre-matriculas.service';

@Module({
  controllers: [PreMatriculasController],
  providers: [PreMatriculasService],
  exports: [PreMatriculasService],
})
export class PreMatriculasModule {}
