import type { Field } from '../../types';
import { formatDate } from '../../utils/formatDate';
import {
  Table, TableHeader, TableHead, TableBody, TableRow, TableCell,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

type FieldsTableProps = { fields: Field[] };

export function FieldsTable({ fields }: FieldsTableProps) {
  return (
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
              <TableCell>{formatDate(f.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
