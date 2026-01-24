import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentApi } from '../api/enrollment.api';
import { QUERY_KEYS } from '@/shared/api/query-keys';
import { EnrollmentFiltros } from '../model/types';
import { toast } from 'sonner';

/**
 * Hook para listagem de matrículas ativas.
 */
export function useEnrollments(filters: EnrollmentFiltros = {}) {
  const filterKey = JSON.stringify(filters);
  
  return useQuery({
    queryKey: QUERY_KEYS.matriculas.list(filterKey),
    queryFn: () => enrollmentApi.list(filters),
  });
}

/**
 * Hook para listagem de pré-matrículas (em análise).
 */
export function usePreEnrollments(filters: EnrollmentFiltros = {}) {
  const filterKey = `pre_${JSON.stringify(filters)}`;
  
  return useQuery({
    queryKey: QUERY_KEYS.matriculas.list(filterKey),
    queryFn: () => enrollmentApi.listPreMatriculas(filters),
  });
}

/**
 * Hook para gerenciar o ciclo de vida das matrículas.
 */
export function useEnrollmentMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: enrollmentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matriculas.all });
      toast.success('Matrícula realizada!');
    },
    onError: (err: any) => toast.error(`Erro: ${err.message}`),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      enrollmentApi.updateStatus(id, status as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.matriculas.all });
      toast.success('Status da matrícula atualizado.');
    },
    onError: (err: any) => toast.error(`Erro ao mudar status: ${err.message}`),
  });

  return {
    createEnrollment: createMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    isSubmitting: createMutation.isPending || updateStatusMutation.isPending,
  };
}
