import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { isApiError } from '../utils/errorUtils';
import type { Fill } from '../types';

export function useFills() {
  const [fills, setFills] = useState<Fill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Fill[]>('/preenchimentos');
      setFills(res.data);
      setError(null);
    } catch (err: unknown) {
      const message = isApiError(err)
        ? err.response?.data?.message ?? 'Erro desconhecido'
        : 'Erro ao carregar preenchimentos';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFills();
  }, [fetchFills]);

  return { fills, loading, error, refresh: fetchFills };
}
