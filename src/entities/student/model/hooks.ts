import { useState, useCallback } from 'react';
import { studentApi } from '../api/student.api';
import { AlunoFiltros } from './types';

export const useStudent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getStudent = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      return await studentApi.getById(id);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch student'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listStudents = useCallback(async (params?: AlunoFiltros) => {
    setLoading(true);
    setError(null);
    try {
      return await studentApi.list(params);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch students'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getStudent,
    listStudents,
  };
};

export const useStudentHistory = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const getHistory = useCallback(async (studentId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await studentApi.getHistory(studentId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch student history'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getHistory,
  };
};
