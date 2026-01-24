import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '../api/student.api';
import { QUERY_KEYS } from '@/shared/api/query-keys';
import { toast } from 'sonner';

/**
 * Hook para listagem de alunos com cache e filtros.
 */
export function useStudents(filters: any = {}) {
  const filterKey = JSON.stringify(filters);
  
  return useQuery({
    queryKey: QUERY_KEYS.alunos.list(filterKey),
    queryFn: () => studentApi.list(filters),
  });
}

/**
 * Hook para busca de um aluno específico.
 */
export function useStudent(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.alunos.detail(id),
    queryFn: () => studentApi.getById(id),
    enabled: !!id,
  });
}

/**
 * Hook para gerenciar mutações de alunos (Create, Update, Delete).
 */
export function useStudentMutations() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: studentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.all });
      toast.success('Aluno cadastrado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao cadastrar aluno: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => studentApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.all });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.detail(variables.id) });
      toast.success('Dados do aluno atualizados!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar aluno: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: studentApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.alunos.all });
      toast.success('Aluno removido do sistema.');
    },
    onError: (error: any) => {
      toast.error(`Erro ao remover aluno: ${error.message}`);
    },
  });

  return {
    createStudent: createMutation.mutateAsync,
    updateStudent: updateMutation.mutateAsync,
    deleteStudent: deleteMutation.mutateAsync,
    isSubmitting: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  };
}
