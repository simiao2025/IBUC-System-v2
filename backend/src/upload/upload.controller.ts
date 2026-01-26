import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { SupabaseService } from '../supabase/supabase.service';

@Controller('upload')
export class UploadController {
    constructor(private supabase: SupabaseService) { }

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
            fileSize: 5 * 1024 * 1024, // 5MB
        },
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('Arquivo não fornecido.');

        const bucket = process.env.SUPABASE_MATRICULAS_BUCKET || 'documentos';
        const client = this.supabase.getAdminClient();

        const uniqueSuffix = uuidv4();
        const ext = extname(file.originalname);
        const path = `geral/${uniqueSuffix}${ext}`;

        const { error } = await client.storage.from(bucket).upload(path, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });

        if (error) {
            throw new BadRequestException(`Erro ao enviar para o Supabase: ${error.message}`);
        }

        const { data: { publicUrl } } = client.storage.from(bucket).getPublicUrl(path);

        return {
            url: publicUrl,
            filename: `${uniqueSuffix}${ext}`,
            originalname: file.originalname
        };
    }
}
