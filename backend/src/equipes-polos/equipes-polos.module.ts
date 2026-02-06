import { Module } from '@nestjs/common';
import { EquipesPolosService } from './equipes-polos.service';
import { EquipesPolosController } from './equipes-polos.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { UsuariosModule } from '../usuarios/usuarios.module';

@Module({
  imports: [SupabaseModule, UsuariosModule],
  controllers: [EquipesPolosController],
  providers: [EquipesPolosService],
  exports: [EquipesPolosService],
})
export class EquipesPolosModule {}
