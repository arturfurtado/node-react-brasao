/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';

import { FieldsTable } from '../src/components/common/fieldsTable';
import type { Field } from '../src/types';

import { formatDate } from '../src/utils/formatDate';
import React from 'react';

vi.mock('../src/utils/formatDate', () => ({
  formatDate: vi.fn(), 
}));

vi.mock('lucide-react', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('lucide-react')>();
  return {
    ...originalModule,
    Edit2: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="edit-icon" {...props} />,
    Trash2: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="trash-icon" {...props} />,
  };
});

const mockedFormatDate = vi.mocked(formatDate); 

describe('FieldsTable Component', () => {
  const mockFieldsData: Field[] = [
    {
      id: 'field-1',
      name: 'Nome do Cliente',
      datatype: 'string',
      createdAt: '2024-01-15T10:00:00.000Z',
    },
    {
      id: 'field-2',
      name: 'Idade do Pet',
      datatype: 'number',
      createdAt: '2024-02-20T11:30:00.000Z',
    },
    {
      id: 'field-3',
      name: 'Receber Newsletter',
      datatype: 'boolean',
      createdAt: '2024-03-10T09:00:00.000Z',
    },
  ];

  let onEditMock: ReturnType<typeof vi.fn>;
  let onDeleteMock: ReturnType<typeof vi.fn>;


  beforeEach(() => {
    vi.clearAllMocks();

    mockedFormatDate.mockImplementation((dateStr: string) => `formatted-${dateStr}`);

    onEditMock = vi.fn();
    onDeleteMock = vi.fn();
  });

  it('renderiza os cabeçalhos da tabela corretamente, mesmo sem campos', () => {
    render(<FieldsTable fields={[]} onEdit={onEditMock} onDelete={onDeleteMock} />);

    expect(screen.getByRole('columnheader', { name: 'Nome' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Tipo' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Criado em' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Ações' })).toBeInTheDocument();

    const dataCells = screen.queryAllByRole('cell');
    expect(dataCells).toHaveLength(0);
  });

  it('renderiza corretamente com um único campo', () => {
    const singleFieldArray = [mockFieldsData[0]];
    render(<FieldsTable fields={singleFieldArray} onEdit={onEditMock} onDelete={onDeleteMock} />);

    const field = singleFieldArray[0];
    const row = screen.getByRole('row', { name: new RegExp(field.name, 'i') }); 

    expect(within(row).getByText(field.name)).toBeInTheDocument();
    expect(within(row).getByText(field.datatype)).toBeInTheDocument();
    expect(within(row).getByText(`formatted-${field.createdAt}`)).toBeInTheDocument();
    expect(mockedFormatDate).toHaveBeenCalledWith(field.createdAt);

    const editButton = within(row).getByRole('button', { name: 'Editar' });
    const deleteButton = within(row).getByRole('button', { name: 'Excluir' });
    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
    expect(within(editButton).getByTestId('edit-icon')).toBeInTheDocument();
    expect(within(deleteButton).getByTestId('trash-icon')).toBeInTheDocument();
  });

  it('renderiza corretamente com múltiplos campos', () => {
    render(<FieldsTable fields={mockFieldsData} onEdit={onEditMock} onDelete={onDeleteMock} />);

    expect(screen.getAllByRole('row')).toHaveLength(mockFieldsData.length + 1);

    mockFieldsData.forEach((field) => {
      const rowCellWithName = screen.getByRole('cell', { name: field.name });
      const row = rowCellWithName.closest('tr');
      expect(row).toBeInTheDocument();

      if (row) {
        expect(within(row).getByText(field.name)).toBeInTheDocument();
        expect(within(row).getByText(field.datatype)).toBeInTheDocument();
        expect(within(row).getByText(`formatted-${field.createdAt}`)).toBeInTheDocument();
        expect(mockedFormatDate).toHaveBeenCalledWith(field.createdAt);
        expect(within(row).getByRole('button', { name: 'Editar' })).toBeInTheDocument();
        expect(within(row).getByRole('button', { name: 'Excluir' })).toBeInTheDocument();
      }
    });

    expect(mockedFormatDate).toHaveBeenCalledTimes(mockFieldsData.length);
  });

  it('chama onEdit com o campo correto ao clicar no botão de editar', () => {
    render(<FieldsTable fields={mockFieldsData} onEdit={onEditMock} onDelete={onDeleteMock} />);

    const fieldToEdit = mockFieldsData[1]; 
    const rowCellWithName = screen.getByRole('cell', { name: fieldToEdit.name });
    const row = rowCellWithName.closest('tr');
    expect(row).toBeInTheDocument();

    if (row) {
      const editButton = within(row).getByRole('button', { name: 'Editar' });
      fireEvent.click(editButton);
    }

    expect(onEditMock).toHaveBeenCalledTimes(1);
    expect(onEditMock).toHaveBeenCalledWith(fieldToEdit);
    expect(onDeleteMock).not.toHaveBeenCalled();
  });

  it('chama onDelete com o ID correto ao clicar no botão de excluir', () => {
    render(<FieldsTable fields={mockFieldsData} onEdit={onEditMock} onDelete={onDeleteMock} />);

    const fieldToDelete = mockFieldsData[0]; 
    const rowCellWithName = screen.getByRole('cell', { name: fieldToDelete.name });
    const row = rowCellWithName.closest('tr');
    expect(row).toBeInTheDocument();

    if (row) {
      const deleteButton = within(row).getByRole('button', { name: 'Excluir' });
      fireEvent.click(deleteButton);
    }

    expect(onDeleteMock).toHaveBeenCalledTimes(1);
    expect(onDeleteMock).toHaveBeenCalledWith(fieldToDelete.id);
    expect(onEditMock).not.toHaveBeenCalled();
  });

  it('renderiza ScrollArea com as classes de estilização corretas', () => {
    const { container } = render(
      <FieldsTable fields={[]} onEdit={onEditMock} onDelete={onDeleteMock} />
    );

    const scrollAreaElement = container.firstChild as HTMLElement;

    expect(scrollAreaElement).toHaveClass('max-h-[500px]');
    expect(scrollAreaElement).toHaveClass('border');
    expect(scrollAreaElement).toHaveClass('rounded');
    expect(scrollAreaElement).toHaveClass('overflow-y-scroll');
  });

  it('os botões de ação possuem os ícones corretos', () => {
    render(<FieldsTable fields={[mockFieldsData[0]]} onEdit={onEditMock} onDelete={onDeleteMock} />);

    const editButton = screen.getByRole('button', { name: 'Editar' });
    const deleteButton = screen.getByRole('button', { name: 'Excluir' });

    expect(within(editButton).getByTestId('edit-icon')).toBeInTheDocument();
    expect(within(deleteButton).getByTestId('trash-icon')).toBeInTheDocument();
  });
});