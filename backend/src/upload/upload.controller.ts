import { Controller, Post, Param, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly service: UploadService) {}

  @Post(':folder')
  @ApiOperation({ summary: 'Fazer upload de um arquivo para uma pasta específica' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('folder') folder: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.service.uploadFile(folder, file);
  }
}
