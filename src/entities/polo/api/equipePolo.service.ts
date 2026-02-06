import { api } from '@/shared/api/api';
import type { AdminRole } from '@/types';

export interface EquipePoloMember {
  id: string;
  polo_id: string;
  usuario_id?: string;
  nome: string;
  email: string;
  telefone?: string;
  cargo: 'professor' | 'auxiliar' | 'coordenador_regional';
  status: 'ativo' | 'inativo';
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
  polo?: {
    nome: string;
    codigo: string;
  };
}

export interface CreateEquipePoloDto {
  polo_id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  cargo: 'professor' | 'auxiliar' | 'coordenador_regional';
  observacoes?: string;
}

export const EquipePoloService = {
  async listByPolo(poloId?: string): Promise<EquipePoloMember[]> {
    const query = poloId ? `?polo_id=${poloId}` : '';
    return api.get<EquipePoloMember[]>(`/equipes-polos${query}`);
  },

  async getById(id: string): Promise<EquipePoloMember> {
    return api.get<EquipePoloMember>(`/equipes-polos/${id}`);
  },

  async create(data: CreateEquipePoloDto): Promise<EquipePoloMember> {
    return api.post<EquipePoloMember>('/equipes-polos', data);
  },

  async update(id: string, data: Partial<EquipePoloMember>): Promise<EquipePoloMember> {
    return api.patch<EquipePoloMember>(`/equipes-polos/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/equipes-polos/${id}`);
  }
};

export default EquipePoloService;
