import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { DocumentosModule } from '../documentos/documentos.module';

@Module({
    imports: [SupabaseModule, DocumentosModule],
    controllers: [UploadController],
})
export class UploadModule { }
