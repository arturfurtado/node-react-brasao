import type { Fill, Field } from '../../types';
import { formatDate } from '../../utils/formatDate';
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
import { Edit2, Trash2 } from 'lucide-react'; 

export type AccordionGroup = Field & { fills: Fill[] };

type FieldsAccordionProps = {
  groups: AccordionGroup[];
  onEditFill: (fill: Fill) => void; 
  onDeleteFill: (fillId: string) => void; 
};

export function FieldsAccordion({
  groups,
  onEditFill,
  onDeleteFill,
}: FieldsAccordionProps) {
  return (
    <ScrollArea className="max-h-[600px] border rounded">
      <Accordion type="multiple" className="w-full">
        {groups.map((field) => (
          <AccordionItem key={field.id} value={field.id}>
            <AccordionTrigger className="flex justify-between px-4 py-2 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200">
              <div>
                <span className="font-medium">{field.name}</span>
                <span className="ml-2 text-sm text-gray-500">
                  ({field.datatype})
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {field.fills.length} preenchimento
                {field.fills.length !== 1 && 's'}
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              {field.fills.length > 0 ? (
                <Table className="w-full">
                  <TableHeader className="bg-neutral-900 sticky top-0">
                    <TableRow>
                      <TableHead>Valor</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead className="text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {field.fills.map((fl) => (
                      <TableRow key={fl.id} className="border-t">
                        <TableCell className="bg-neutral-950">
                          {fl.value}
                        </TableCell>
                        <TableCell className="bg-neutral-950">
                          {formatDate(fl.createdAt)}
                        </TableCell>
                        <TableCell className="bg-neutral-950 flex justify-center space-x-2">
                          <button
                            onClick={() => onEditFill(fl)}
                            aria-label="Editar Preenchimento"
                            className="p-1 hover:bg-gray-700 rounded"
                          >
                            <Edit2 className="w-4 h-4 text-blue-500" />
                          </button>
                          <button
                            onClick={() => onDeleteFill(fl.id)}
                            aria-label="Excluir Preenchimento"
                            className="p-1 hover:bg-gray-700 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="p-4 text-gray-500 dark:text-gray-400">
                  Nenhum preenchimento para este campo.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ScrollArea>
  );
}