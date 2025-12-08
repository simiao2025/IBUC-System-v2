import { Module } from '@nestjs/common';
import { DracmasController } from './dracmas.controller';
import { DracmasService } from './dracmas.service';

@Module({
  controllers: [DracmasController],
  providers: [DracmasService],
  exports: [DracmasService],
})
export class DracmasModule {}
