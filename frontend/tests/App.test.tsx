/**
 * @vitest-environment jsdom
 */
import React from "react";
import {
  render,
  screen,
  waitFor,
  act,      
  within,   
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom"; 

import App from "../src/App";
import type { Field } from "../src/types"; 
import { api as actualApi } from "../src/services/api";

beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});


interface UseFieldsMockType {
  fields: Field[];
  loading: boolean;
  error: string | null;
  refresh: () => void | Promise<void>;
  deleteField: (id: string) => Promise<void>;
}

interface UseFillsMockType {
  fills: unknown[];
  loading: boolean;
  error: string | null;
  refresh: () => void | Promise<void>;
}

beforeAll(() => {
  global.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: query === "(prefers-color-scheme: dark)",
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

const mockUseFieldsData: UseFieldsMockType = {
  fields: [],
  loading: false,
  error: null,
  refresh: vi.fn(),
  deleteField: vi.fn(async (_id: string) => {}),
};


const mockUseFillsData: UseFillsMockType = {
  fills: [],
  loading: false,
  error: null,
  refresh: vi.fn(),
};

vi.mock("../src/hooks/useFills", () => ({
  useFills: () => mockUseFillsData,
}));

vi.mock("../src/hooks/useFields", () => ({
  useFields: () => mockUseFieldsData,
}));

vi.mock("../src/services/api", () => ({ 
  api: {
    post: vi.fn(),
    put: vi.fn(),
    get: vi.fn(),
  },
}));

vi.mock("react-toastify", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-toastify")>();
  return {
    ...actual,
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
    },
  };
});

vi.mock('../src/utils/errorUtils', () => ({ 
    isApiError: vi.fn()
}));

const mockedApiPost = vi.mocked(actualApi.post);
const mockedApiPut = vi.mocked(actualApi.put);

