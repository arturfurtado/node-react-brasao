/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { FillForm } from "../src/components/common/fillForm"; 
import type { Field } from "../src/types";
import { api } from "../src/services/api";
import { toast } from "react-toastify";
import { isApiError } from "../src/utils/errorUtils";
import React from "react";

vi.mock("../src/services/api", () => ({
  api: {
    post: vi.fn(),
  },
}));

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../src/utils/errorUtils", () => ({
  isApiError: vi.fn(),
}));

const mockedApiPost = vi.mocked(api.post);
const mockedToastSuccess = vi.mocked(toast.success);
const mockedToastError = vi.mocked(toast.error);
const mockedIsApiError = vi.mocked(isApiError);

const dummyFields: Field[] = [
  {
    id: "f1",
    name: "Campo Alpha",
    datatype: "string",
    createdAt: "2023-01-01",
  },
  {
    id: "f2",
    name: "Campo Beta",
    datatype: "number",
    createdAt: "2023-01-02",
  },
];

describe("FillForm Component", () => {
  let onSavedMock: ReturnType<typeof vi.fn>;
  const user = userEvent.setup(); 

  beforeEach(() => {
    vi.clearAllMocks(); 
    onSavedMock = vi.fn();
  });

  it("renderiza corretamente os campos, opções do select e botão", () => {
    render(<FillForm fields={dummyFields} onSaved={onSavedMock} />);

    expect(screen.getByRole("combobox")).toBeInTheDocument(); 
    expect(
      screen.getByRole("option", { name: "Selecione um campo" })
    ).toBeInTheDocument();
    dummyFields.forEach((field) => {
      expect(screen.getByRole("option", { name: field.name })).toHaveValue(
        field.id
      );
    });
    expect(screen.getByPlaceholderText("Valor")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Salvar Preenchimento" })
    ).toBeInTheDocument();
    expect(screen.queryByText(/obrigatório/i)).not.toBeInTheDocument(); 
  });

  it("exibe mensagens de erro de validação ao submeter formulário vazio", async () => {
    render(<FillForm fields={dummyFields} onSaved={onSavedMock} />);

    const submitButton = screen.getByRole("button", {
      name: "Salvar Preenchimento",
    });
    await user.click(submitButton);

    expect(await screen.findAllByText(/campo obrigatório/i)).toHaveLength(1);

    expect(mockedApiPost).not.toHaveBeenCalled();
    expect(onSavedMock).not.toHaveBeenCalled();
  });

  it("submete com sucesso, chama API, toast.success e onSaved", async () => {
    mockedApiPost.mockResolvedValueOnce({ data: { id: "new-fill-id" } });

    render(<FillForm fields={dummyFields} onSaved={onSavedMock} />);

    const fieldSelect = screen.getByRole("combobox");
    const valueInput = screen.getByPlaceholderText("Valor");
    const submitButton = screen.getByRole("button", {
      name: "Salvar Preenchimento",
    });

    await user.selectOptions(fieldSelect, dummyFields[0].id);
    await user.type(valueInput, "Valor Teste 123");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedApiPost).toHaveBeenCalledTimes(1);
      expect(mockedApiPost).toHaveBeenCalledWith("/preenchimentos", {
        fieldId: dummyFields[0].id,
        value: "Valor Teste 123",
      });
    });

    await waitFor(() => {
      expect(mockedToastSuccess).toHaveBeenCalledWith(
        "Preenchimento salvo com sucesso!"
      );
    });
    expect(onSavedMock).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Salvar Preenchimento" })
      ).not.toBeDisabled();
    });
  });

  it("trata erro da API com mensagem específica", async () => {
    const apiErrorMessage = "Erro específico da API";
    mockedApiPost.mockRejectedValueOnce({
      response: { data: { message: apiErrorMessage } },
    });
    mockedIsApiError.mockReturnValue(true);

    render(<FillForm fields={dummyFields} onSaved={onSavedMock} />);

    await user.selectOptions(screen.getByRole("combobox"), dummyFields[0].id);
    await user.type(screen.getByPlaceholderText("Valor"), "Valor Válido");
    await user.click(
      screen.getByRole("button", { name: "Salvar Preenchimento" })
    );

    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith(apiErrorMessage);
    });
    expect(onSavedMock).not.toHaveBeenCalled();
  });

  it('trata erro da API com mensagem genérica "Erro desconhecido"', async () => {
    mockedApiPost.mockRejectedValueOnce({ response: { data: {} } }); 
    mockedIsApiError.mockReturnValue(true);

    render(<FillForm fields={dummyFields} onSaved={onSavedMock} />);

    await user.selectOptions(screen.getByRole("combobox"), dummyFields[0].id);
    await user.type(screen.getByPlaceholderText("Valor"), "Outro Valor");
    await user.click(
      screen.getByRole("button", { name: "Salvar Preenchimento" })
    );

    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith("Erro desconhecido");
    });
    expect(onSavedMock).not.toHaveBeenCalled();
  });

  it("trata erro não-API com mensagem padrão", async () => {
    mockedApiPost.mockRejectedValueOnce(new Error("Falha de rede"));
    mockedIsApiError.mockReturnValue(false); 

    render(<FillForm fields={dummyFields} onSaved={onSavedMock} />);

    await user.selectOptions(screen.getByRole("combobox"), dummyFields[0].id);
    await user.type(screen.getByPlaceholderText("Valor"), "Mais um Valor");
    await user.click(
      screen.getByRole("button", { name: "Salvar Preenchimento" })
    );

    await waitFor(() => {
      expect(mockedToastError).toHaveBeenCalledWith(
        "Erro ao salvar preenchimento"
      );
    });
    expect(onSavedMock).not.toHaveBeenCalled();
  });
});
