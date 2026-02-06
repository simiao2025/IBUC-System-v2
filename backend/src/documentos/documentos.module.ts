import { Module } from '@nestjs/common';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';
import { GoogleDriveService } from './google-drive.service';

@Module({
  controllers: [DocumentosController],
  providers: [DocumentosService, GoogleDriveService],
  exports: [DocumentosService, GoogleDriveService],
})
export class DocumentosModule {}






