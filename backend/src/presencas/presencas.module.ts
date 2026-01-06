import { Module } from '@nestjs/common';
import { PresencasController } from './presencas.controller';
import { PresencasService } from './presencas.service';

@Module({
  controllers: [PresencasController],
  providers: [PresencasService],
  exports: [PresencasService],
})
export class PresencasModule {}






