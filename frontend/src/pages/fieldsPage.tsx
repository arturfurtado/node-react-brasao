import { useState } from "react";
import { useFields } from "../hooks/useFields";
import { FieldForm } from "../components/common/fieldForm";
import { FieldsTable } from "../components/common/fieldsTable";
import type { Field } from "../types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

export default function FieldsPage() {
  const { fields, loading, error, refresh, deleteField } = useFields();

  const [editing, setEditing] = useState<Field | null>(null);

  const handleEditClick = (field: Field) => {
    setEditing(field);
  };

  const handleSaved = () => {
    setEditing(null);
    refresh();
  };

  return (
    <div>
      <h1 className="text-2xl mb-4">Gerenciar Campos</h1>

      <FieldForm onSaved={refresh} />

      {loading && <p>Carregando campos…</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {!loading && !error && fields.length > 0 && (
        <FieldsTable
          fields={fields}
          onEdit={handleEditClick}
          onDelete={deleteField}
        />
      )}
      {!loading && !error && fields.length === 0 && (
        <p className="text-gray-500">Nenhum campo cadastrado.</p>
      )}

      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Campo</DialogTitle>
            <DialogDescription>
              Altere o nome e o tipo do campo.
            </DialogDescription>
          </DialogHeader>

          <p className="text-red-700 bg-neutral-900 p-3 rounded mb-4">
            <strong>Atenção:</strong> Não é possível alterar o tipo de um campo que já possui preenchimentos. Apague-os ou crie um novo campo.
          </p>

          {editing && (
            <FieldForm
              editingField={editing}
              onSaved={handleSaved}
              onCancelEdit={() => setEditing(null)}
            />
          )}

          <DialogClose className="absolute top-4 right-4" aria-label="Fechar"/>
        </DialogContent>
      </Dialog>
    </div>
  );
}
