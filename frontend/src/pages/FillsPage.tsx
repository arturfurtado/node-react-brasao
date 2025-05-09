import { useState, useMemo, useCallback } from 'react';
import { useFields } from '../hooks/useFields';
import { useFills } from '../hooks/useFills';
import { FillForm } from '../components/common/FillForm';
import {
  FieldsAccordion,
  type AccordionGroup,
} from '../components/common/FieldsAccordion';
import type { Fill } from '../types';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

export default function FillsPage() {
  const {
    fields,
    loading: loadingFields,
    error: errorFields,
  } = useFields();
  const {
    fills,
    loading: loadingFills,
    error: errorFills,
    refresh: refreshFills,
    deleteFill,
  } = useFills();

  const [editingFill, setEditingFill] = useState<Fill | null>(null);

  const loading = loadingFields || loadingFills;
  const error = errorFields ?? errorFills;

  const groups = useMemo<AccordionGroup[]>(() => {
    return fields.map((fld) => ({
      ...fld,
      fills: fills
        .filter((f) => f.fieldId === fld.id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    }));
  }, [fields, fills]);

  const handleNewFillSaved = useCallback(() => {
    refreshFills();
  }, [refreshFills]);

  const handleEditFillClick = (fill: Fill) => {
    setEditingFill(fill);
  };

  const handleFillSavedInModal = () => {
    setEditingFill(null);
    refreshFills();
  };

  const handleCancelEditFill = () => {
    setEditingFill(null);
  };

  const handleDeleteFill = async (fillId: string) => {
    await deleteFill(fillId);
  };

  return (
    <div data-testid="fill-form">
      <h1 className="text-2xl mb-4">Gerenciar Preenchimentos</h1>

      <h2 className="text-xl mb-2 mt-6">Novo Preenchimento</h2>
      <FillForm fields={fields} onSaved={handleNewFillSaved} />

      <h2 className="text-xl mb-2 mt-8">Campos e Seus Preenchimentos</h2>
      {loading && <p>Carregando dados…</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!loading && !error && groups.length > 0 && (
        <FieldsAccordion
          groups={groups}
          onEditFill={handleEditFillClick}
          onDeleteFill={handleDeleteFill}
        />
      )}
      {!loading && !error && groups.length === 0 && fields.length > 0 && (
        <p className="text-gray-500 dark:text-gray-400">
          Nenhum preenchimento cadastrado ainda. Crie um acima ou selecione um campo.
        </p>
      )}
      {!loading && !error && fields.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">
          Nenhum campo cadastrado. Crie campos na página "Gerenciar Campos" primeiro.
        </p>
      )}

      <Dialog open={!!editingFill} onOpenChange={(open) => !open && setEditingFill(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Preenchimento</DialogTitle>
            <DialogDescription>
              Altere o valor do preenchimento. O campo associado não pode ser alterado.
            </DialogDescription>
          </DialogHeader>

          {editingFill && (
            <FillForm
              fields={fields}
              editingFill={editingFill}
              onSaved={handleFillSavedInModal}
              onCancelEdit={handleCancelEditFill}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
