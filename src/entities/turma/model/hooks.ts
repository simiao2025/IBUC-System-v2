import { useState, useCallback } from 'react';
import { turmaApi } from '../api/turma.api';
import { TurmaFiltros } from './types';

export const useClassList = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const listClasses = useCallback(async (params?: TurmaFiltros) => {
    setLoading(true);
    setError(null);
    try {
      return await turmaApi.list(params);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch classes'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    listClasses,
  };
};

export const useNiveis = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const listNiveis = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await turmaApi.listNiveis();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch levels'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    listNiveis,
  };
};
