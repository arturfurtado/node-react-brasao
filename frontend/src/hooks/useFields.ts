import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import { toast } from 'react-toastify'
import { isApiError } from '../utils/errorUtils'
import { FieldsResponseSchema } from '@/schemas' 
import type { Field } from '@/types' 

export function useFields() {
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const handleError = (err: unknown) => {
    let message = 'Unknown error'
    if (isApiError(err)) {
      message = err.response?.data?.message ?? message
    } else if (err instanceof Error) {
      message = err.message
    }
    setError(message)
    toast.error(message)
  }

  const fetchFields = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get<Field[]>('/campos')
      const parsed = FieldsResponseSchema.safeParse(res.data)
      if (!parsed.success) {
        throw new Error('Formato de campos inválido')
      }
      setFields(parsed.data)
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFields()
  }, [fetchFields])

  const deleteField = useCallback(
    async (id: string) => {
      setLoading(true)
      try {
        await api.delete(`/campos/${id}`)
        toast.success('Campo excluído com sucesso!')
        await fetchFields()
      } catch (err) {
        handleError(err)
      } finally {
        setLoading(false)
      }
    },
    [fetchFields]
  )

  const updateField = useCallback(
    async (id: string, data: { name: string; datatype: Field['datatype'] }) => {
      setLoading(true)
      try {
        await api.put(`/campos/${id}`, data)
        toast.success('Campo atualizado com sucesso!')
        await fetchFields()
      } catch (err) {
        handleError(err)
      } finally {
        setLoading(false)
      }
    },
    [fetchFields]
  )

  const refresh = useCallback(async () => {
    await fetchFields()
  }, [fetchFields])

  return {
    fields,
    loading,
    error,
    deleteField,
    updateField,
    refresh,
  }
}
