import { Controller, Get, Param, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Express } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DocumentosService } from './documentos.service';

@ApiTags('Documentos')
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly service: DocumentosService) {}

  @Post('matriculas/:id')
  @ApiOperation({ summary: 'Upload de documentos da matrícula (pré-matrícula)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadDocumentosMatricula(
    @Param('id') id: string,
    @UploadedFiles() files: any[],
  ) {
    return this.service.uploadDocumentosMatricula(id, files);
  }

  @Get('matriculas/:id')
  @ApiOperation({ summary: 'Listar documentos da matrícula' })
  async listarDocumentosMatricula(@Param('id') id: string) {
    return this.service.listarDocumentosMatricula(id);
  }
}






