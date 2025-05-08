import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Field, DataType } from '../types';
import { toast } from 'react-toastify';
import { isApiError } from '../utils/errorUtils';

import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

const FieldsPage: React.FC = () => {
  const [name, setName] = useState('');
  const [datatype, setDatatype] = useState<DataType>('string');
  const [fields, setFields] = useState<Field[]>([]);

  const fetchFields = async () => {
    try {
      const res = await api.get<Field[]>('/campos');
      setFields(res.data);
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.response!.data!.message!);
      } else {
        toast.error('Erro ao carregar campos');
      }
    }
  };

  useEffect(() => {
    fetchFields();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post<Field>('/campos', { name, datatype });
      toast.success('Campo salvo com sucesso!');
      setName('');
      setDatatype('string');
      fetchFields();
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.response!.data!.message!);
      } else {
        toast.error('Erro ao salvar o campo');
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl mb-4">Gerenciar Campos</h1>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome"
          className="border p-2 rounded bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
          required
        />

        <select
          value={datatype}
          onChange={(e) => setDatatype(e.target.value as DataType)}
          className="border p-2 rounded bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
        >
          <option value="string">String</option>
          <option value="number">Número</option>
          <option value="boolean">Booleano</option>
          <option value="date">Data</option>
        </select>

        <button
          type="submit"
          className="bg-zinc-900 text-white p-2 rounded hover:bg-neutral-950 transition-all"
        >
          Salvar Campo
        </button>
      </form>

      <ScrollArea className="max-h-[500px] border rounded overflow-y-scroll">
        <Table className="w-full">

          <TableHeader className="sticky top-0 bg-white dark:bg-neutral-700">
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Criado em</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {fields.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.name}</TableCell>
                <TableCell>{f.datatype}</TableCell>
                <TableCell>
                  {new Date(f.createdAt).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default FieldsPage;
