import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FieldPostSchema } from '../../schemas'
import type { z } from 'zod'
import { api } from '../../services/api'
import { toast } from 'react-toastify'
import { isApiError } from '../../utils/errorUtils'

type FormData = z.infer<typeof FieldPostSchema>
type FieldFormProps = { onSaved: () => void }

export function FieldForm({ onSaved }: FieldFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(FieldPostSchema),
  })

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/campos', data)
      toast.success('Campo salvo com sucesso!')
      onSaved()
    } catch (err: unknown) {
      const msg = isApiError(err)
        ? err.response?.data?.message ?? 'Erro desconhecido'
        : 'Erro ao salvar o campo'
      toast.error(msg)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <input
          {...register('name')}
          placeholder="Nome"
          className="border p-2 rounded w-full"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <select
          {...register('datatype')}
          className="border p-2 rounded w-full"
          disabled={isSubmitting}
        >
          <option value="string">String</option>
          <option value="number">Número</option>
          <option value="boolean">Booleano</option>
          <option value="date">Data</option>
        </select>
        {errors.datatype && (
          <p className="text-red-600 text-sm mt-1">{errors.datatype.message}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          className="bg-zinc-900 text-white p-2 rounded w-full disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando…' : 'Salvar Campo'}
        </button>
      </div>
    </form>
  )
}