describe("App Component - Testes de Integração", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    Object.assign(mockUseFieldsData, {
      fields: [],
      loading: false,
      error: null,
    });

    Object.assign(mockUseFillsData, {
      fills: [],
      loading: false,
      error: null,
    });

    global.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false, 
      media: query,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      onchange: null,
    }));
  });

  it("renderiza o menu de navegação com os links corretos", () => {
    render(<App />);
    expect(screen.getByRole("link", { name: "Campos" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Preenchimentos" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /switch to dark theme/i })
    ).toBeInTheDocument();
  });

  it("alterna entre temas claro e escuro ao clicar no botão de tema", async () => {
    render(<App />);

    const themeButtonInitiallyLight = screen.getByRole("button", {
      name: /switch to dark theme/i,
    });
    expect(themeButtonInitiallyLight).toHaveTextContent("🌙");
    expect(document.documentElement).not.toHaveClass("dark");

    await user.click(themeButtonInitiallyLight);
    const themeButtonDark = await screen.findByRole("button", {
      name: /switch to light theme/i,
    });
    expect(themeButtonDark).toHaveTextContent("☀️");
    expect(document.documentElement).toHaveClass("dark");

    await user.click(themeButtonDark);
    const themeButtonLightAgain = await screen.findByRole("button", {
      name: /switch to dark theme/i,
    });
    expect(themeButtonLightAgain).toHaveTextContent("🌙");
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it('persiste o tema escuro no localStorage e o aplica após "reload"', async () => {
    const { rerender } = render(<App />);
    const themeButton = screen.getByRole("button", {
      name: /switch to dark theme/i,
    });
    await user.click(themeButton); 

    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement).toHaveClass("dark");

    rerender(<App />);
    expect(document.documentElement).toHaveClass("dark"); 
    expect(
      screen.getByRole("button", { name: /switch to light theme/i }) 
    ).toHaveTextContent("☀️");
  });

  it('persiste o tema claro no localStorage e o aplica após "reload"', async () => {
    localStorage.setItem("theme", "dark"); 
    const { rerender } = render(<App />);

    expect(document.documentElement).toHaveClass("dark");
    const themeButtonInitialDark = screen.getByRole("button", {
      name: /switch to light theme/i,
    });

    await user.click(themeButtonInitialDark); 
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement).not.toHaveClass("dark");

    rerender(<App />); 
    expect(document.documentElement).not.toHaveClass("dark"); 
    expect(
      screen.getByRole("button", { name: /switch to dark theme/i }) 
    ).toHaveTextContent("🌙");
  });

  it("usa tema escuro se prefers-color-scheme for dark e não houver tema salvo no localStorage", () => {
    localStorage.clear();
    global.matchMedia = vi.fn().mockImplementation((query) => ({ 
      matches: query === "(prefers-color-scheme: dark)",
      media: query, addListener: vi.fn(), removeListener: vi.fn(),
      addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn(), onchange: null,
    }));

    render(<App />);

    expect(document.documentElement).toHaveClass("dark");
    expect(
      screen.getByRole("button", { name: /switch to light theme/i })
    ).toHaveTextContent("☀️");
  });

  describe('Fluxo Completo de Gerenciamento de Campos', () => {
    it('permite criar, visualizar, editar e excluir um campo', async () => {
      const { rerender } = render(<App />);
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Gerenciar Campos/i })).toBeInTheDocument();
      });

      mockedApiPost.mockResolvedValueOnce({ data: { id: 'new-field-1', name: 'Campo Criado Recentemente', datatype: 'string' } });

      const allNameInputs = screen.getAllByPlaceholderText('Nome');
      const allDatatypeSelects = screen.getAllByRole('combobox');
      const allSaveButtons = screen.getAllByRole('button', { name: 'Salvar Campo' });

      const nameInputCreate = allNameInputs[0];
      const datatypeSelectCreate = allDatatypeSelects[0];
      const saveButtonCreate = allSaveButtons[0];

      await user.type(nameInputCreate, 'Campo Criado Recentemente');
      await user.selectOptions(datatypeSelectCreate, 'string');
      await user.click(saveButtonCreate);

      await waitFor(() => expect(mockUseFieldsData.refresh).toHaveBeenCalledTimes(1));

      act(() => {
        mockUseFieldsData.fields = [{ id: 'new-field-1', name: 'Campo Criado Recentemente', datatype: 'string', createdAt: 'data-criacao' }];
      });
      rerender(<App />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
        expect(screen.getByRole('cell', { name: 'Campo Criado Recentemente' })).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /editar/i }); 
      await user.click(editButtons[0]);

      let dialog;
      await waitFor(() => {
        dialog = screen.getByRole('dialog', { name: 'Editar Campo' });
        expect(dialog).toBeInTheDocument();
      });
      dialog = screen.getByRole('dialog', { name: 'Editar Campo' });
      
      expect(within(dialog).getByPlaceholderText('Nome')).toHaveValue('Campo Criado Recentemente');
      expect(within(dialog).getByRole('combobox')).toHaveValue('string');

      mockedApiPut.mockResolvedValueOnce({ data: { id: 'new-field-1', name: 'Campo Super Editado', datatype: 'number' } });
      const nameInputEdit = within(dialog).getByPlaceholderText('Nome');
      const datatypeSelectEdit = within(dialog).getByRole('combobox');
      const updateButtonEdit = within(dialog).getByRole('button', { name: 'Atualizar Campo' });

      await user.clear(nameInputEdit);
      await user.type(nameInputEdit, 'Campo Super Editado');
      await user.selectOptions(datatypeSelectEdit, 'number');
      await user.click(updateButtonEdit);

      await waitFor(() => expect(mockUseFieldsData.refresh).toHaveBeenCalledTimes(2));

      act(() => {
        mockUseFieldsData.fields = [{ id: 'new-field-1', name: 'Campo Super Editado', datatype: 'number',createdAt: 'data-criacao'}];
      });
      rerender(<App />);

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      await waitFor(() => {
        expect(screen.getByRole('cell', { name: 'Campo Super Editado' })).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /excluir/i });
      await user.click(deleteButtons[0]); 

      await waitFor(() => expect(mockUseFieldsData.deleteField).toHaveBeenCalledWith('new-field-1'));

      act(() => {
        mockUseFieldsData.fields = [];
      });
      rerender(<App />);

      await waitFor(() => {
        expect(screen.queryByRole('table')).not.toBeInTheDocument();
      });
    });
  });
});