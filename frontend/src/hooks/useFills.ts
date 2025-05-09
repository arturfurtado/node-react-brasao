import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { isApiError } from '../utils/errorUtils';
import { FillsResponseSchema, FillPostSchema } from '../schemas'; 
import type { z } from 'zod';
import type { Fill } from '../types';

type FillPostData = z.infer<typeof FillPostSchema>;

export function useFills() {
  const [fills, setFills] = useState<Fill[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown, defaultMessage: string) => {
    let message = defaultMessage;
    if (isApiError(err)) {
      message = err.response?.data?.message ?? message;
    } else if (err instanceof Error && 'errors' in err && Array.isArray((err as any).errors)) {
      message = 'Resposta da API em formato inesperado ou inválido.';
    } else if (err instanceof Error) {
      message = err.message;
    }
    setError(message);
    toast.error(message);
  };

  const fetchFills = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/preenchimentos');
      const parsed = FillsResponseSchema.safeParse(res.data); 
      if (!parsed.success) {
        throw new Error('Dados de preenchimentos inválidos recebidos da API.');
      }
      setFills(parsed.data);
    } catch (err: unknown) {
      handleError(err, 'Erro ao carregar preenchimentos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFills();
  }, [fetchFills]);

  const deleteFill = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        await api.delete(`/preenchimentos/${id}`);
        toast.success('Preenchimento excluído com sucesso!');
        await fetchFills(); 
      } catch (err) {
        handleError(err, 'Erro ao excluir preenchimento');
      } finally {
        setLoading(false);
      }
    },
    [fetchFills]
  );

  const updateFill = useCallback(
    async (id: string, data: FillPostData) => {
      setLoading(true);
      try {
        await api.put(`/preenchimentos/${id}`, data);
        toast.success('Preenchimento atualizado com sucesso!');
        await fetchFills();
      } catch (err) {
        handleError(err, 'Erro ao atualizar preenchimento');
      } finally {
        setLoading(false);
      }
    },
    [fetchFills] 
  );

  return {
    fills,
    loading,
    error,
    refresh: fetchFills,
    deleteFill,
    updateFill,
  };
}