import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ListaEsperaService } from '../lista-espera/lista-espera.service';

@Injectable()
export class ConfiguracoesService {
    constructor(
        private readonly supabase: SupabaseService,
        private readonly listaEsperaService: ListaEsperaService
    ) { }

    async listarTodas() {
        const { data, error } = await this.supabase
            .getAdminClient()
            .from('configuracoes_sistema')
            .select('*')
            .order('chave');

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async buscarPorChave(chave: string) {
        const { data, error } = await this.supabase
            .getAdminClient()
            .from('configuracoes_sistema')
            .select('*')
            .eq('chave', chave)
            .maybeSingle();

        if (error) throw new BadRequestException(error.message);
        if (!data) throw new NotFoundException(`Configuração '${chave}' não encontrada`);

        return data;
    }

    async atualizar(chave: string, valor: any) {
        const { data, error } = await this.supabase
            .getAdminClient()
            .from('configuracoes_sistema')
            .upsert({ chave, valor, updated_at: new Date().toISOString() }, { onConflict: 'chave' })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);

        // Gatilho para Lista de Espera: Se o período de matrícula foi aberto agora
        if (chave === 'periodo_matricula' && valor) {
            try {
                const now = new Date();
                const start = new Date(valor.start);
                const end = new Date(valor.end);

                // Se o novo período engloba 'hoje', notificar interessados
                if (now >= start && now <= end) {
                    console.log('[DEBUG] Novo período de matrícula ativo detectado! Notificando lista de espera...');
                    this.listaEsperaService.notificarTodosInteressados().then(result => {
                        console.log(`[DEBUG] Notificações enviadas: ${result.notified}`);
                    });
                }
            } catch (err) {
                console.error('Erro ao processar gatilho de notificação:', err);
            }
        }

        return data;
    }

    async buscarPublicas() {
        const { data, error } = await this.supabase
            .getAdminClient()
            .from('configuracoes_sistema')
            .select('chave, valor')
            .eq('publica', true);

        if (error) throw new BadRequestException(error.message);

        // Converte array em objeto chave: valor para facilitar no front
        return data.reduce((acc, curr) => {
            acc[curr.chave] = curr.valor;
            return acc;
        }, {});
    }
}
