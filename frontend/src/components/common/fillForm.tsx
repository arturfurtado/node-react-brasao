import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FillPostSchema } from '../../schemas';
import type { z } from 'zod';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { isApiError } from '../../utils/errorUtils';
import type { Field, Fill } from '../../types'; 

type FormData = z.infer<typeof FillPostSchema>;

type FillFormProps = {
  fields: Field[];
  onSaved: () => void;
  editingFill?: Fill; 
  onCancelEdit?: () => void; 
};

export function FillForm({
  fields,
  onSaved,
  editingFill,
  onCancelEdit,
}: FillFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(FillPostSchema),
    defaultValues: editingFill
      ? {
          fieldId: editingFill.fieldId,
          value: editingFill.value,
        }
      : {
          fieldId: '', 
          value: '',
        },
  });

  useEffect(() => {
    if (editingFill) {
      reset({
        fieldId: editingFill.fieldId,
        value: editingFill.value,
      });
    } else {
      
      reset({ fieldId: '', value: '' });
    }
  }, [editingFill, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (editingFill) {
        await api.put(`/preenchimentos/${editingFill.id}`, data);
        toast.success('Preenchimento atualizado com sucesso!');
      } else {
        await api.post('/preenchimentos', data);
        toast.success('Preenchimento salvo com sucesso!');
      }
      onSaved();
      if (editingFill && onCancelEdit) {
        onCancelEdit();
      }
    } catch (err: unknown) {
      const msg = isApiError(err)
        ? err.response?.data?.message ?? 'Erro desconhecido'
        : editingFill
        ? 'Erro ao atualizar preenchimento'
        : 'Erro ao salvar preenchimento';
      toast.error(msg);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
    >
      <div>
        <select
          {...register('fieldId')}
          className="border p-2 rounded w-full dark:bg-zinc-800"
          disabled={isSubmitting || !!editingFill} 
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

      <div className="md:col-span-1 flex flex-col space-y-2 md:space-y-0 md:flex-row md:space-x-2">
        <button
          type="submit"
          className="bg-zinc-900 text-white p-2 rounded w-full disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? editingFill
              ? 'Atualizando…'
              : 'Salvando…'
            : editingFill
            ? 'Atualizar' 
            : 'Salvar Preenchimento'}
        </button>
        {editingFill && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="border p-2 rounded w-full"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}