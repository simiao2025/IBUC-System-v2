import { Module } from '@nestjs/common';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { ModulosController } from './modulos.controller';
import { ModulosService } from './modulos.service';

@Module({
  imports: [UsuariosModule],
  controllers: [ModulosController],
  providers: [ModulosService],
  exports: [ModulosService],
})
export class ModulosModule {}
