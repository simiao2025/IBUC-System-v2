import { Module } from '@nestjs/common';
import { ListaEsperaService } from './lista-espera.service';
import { ListaEsperaController } from './lista-espera.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { NotificacoesModule } from '../notificacoes/notificacoes.module';

@Module({
    imports: [SupabaseModule, NotificacoesModule],
    controllers: [ListaEsperaController],
    providers: [ListaEsperaService],
    exports: [ListaEsperaService]
})
export class ListaEsperaModule { }
