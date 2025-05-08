import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Field, Fill } from '../types';
import { toast } from 'react-toastify';
import { isApiError } from '../utils/errorUtils';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function FillsPage() {
  const [fields, setFields] = useState<Field[]>([]);
  const [fills, setFills] = useState<Fill[]>([]);
  const [fieldId, setFieldId] = useState<string>('');
  const [value, setValue] = useState<string>('');

  const fetchData = async () => {
    try {
      const [fRes, flRes] = await Promise.all([
        api.get<Field[]>('/campos'),
        api.get<Fill[]>('/preenchimentos'),
      ]);
      setFields(fRes.data);
      setFills(flRes.data);
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error('Erro ao carregar dados');
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post<Fill>('/preenchimentos', { fieldId, value });
      toast.success('Preenchimento salvo com sucesso!');
      setFieldId('');
      setValue('');
      fetchData();
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error('Erro ao salvar preenchimento');
      }
    }
  };

  const grouped = fields.map(field => ({
    ...field,
    fills: fills
      .filter(f => f.fieldId === field.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
  }));

  return (
    <div>
      <h1 className="text-2xl mb-4">Campos e Preenchimentos</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <select
          value={fieldId}
          onChange={(e) => setFieldId(e.target.value)}
          className="border p-2 rounded bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
          required
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
              className="border p-2 rounded bg-white dark:bg-neutral-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              required
            />
            <button type="submit" className="bg-zinc-900 text-white p-2 rounded hover:bg-neutral-950">
              Salvar Preenchimento
            </button>
          </>
        )}
      </form>

      <ScrollArea className="max-h-[600px] border rounded">
        <Accordion type="multiple" className="w-full">
          {grouped.map(field => (
            <AccordionItem key={field.id} value={field.id}>
              <AccordionTrigger className="flex justify-between px-4 py-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200">
                <div>
                  <span className="font-medium">{field.name}</span>
                  <span className="ml-2 text-sm text-gray-500">({field.datatype})</span>
                </div>
                <div className="text-sm text-gray-500">
                  {field.fills.length} preenchimento{field.fills.length !== 1 && 's'}
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-0">
                {field.fills.length > 0 ? (
                  <Table className="w-full">
                    <TableHeader className="bg-neutral-900">
                      <TableRow>
                        <TableHead>Valor</TableHead>
                        <TableHead>Criado em</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {field.fills.map(fl => (
                        <TableRow key={fl.id} className="border-t">
                          <TableCell className='bg-neutral-950'>{fl.value}</TableCell>
                          <TableCell className='bg-neutral-950'>{new Date(fl.createdAt).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="p-4 text-gray-500">Nenhum preenchimento para este campo.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
}
