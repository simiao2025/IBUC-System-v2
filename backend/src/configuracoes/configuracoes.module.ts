import { Module } from '@nestjs/common';
import { ConfiguracoesService } from './configuracoes.service';
import { ConfiguracoesController } from './configuracoes.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { ListaEsperaModule } from '../lista-espera/lista-espera.module';

@Module({
    imports: [SupabaseModule, ListaEsperaModule],
    controllers: [ConfiguracoesController],
    providers: [ConfiguracoesService],
    exports: [ConfiguracoesService],
})
export class ConfiguracoesModule { }
