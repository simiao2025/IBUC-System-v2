import { api } from '@/shared/api/api';
import { AgendamentoAula, CreateAgendamentoPayload } from '../model/types';

export const CalendarioService = {
  listarPorTurma: async (turmaId: string, mes?: number, ano?: number): Promise<AgendamentoAula[]> => {
    const response = await api.get<AgendamentoAula[]>(`/calendario/turma/${turmaId}`, { 
        params: { mes, ano } 
    });
    return response.data;
  },

  criar: async (payload: CreateAgendamentoPayload): Promise<AgendamentoAula> => {
    const response = await api.post<AgendamentoAula>('/calendario', payload);
    return response.data;
  },
  
  atualizar: async (id: string, payload: Partial<CreateAgendamentoPayload>): Promise<AgendamentoAula> => {
    const response = await api.patch<AgendamentoAula>(`/calendario/${id}`, payload);
    return response.data;
  },

  deletar: async (id: string): Promise<void> => {
    await api.delete(`/calendario/${id}`);
  }
};
