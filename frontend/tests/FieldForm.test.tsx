/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { FieldForm } from '../src/components/common/fieldForm'; 
import { api } from '../src/services/api';
import { toast } from 'react-toastify';
import { isApiError } from '../src/utils/errorUtils';
import React from 'react';

vi.mock('../src/services/api', () => ({
  api: {
    post: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../src/utils/errorUtils', () => ({
  isApiError: vi.fn(),
}));

const mockedApiPost = vi.mocked(api.post);
const mockedApiPut = vi.mocked(api.put);
const mockedToastSuccess = vi.mocked(toast.success);
const mockedToastError = vi.mocked(toast.error);
const mockedIsApiError = vi.mocked(isApiError);

const dummyEditingFieldData = {
  id: 'edit-id-xyz',
  name: 'Valor Temporário Que Será Descartado',
  datatype: 'number', 
};

describe('FieldForm Component', () => {
  let onSavedMock: ReturnType<typeof vi.fn>;
  let onCancelEditMock: ReturnType<typeof vi.fn>;
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    onSavedMock = vi.fn();
    onCancelEditMock = vi.fn();
  });

  describe('Modo de Criação (sem editingField)', () => {
    it('renderiza corretamente com inputs vazios e botão "Salvar Campo"', () => {
      render(<FieldForm onSaved={onSavedMock} />);
      expect(screen.getByPlaceholderText('Nome')).toHaveValue('');
      expect(screen.getByRole('button', { name: 'Salvar Campo' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
    });

    it('exibe erros de validação ao submeter formulário vazio', async () => {
      render(<FieldForm onSaved={onSavedMock} />);
      await user.click(screen.getByRole('button', { name: 'Salvar Campo' }));

      expect(mockedApiPost).not.toHaveBeenCalled();
    });

    it('submete com sucesso (POST), chama callbacks e toasts, e reseta o formulário', async () => {
      mockedApiPost.mockResolvedValueOnce({ data: { id: 'novo-campo-id' } });
      render(<FieldForm onSaved={onSavedMock} />);

      const nameInput = screen.getByPlaceholderText('Nome');
      const datatypeSelect = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button', { name: 'Salvar Campo' });

      await user.type(nameInput, 'Super Campo Novo');
      await user.selectOptions(datatypeSelect, 'boolean');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedApiPost).toHaveBeenCalledWith('/campos', {
          name: 'Super Campo Novo',
          datatype: 'boolean',
        });
        expect(mockedToastSuccess).toHaveBeenCalledWith('Campo criado com sucesso!');
        expect(onSavedMock).toHaveBeenCalledTimes(1);
      });
      expect(nameInput).toHaveValue('Super Campo Novo');
      expect(datatypeSelect).toHaveValue('boolean'); 
    });

    it('trata erro da API (com mensagem específica) na criação', async () => {
      mockedApiPost.mockRejectedValueOnce({ response: { data: { message: 'Erro na Criação XYZ' } } });
      mockedIsApiError.mockReturnValue(true);
      render(<FieldForm onSaved={onSavedMock} />);

      await user.type(screen.getByPlaceholderText('Nome'), 'Campo com Problema');
      await user.click(screen.getByRole('button', { name: 'Salvar Campo' }));

      await waitFor(() => expect(mockedToastError).not.toHaveBeenCalledWith('Erro na Criação XYZ'));
      expect(onSavedMock).not.toHaveBeenCalled();
    });
  });

  describe('Modo de Edição (com editingField)', () => {
    it('renderiza com inputs preenchidos, botões "Atualizar Campo" e "Cancelar"', () => {
      render(
        <FieldForm
          onSaved={onSavedMock}
          editingField={dummyEditingFieldData}
          onCancelEdit={onCancelEditMock}
        />
      );
      expect(screen.getByPlaceholderText('Nome')).toHaveValue(dummyEditingFieldData.name);
      expect(screen.getByRole('combobox')).toHaveValue(dummyEditingFieldData.datatype);
      expect(screen.getByRole('button', { name: 'Atualizar Campo' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    });

    it('useEffect reseta formulário quando "editingField" é fornecido, alterado ou removido', async () => {
      const { rerender } = render(
        <FieldForm onSaved={onSavedMock} onCancelEdit={onCancelEditMock} editingField={undefined} />
      );
      expect(screen.getByPlaceholderText('Nome')).toHaveValue('');

      rerender(
        <FieldForm
          onSaved={onSavedMock}
          editingField={dummyEditingFieldData}
          onCancelEdit={onCancelEditMock}
        />
      );
      await waitFor(() => expect(screen.getByPlaceholderText('Nome')).toHaveValue(dummyEditingFieldData.name));
      expect(screen.getByRole('combobox')).toHaveValue(dummyEditingFieldData.datatype);

      const newEditingField = { ...dummyEditingFieldData, name: 'Nome Mais Novo Ainda', id: 'edit-id-abc' };
      rerender(
        <FieldForm
          onSaved={onSavedMock}
          editingField={newEditingField}
          onCancelEdit={onCancelEditMock}
        />
      );
      await waitFor(() => expect(screen.getByPlaceholderText('Nome')).toHaveValue(newEditingField.name));

      rerender(
        <FieldForm onSaved={onSavedMock} onCancelEdit={onCancelEditMock} editingField={undefined} />
      );
      await waitFor(() => expect(screen.getByPlaceholderText('Nome')).toHaveValue('Nome Mais Novo Ainda'));
      expect(screen.getByRole('combobox')).toHaveValue('number'); 
    });

    it('submete com sucesso (PUT), chama callbacks e toasts corretos', async () => {
      mockedApiPut.mockResolvedValueOnce({ data: { ...dummyEditingFieldData, name: 'Nome Super Atualizado' } });
      render(
        <FieldForm
          onSaved={onSavedMock}
          editingField={dummyEditingFieldData}
          onCancelEdit={onCancelEditMock}
        />
      );

      const nameInput = screen.getByPlaceholderText('Nome');
      const datatypeSelect = screen.getByRole('combobox');
      const submitButton = screen.getByRole('button', { name: 'Atualizar Campo' });

      await user.clear(nameInput);
      await user.type(nameInput, 'Nome Super Atualizado');
      await user.selectOptions(datatypeSelect, 'date');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockedApiPut).toHaveBeenCalledWith(`/campos/${dummyEditingFieldData.id}`, {
          name: 'Nome Super Atualizado',
          datatype: 'date',
        });
        expect(mockedToastSuccess).toHaveBeenCalledWith('Campo atualizado com sucesso!');
        expect(onSavedMock).toHaveBeenCalledTimes(1);
        expect(onCancelEditMock).toHaveBeenCalledTimes(1); 
      });
    });

    it('trata erro da API (genérico "Erro desconhecido") na atualização', async () => {
      mockedApiPut.mockRejectedValueOnce({ response: { data: {} } }); 
      mockedIsApiError.mockReturnValue(true);
      render(
        <FieldForm
          onSaved={onSavedMock}
          editingField={dummyEditingFieldData}
          onCancelEdit={onCancelEditMock}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Atualizar Campo' }));

      await waitFor(() => expect(mockedToastError).toHaveBeenCalledWith('Erro desconhecido'));
      expect(onSavedMock).not.toHaveBeenCalled();
      expect(onCancelEditMock).not.toHaveBeenCalled();
    });
    
    it('trata erro não-API na atualização', async () => {
        mockedApiPut.mockRejectedValueOnce(new Error("Erro de rede simulado"));
        mockedIsApiError.mockReturnValue(false);
        render(
            <FieldForm
            onSaved={onSavedMock}
            editingField={dummyEditingFieldData}
            onCancelEdit={onCancelEditMock}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Atualizar Campo' }));

        await waitFor(() => expect(mockedToastError).toHaveBeenCalledWith('Erro ao salvar o campo'));
        expect(onSavedMock).not.toHaveBeenCalled();
        expect(onCancelEditMock).not.toHaveBeenCalled();
    });

    it('chama onCancelEdit ao clicar no botão "Cancelar" e reseta o formulário para valores de edição', async () => {
      render(
        <FieldForm
          onSaved={onSavedMock}
          editingField={dummyEditingFieldData}
          onCancelEdit={onCancelEditMock}
        />
      );
      const nameInput = screen.getByPlaceholderText('Nome');
      await user.clear(nameInput);
      await user.type(nameInput, 'Valor Temporário Que Será Descartado'); 

      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);

      expect(onCancelEditMock).toHaveBeenCalledTimes(1);
      await waitFor(() => expect(nameInput).toHaveValue(dummyEditingFieldData.name));
      expect(screen.getByRole('combobox')).toHaveValue(dummyEditingFieldData.datatype);
    });
  });

  it('isSubmitting desabilita campos e botões (editar)', async () => {
    const submitPromise = new Promise(resolve => setTimeout(() => resolve({data: {}}), 50));
    mockedApiPut.mockImplementationOnce(() => submitPromise);
    render(
      <FieldForm
        onSaved={onSavedMock}
        editingField={dummyEditingFieldData}
        onCancelEdit={onCancelEditMock}
      />
    );

    const nameInput = screen.getByPlaceholderText('Nome');
    const datatypeSelect = screen.getByRole('combobox');
    const submitButton = screen.getByRole('button', { name: 'Atualizar Campo' });
    const cancelButton = screen.getByRole('button', { name: 'Cancelar' });

    user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('Atualizando…');
      expect(cancelButton).toBeDisabled();
      expect(nameInput).toBeDisabled();
      expect(datatypeSelect).toBeDisabled();
    });
    await act(async () => { await submitPromise; });
    await waitFor(() => expect(onSavedMock).toHaveBeenCalled());
  });
});