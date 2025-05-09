import type { Field } from "../../types";
import { formatDate } from "../../utils/formatDate";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Edit2, Trash2 } from "lucide-react";

type FieldsTableProps = {
  fields: Field[];
  onEdit: (field: Field) => void;
  onDelete: (id: string) => void;
};

export function FieldsTable({ fields, onEdit, onDelete }: FieldsTableProps) {
  return (
    <div className="relative w-full max-h-[500px] overflow-auto border rounded">
      <Table className="w-full">
        <TableHeader className="sticky top-0 bg-white dark:bg-neutral-700 z-10">
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((f) => (
            <TableRow key={f.id}>
              <TableCell>{f.name}</TableCell>
              <TableCell>{f.datatype}</TableCell>
              <TableCell>{formatDate(f.createdAt)}</TableCell>
              <TableCell>
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => onEdit(f)}
                    aria-label="Editar Preenchimento"
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => onDelete(f.id)}
                    aria-label="Excluir Preenchimento"
                    className="p-1 hover:bg-gray-700 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
