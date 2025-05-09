/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; 
import type { MockedFunction } from 'vitest';
import { FieldsAccordion, type AccordionGroup } from '../src/components/common/FieldsAccordion';
import { formatDate } from '../src/utils/formatDate'; 
import React from 'react';

vi.mock('../src/utils/formatDate', () => ({
  formatDate: vi.fn(),
}));

const mockedFormatDate = formatDate as MockedFunction<typeof formatDate>;

describe('FieldsAccordion Component', () => {
  const mockGroupsEmpty: AccordionGroup[] = [];

  const mockGroupNoFills: AccordionGroup = {
    id: 'field1',
    name: 'Nome do Campo 1',
    datatype: 'string',
    createdAt: '2023-01-01T00:00:00.000Z',
    fills: [],
  };

  const mockGroupOneFill: AccordionGroup = {
    id: 'field2',
    name: 'Campo de Email',
    datatype: 'boolean',
    createdAt: '2023-01-02T00:00:00.000Z',
    fills: [
      { id: 'fill1', fieldId: 'field2', value: 'true', createdAt: '2023-03-10T10:00:00.000Z' },
    ],
  };

  const mockGroupMultipleFills: AccordionGroup = {
    id: 'field3',
    name: 'Campo Numérico',
    datatype: 'number',
    createdAt: '2023-01-03T00:00:00.000Z',
    fills: [
      { id: 'fill2', fieldId: 'field3', value: '12345', createdAt: '2023-04-15T11:00:00.000Z' },
      { id: 'fill3', fieldId: 'field3', value: '67890', createdAt: '2023-04-16T12:30:00.000Z' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedFormatDate.mockImplementation((dateString: string) => `formatted-${dateString}`);
  });

  it('renders the accordion with no groups', () => {
    render(<FieldsAccordion groups={mockGroupsEmpty} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('renders correctly with one group and one fill, and expands to show table', async () => {
    render(<FieldsAccordion groups={[mockGroupOneFill]} />);
    const trigger = screen.getByRole('button', { name: /Campo de Email/i });

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('Campo de Email');
    expect(trigger).toHaveTextContent('Campo de Email(boolean)1 preenchimento');
    expect(trigger).toHaveTextContent('1 preenchimento'); 

    fireEvent.click(trigger);

    await screen.findByRole('table');

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Valor' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Criado em' })).toBeInTheDocument();

    const dataRows = screen.getAllByRole('row').slice(1);

    expect(dataRows[0]).toHaveTextContent('trueformatted-2023-03-10T10:00:00.000Z');
    expect(dataRows[0]).toHaveTextContent('formatted-2023-03-10T10:00:00.000Z');
    expect(mockedFormatDate).toHaveBeenCalledWith('2023-03-10T10:00:00.000Z');
  });

  it('renders correctly with one group and multiple fills (pluralization), and expands to show table', async () => {
    render(<FieldsAccordion groups={[mockGroupMultipleFills]} />);
    const trigger = screen.getByRole('button', { name: /Campo Numérico/i });

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('Campo Numérico');
    expect(trigger).toHaveTextContent('(number)');
    expect(trigger).toHaveTextContent('2 preenchimentos'); 

    fireEvent.click(trigger);
    await screen.findByRole('table');

    expect(screen.getByRole('table')).toBeInTheDocument();
    const dataRows = screen.getAllByRole('row').slice(1); 
    expect(dataRows).toHaveLength(2); 

    expect(dataRows[0]).toHaveTextContent('12345');
    expect(dataRows[0]).toHaveTextContent('formatted-2023-04-15T11:00:00.000Z');
    expect(mockedFormatDate).toHaveBeenCalledWith('2023-04-15T11:00:00.000Z');

    expect(dataRows[1]).toHaveTextContent('67890');
    expect(dataRows[1]).toHaveTextContent('formatted-2023-04-16T12:30:00.000Z');
    expect(mockedFormatDate).toHaveBeenCalledWith('2023-04-16T12:30:00.000Z');
  });

  it('renders multiple groups correctly', () => {
    render(<FieldsAccordion groups={[mockGroupNoFills, mockGroupOneFill, mockGroupMultipleFills]} />);

    expect(screen.getByRole('button', { name: /Nome do Campo 1/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Campo de Email/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Campo Numérico/i })).toBeInTheDocument();

    expect(screen.getByRole('button', { name: /Nome do Campo 1/i })).toHaveTextContent('0 preenchimentos');
    expect(screen.getByRole('button', { name: /Campo de Email/i })).toHaveTextContent('1 preenchimento');
    expect(screen.getByRole('button', { name: /Campo Numérico/i })).toHaveTextContent('2 preenchimentos');
  });
});