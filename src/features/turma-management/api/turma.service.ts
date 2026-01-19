import { turmaApi } from '@/entities/turma';

// Types for the feature
export interface TurmaItem {
  id: string;
  nome: string;
  polo_id: string;
  nivel_id: string;
  professor_id: string | null;
  capacidade: number;
  ano_letivo: number;
  turno: 'manha' | 'tarde' | 'noite';
  status: 'ativa' | 'inativa' | 'concluida';
  modulo_atual_id?: string;
  created_at?: string;
}

// Aliases for compatibility with existing components
export const TurmasAPI = {
  listar: (filters?: any) => turmaApi.list(filters),
  buscarPorId: (id: string) => turmaApi.getById(id),
  criar: (data: any) => turmaApi.create(data),
  atualizar: (id: string, data: any) => turmaApi.update(id, data),
  deletar: (id: string) => turmaApi.delete(id),
  trazerAlunos: (id: string, moduloAnteriorNumero: number) => turmaApi.trazerAlunos(id, moduloAnteriorNumero),
};

export const NiveisAPI = {
  listar: () => turmaApi.listNiveis(),
};

// Also export as TurmaService for components like BatchClosureModal and ModuleTransitionWizard
export const TurmaService = {
  previewTransicao: (id: string) => turmaApi.previewTransition(id),
  encerrarModulo: (id: string, data: { alunos_confirmados: string[]; valor_cents?: number }) => 
    turmaApi.closeModule(id, data),
  listarTurmas: (filters?: any) => turmaApi.list(filters),
  listarNiveis: () => turmaApi.listNiveis(),
};
