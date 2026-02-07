import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { GoogleDriveService } from '../documentos/google-drive.service';

@Controller('upload')
export class UploadController {
    constructor(private googleDrive: GoogleDriveService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(),
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
                return callback(new BadRequestException('Apenas arquivos de imagem ou PDF são permitidos!'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB
        },
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('Arquivo não fornecido.');

        try {
            // Redireciona para o Google Drive usando uma pasta genérica 'geral'
            const driveFile = await this.googleDrive.uploadFile(file, 'geral');

            return {
                url: driveFile.url,
                filename: driveFile.id, // Usamos o ID do Drive como nome interno
                originalname: file.originalname
            };
        } catch (error) {
            throw new BadRequestException(`Erro ao enviar para o Google Drive: ${error.message}`);
        }
    }
}
