import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('upload')
export class UploadController {
    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, callback) => {
                const uniqueSuffix = uuidv4();
                const ext = extname(file.originalname);
                callback(null, `${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
                return callback(new BadRequestException('Apenas arquivos de imagem ou PDF são permitidos!'), false);
            }
            callback(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('Arquivo não fornecido.');

        // Retorna a URL pública
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const host = process.env.API_HOST || 'localhost:3000';
        // Se o backend estiver rodando em container ou proxy, ajustar a URL base pode ser necessário
        // Por enquanto, assumimos relativo ou localhost

        return {
            url: `/uploads/${file.filename}`,
            filename: file.filename,
            originalname: file.originalname
        };
    }
}
