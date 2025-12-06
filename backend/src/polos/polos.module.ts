import { Module } from '@nestjs/common';
import { PolosController } from './polos.controller';
import { PolosService } from './polos.service';

@Module({
  controllers: [PolosController],
  providers: [PolosService],
  exports: [PolosService],
})
export class PolosModule {}

