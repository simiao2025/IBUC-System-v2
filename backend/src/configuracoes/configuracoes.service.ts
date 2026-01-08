import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ConfiguracoesService {
    constructor(private supabase: SupabaseService) { }

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
            .update({ valor, updated_at: new Date().toISOString() })
            .eq('chave', chave)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);
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
