import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { toast } from 'react-toastify';
import { isApiError } from '../utils/errorUtils';
import { FillsResponseSchema, FillPostSchema } from '../schemas'; // Importar FillPostSchema
import type { z } from 'zod'; // Importar z para inferir o tipo
import type { Fill } from '../types';

// Tipo para os dados enviados ao criar/atualizar um preenchimento
type FillPostData = z.infer<typeof FillPostSchema>;

export function useFills() {
  const [fills, setFills] = useState<Fill[]>([]);
  const [loading, setLoading] = useState(false); // Inicializar como false, fetchFills definirá como true
  const [error, setError] = useState<string | null>(null);

  // Função de tratamento de erro reutilizável (similar ao useFields)
  const handleError = (err: unknown, defaultMessage: string) => {
    let message = defaultMessage;
    if (isApiError(err)) {
      message = err.response?.data?.message ?? message;
    } else if (err instanceof Error && 'errors' in err && Array.isArray((err as any).errors)) {
      // Especificamente para erros de validação do Zod na resposta, se aplicável
      message = 'Resposta da API em formato inesperado ou inválido.';
    } else if (err instanceof Error) {
      message = err.message;
    }
    setError(message);
    toast.error(message);
  };

  const fetchFills = useCallback(async () => {
    setLoading(true);
    setError(null); // Limpar erro anterior ao tentar buscar novamente
    try {
      const res = await api.get('/preenchimentos');
      const parsed = FillsResponseSchema.safeParse(res.data); // Usar safeParse para melhor tratamento de erro
      if (!parsed.success) {
        // console.error("Validation errors:", parsed.error.flatten().fieldErrors); // Log detalhado do erro de validação
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
        await fetchFills(); // Rebusca os dados para atualizar a lista
      } catch (err) {
        handleError(err, 'Erro ao excluir preenchimento');
      } finally {
        setLoading(false);
      }
    },
    [fetchFills] // fetchFills é estável devido ao useCallback
  );

  const updateFill = useCallback(
    async (id: string, data: FillPostData) => {
      setLoading(true);
      try {
        await api.put(`/preenchimentos/${id}`, data);
        toast.success('Preenchimento atualizado com sucesso!');
        await fetchFills(); // Rebusca os dados para atualizar a lista
      } catch (err) {
        handleError(err, 'Erro ao atualizar preenchimento');
      } finally {
        setLoading(false);
      }
    },
    [fetchFills] // fetchFills é estável
  );

  return {
    fills,
    loading,
    error,
    refresh: fetchFills,
    deleteFill, // Expor a nova função
    updateFill, // Expor a nova função
  };
}