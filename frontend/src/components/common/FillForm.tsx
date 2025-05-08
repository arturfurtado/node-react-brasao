import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FillPostSchema } from '../../schemas'
import type { z } from 'zod'
import { api } from '../../services/api'
import { toast } from 'react-toastify'
import { isApiError } from '../../utils/errorUtils'
import type { Field } from '../../types'

type FormData = z.infer<typeof FillPostSchema>

type FillFormProps = {
  fields: Field[]
  onSaved: () => void
}

export function FillForm({ fields, onSaved }: FillFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(FillPostSchema)
  })

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/preenchimentos', data)
      toast.success('Preenchimento salvo com sucesso!')
      onSaved()
    } catch (err: unknown) {
      const msg = isApiError(err)
        ? err.response?.data?.message ?? 'Erro desconhecido'
        : 'Erro ao salvar preenchimento'
      toast.error(msg)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
    >
      <div>
        <select
          {...register('fieldId')}
          className="border p-2 rounded w-full"
          disabled={isSubmitting}
        >
          <option value="">Selecione um campo</option>
          {fields.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
        {errors.fieldId && (
          <p className="text-red-600 text-sm mt-1">
            {errors.fieldId.message}
          </p>
        )}
      </div>

      <div>
        <input
          {...register('value')}
          type="text"
          placeholder="Valor"
          className="border p-2 rounded w-full"
          disabled={isSubmitting}
        />
        {errors.value && (
          <p className="text-red-600 text-sm mt-1">
            {errors.value.message}
          </p>
        )}
      </div>

      <div>
        <button
          type="submit"
          className="bg-zinc-900 text-white p-2 rounded w-full disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Salvando…' : 'Salvar Preenchimento'}
        </button>
      </div>
    </form>
  )
}
