import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { isApiError } from '../utils/errorUtils';
import type { Field } from '../types';

export function useFields() {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Field[]>('/campos');
      setFields(res.data);
      setError(null);
    } catch (err: unknown) {
      const message = isApiError(err)
        ? err.response?.data?.message ?? 'Erro desconhecido'
        : 'Erro ao carregar campos';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  return { fields, loading, error, refresh: fetchFields };
}
