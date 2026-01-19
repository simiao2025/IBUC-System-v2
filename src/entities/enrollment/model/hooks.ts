import { useState, useCallback } from 'react';
import { enrollmentApi } from '../api/enrollment.api';
import { EnrollmentFiltros } from './types';

export const useMatricula = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getMatricula = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      return await enrollmentApi.getById(id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch enrollment'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listMatriculas = useCallback(async (params?: EnrollmentFiltros) => {
    setLoading(true);
    setError(null);
    try {
      return await enrollmentApi.list(params);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch enrollments'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getMatricula,
    listMatriculas,
  };
};

export const usePreMatricula = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const listPreMatriculas = useCallback(async (params?: EnrollmentFiltros) => {
    setLoading(true);
    setError(null);
    try {
      return await enrollmentApi.listPreMatriculas(params);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch pre-enrollments'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    listPreMatriculas,
  };
};
