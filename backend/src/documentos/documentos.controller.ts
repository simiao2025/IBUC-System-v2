import { Controller, Get, Param, Post, Query, UploadedFiles, UseInterceptors, UseGuards } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Express } from 'express';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { DocumentosService } from './documentos.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Documentos')
@Controller('documentos')
export class DocumentosController {
  constructor(private readonly service: DocumentosService) { }

  @Post('matriculas/:id')
  @ApiOperation({ summary: 'Upload de documentos da matrícula (pré-matrícula)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (_req, file, cb) => {
        const allowed = ['application/pdf'];
        const isImage = typeof file.mimetype === 'string' && file.mimetype.startsWith('image/');
        if (isImage || allowed.includes(file.mimetype)) {
          cb(null, true);
          return;
        }
        cb(new Error('Tipo de arquivo não suportado. Envie PDF ou imagem.'), false);
      },
    }),
  )
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

  @Public()
  @Post('pre-matriculas/:id')
  @ApiOperation({ summary: 'Upload de documentos da pré-matrícula' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (_req, file, cb) => {
        const allowed = ['application/pdf'];
        const isImage = typeof file.mimetype === 'string' && file.mimetype.startsWith('image/');
        if (isImage || allowed.includes(file.mimetype)) {
          cb(null, true);
          return;
        }
        cb(new Error('Tipo de arquivo não suportado. Envie PDF ou imagem.'), false);
      },
    }),
  )
  async uploadDocumentosPreMatricula(
    @Param('id') id: string,
    @Query('tipo') tipo: string | undefined,
    @UploadedFiles() files: any[],
  ) {
    return this.service.uploadDocumentosPreMatricula(id, tipo, files);
  }

  @Public()
  @Get('pre-matriculas/:id')
  @ApiOperation({ summary: 'Listar documentos da pré-matrícula' })
  async listarDocumentosPreMatricula(@Param('id') id: string) {
    return this.service.listarDocumentosPreMatricula(id);
  }

  @Post('alunos/:id')
  @ApiOperation({ summary: 'Upload de documentos do aluno' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (_req, file, cb) => {
        const allowed = ['application/pdf'];
        const isImage = typeof file.mimetype === 'string' && file.mimetype.startsWith('image/');
        if (isImage || allowed.includes(file.mimetype)) {
          cb(null, true);
          return;
        }
        cb(new Error('Tipo de arquivo não suportado. Envie PDF ou imagem.'), false);
      },
    }),
  )
  async uploadDocumentosAluno(
    @Param('id') id: string,
    @Query('tipo') tipo: string | undefined,
    @UploadedFiles() files: any[],
  ) {
    return this.service.uploadDocumentosAluno(id, tipo, files);
  }

  @Get('alunos/:id')
  @ApiOperation({ summary: 'Listar documentos do aluno' })
  async listarDocumentosAluno(@Param('id') id: string) {
    return this.service.listarDocumentosAluno(id);
  }
}






