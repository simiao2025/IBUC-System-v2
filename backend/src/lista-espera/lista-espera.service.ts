import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { NotificacoesService } from '../notificacoes/notificacoes.service';

@Injectable()
export class ListaEsperaService {
    constructor(
        private readonly supabase: SupabaseService,
        private readonly notificacoes: NotificacoesService
    ) { }

    async cadastrar(dto: { nome: string; email: string; telefone?: string; cidade?: string; bairro?: string }) {
        const { data, error } = await this.supabase
            .getAdminClient()
            .from('lista_espera')
            .insert([
                {
                    nome: dto.nome,
                    email: dto.email,
                    telefone: dto.telefone,
                    cidade: dto.cidade,
                    bairro: dto.bairro,
                    status: 'pendente'
                }
            ])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                throw new BadRequestException('Este e-mail já está cadastrado na lista de espera.');
            }
            throw new BadRequestException(error.message);
        }

        return {
            message: 'Cadastro na lista de espera realizado com sucesso!',
            data
        };
    }

    async listarTodas() {
        const { data, error } = await this.supabase
            .getClient()
            .from('lista_espera')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new BadRequestException(error.message);
        return data;
    }

    async notificarTodosInteressados() {
        const client = this.supabase.getAdminClient();

        // 1. Buscar todos os pendentes
        const { data: interessados, error } = await client
            .from('lista_espera')
            .select('*')
            .eq('status', 'pendente');

        if (error) throw new BadRequestException(error.message);
        if (!interessados || interessados.length === 0) return { notified: 0 };

        let count = 0;
        for (const pessoa of interessados) {
            try {
                // Tentar encontrar um Polo na mesma cidade
                let poloInfo;
                if (pessoa.cidade) {
                    const { data: polos } = await client
                        .from('polos')
                        .select('*')
                        .eq('status', 'ativo')
                        .filter('endereco->>cidade', 'ilike', `%${pessoa.cidade}%`)
                        .limit(1);

                    if (polos && polos.length > 0) {
                        const polo = polos[0];
                        const enderecoObj = typeof polo.endereco === 'string' ? JSON.parse(polo.endereco) : polo.endereco;
                        const enderecoFmt = `${enderecoObj.rua}, ${enderecoObj.numero} - ${enderecoObj.bairro}, ${enderecoObj.cidade}/${enderecoObj.estado}`;

                        // Buscar coordenador
                        const { data: coordData } = await client
                            .from('usuarios')
                            .select('nome_completo, telefone')
                            .eq('polo_id', polo.id)
                            .eq('role', 'coordenador_polo')
                            .eq('ativo', true)
                            .limit(1)
                            .maybeSingle();

                        poloInfo = {
                            nome: polo.nome,
                            endereco: enderecoFmt,
                            contato: coordData ? `${coordData.nome_completo} (${coordData.telefone || 'Sem telefone'})` : 'Entre em contato com a secretaria central'
                        };
                    }
                }

                await this.notificacoes.enviarNotificacaoListaEspera(pessoa.email, pessoa.nome, poloInfo);

                // Atualizar status
                await client
                    .from('lista_espera')
                    .update({ status: 'notificado', notified_at: new Date().toISOString() })
                    .eq('id', pessoa.id);

                count++;
            } catch (err) {
                console.error(`Erro ao notificar ${pessoa.email}:`, err);
            }
        }

        return { notified: count };
    }
}
