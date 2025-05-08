import { useState, useCallback } from 'react';
import { api } from '../../services/api';
import { toast } from 'react-toastify';
import { isApiError } from '../../utils/errorUtils';
import type { Field, DataType } from '../../types';

type FieldFormProps = { onSaved: () => void };

export function FieldForm({ onSaved }: FieldFormProps) {
  const [name, setName] = useState('');
  const [datatype, setDatatype] = useState<DataType>('string');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        await api.post<Field>('/campos', { name, datatype });
        toast.success('Campo salvo com sucesso!');
        setName('');
        setDatatype('string');
        onSaved();
      } catch (err: unknown) {
        const message = isApiError(err)
          ? err.response?.data?.message ?? 'Erro desconhecido'
          : 'Erro ao salvar o campo';
        toast.error(message);
      } finally {
        setSubmitting(false);
      }
    },
    [name, datatype, onSaved]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
    >
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome"
        className="border p-2 rounded bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
        required
        disabled={submitting}
      />

      <select
        value={datatype}
        onChange={(e) => setDatatype(e.target.value as DataType)}
        className="border p-2 rounded bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100"
        disabled={submitting}
      >
        <option value="string">String</option>
        <option value="number">Número</option>
        <option value="boolean">Booleano</option>
        <option value="date">Data</option>
      </select>

      <button
        type="submit"
        className="bg-zinc-900 text-white p-2 rounded hover:bg-neutral-950 transition-all disabled:opacity-50"
        disabled={submitting}
      >
        {submitting ? 'Salvando…' : 'Salvar Campo'}
      </button>
    </form>
  );
}
