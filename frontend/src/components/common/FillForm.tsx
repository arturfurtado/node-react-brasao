import { useState, useCallback } from 'react';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { isApiError } from '../../utils/errorUtils';
import type { Field, Fill } from '../../types';

type FillFormProps = {
  fields: Field[];
  onSaved: () => void;
};

export function FillForm({ fields, onSaved }: FillFormProps) {
  const [fieldId, setFieldId] = useState('');
  const [value, setValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post<Fill>('/preenchimentos', { fieldId, value });
      toast.success('Preenchimento salvo com sucesso!');
      setFieldId('');
      setValue('');
      onSaved();
    } catch (err: unknown) {
      const message = isApiError(err)
        ? err.response?.data?.message ?? 'Erro desconhecido'
        : 'Erro ao salvar preenchimento';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }, [fieldId, value, onSaved]);

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
    >
      <select
        value={fieldId}
        onChange={(e) => setFieldId(e.target.value)}
        className="border p-2 rounded bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
        required
        disabled={submitting}
      >
        <option value="">Selecione um campo</option>
        {fields.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>

      {fieldId && (
        <>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Valor"
            className="border p-2 rounded bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
            required
            disabled={submitting}
          />
          <button
            type="submit"
            className="bg-zinc-900 text-white p-2 rounded hover:bg-neutral-950 disabled:opacity-50"
            disabled={submitting}
          >
            {submitting ? 'Salvando…' : 'Salvar Preenchimento'}
          </button>
        </>
      )}
    </form>
  );
}
