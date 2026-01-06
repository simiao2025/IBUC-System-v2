import { Module } from '@nestjs/common';
import { DiretoriaController } from './diretoria.controller';
import { DiretoriaService } from './diretoria.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [SupabaseModule, UsuariosModule],
  controllers: [DiretoriaController],
  providers: [DiretoriaService],
  exports: [DiretoriaService],
})
export class DiretoriaModule {}






