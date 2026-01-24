import { api } from './ApiClient';

export interface Notificacao {
    id: string;
    usuario_id: string;
    titulo: string;
    mensagem: string;
    lida: boolean;
    link?: string;
    tipo: 'cobranca' | 'aviso' | 'sistema' | 'inicio_aulas';
    created_at: string;
}

export const NotificationAPI = {
    list: async () => {
        return api.get<Notificacao[]>('/notificacoes');
    },

    markAsRead: async (id: string) => {
        return api.patch(`/notificacoes/${id}/ler`, {});
    },

    markAllAsRead: async () => {
        return api.patch('/notificacoes/ler-todas', {});
    },

    getUnreadCount: async () => {
        return api.get<{ count: number }>('/notificacoes/contagem-nao-lidas');
    }
};
