import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import { toast } from 'react-toastify'
import { isApiError } from '../utils/errorUtils'
import { FillsResponseSchema } from '../schemas'
import type { Fill } from '../types'

export function useFills() {
  const [fills, setFills]   = useState<Fill[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const fetchFills = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/preenchimentos')
      const parsed = FillsResponseSchema.parse(res.data)
      setFills(parsed)
      setError(null)
    } catch (err: unknown) {
      if (err instanceof Error && 'errors' in err) {
        toast.error('Dados de preenchimentos inválidos')
        setError('Resposta da API em formato inesperado')
      } else {
        const msg = isApiError(err)
          ? err.response?.data?.message ?? 'Erro desconhecido'
          : 'Erro ao carregar preenchimentos'
        toast.error(msg)
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFills()
  }, [fetchFills])

  return { fills, loading, error, refresh: fetchFills }
}
