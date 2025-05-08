import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'
import { toast } from 'react-toastify'
import { isApiError } from '../utils/errorUtils'
import { FieldsResponseSchema } from '../schemas'
import type { Field } from '../types'

export function useFields() {
  const [fields, setFields]   = useState<Field[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const fetchFields = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/campos')
      const parsed = FieldsResponseSchema.safeParse(res.data)
      if (!parsed.success) {
        console.error(parsed.error)
        throw new Error('Formato de campos inválido')
      }
      setFields(parsed.data)
      setError(null)
    } catch (err: unknown) {
      const msg = isApiError(err)
        ? err.response?.data?.message ?? 'Erro desconhecido'
        : err instanceof Error
          ? err.message
          : 'Erro ao carregar campos'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteField = useCallback(async (id: string) => {
    try {
      await api.delete(`/campos/${id}`)
      toast.success('Campo excluído com sucesso!')
      await fetchFields()
    } catch (err: unknown) {
      const msg = isApiError(err)
        ? err.response?.data?.message ?? 'Erro desconhecido'
        : err instanceof Error
          ? err.message
          : 'Erro ao excluir campo'
      toast.error(msg)
    }
  }, [fetchFields])

  const updateField = useCallback(
    async (id: string, data: { name: string; datatype: string }) => {
      try {
        await api.put(`/campos/${id}`, data)
        toast.success('Campo atualizado com sucesso!')
        await fetchFields()
      } catch (err: unknown) {
        const msg = isApiError(err)
          ? err.response?.data?.message ?? 'Erro desconhecido'
          : err instanceof Error
            ? err.message
            : 'Erro ao atualizar campo'
        toast.error(msg)
      }
    },
    [fetchFields]
  )

  useEffect(() => {
    fetchFields()
  }, [fetchFields])

  return {
    fields,
    loading,
    error,
    refresh: fetchFields,
    deleteField,
    updateField,
  }
}
