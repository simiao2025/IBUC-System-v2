/**
 * Chaves de consulta padronizadas para o TanStack Query.
 * Segue o padrão: [entidade, 'lista' | 'detalhe', filtros | id]
 */
export const QUERY_KEYS = {
  alunos: {
    all: ['alunos'] as const,
    lists: () => [...QUERY_KEYS.alunos.all, 'list'] as const,
    list: (filters: string) => [...QUERY_KEYS.alunos.lists(), { filters }] as const,
    details: () => [...QUERY_KEYS.alunos.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.alunos.details(), id] as const,
  },
  matriculas: {
    all: ['matriculas'] as const,
    lists: () => [...QUERY_KEYS.matriculas.all, 'list'] as const,
    list: (filters: string) => [...QUERY_KEYS.matriculas.lists(), { filters }] as const,
    details: () => [...QUERY_KEYS.matriculas.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.matriculas.details(), id] as const,
  },
  polos: {
    all: ['polos'] as const,
    list: () => [...QUERY_KEYS.polos.all, 'list'] as const,
  },
  turmas: {
    all: ['turmas'] as const,
    list: (filters: any) => [...QUERY_KEYS.turmas.all, 'list', { filters }] as const,
  }
};
