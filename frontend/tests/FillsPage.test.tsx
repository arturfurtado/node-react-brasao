import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from "react";

import FillsPage from "../src/pages/fillsPage";
import type { Field, Fill } from "../src/types";
import { useFills } from "../src/hooks/useFills";
import { useFields } from "../src/hooks/useFields";


vi.mock("../components/common/fillForm", () => ({
  FillForm: ({ onSaved }: any) => (
    <div data-testid="fill-form" onClick={onSaved}>
      Mocked FillForm
    </div>
  ),
}));

vi.mock("../components/common/fieldsAccordion", () => ({
  FieldsAccordion: ({ groups }: any) => (
    <div data-testid="fields-accordion">
      Mocked FieldsAccordion with {groups.length} groups
    </div>
  ),
}));

const mockUseFieldsValues = {} as ReturnType<typeof useFields>;

const mockUseFillsValues = {} as ReturnType<typeof useFills>;

vi.mock("../hooks/useFields", () => ({
  useFields: () => mockUseFieldsValues,
}));

vi.mock("../hooks/useFills", () => ({
  useFills: () => mockUseFillsValues,
}));

const dummyFields: Field[] = [
  { id: "f1", name: "Nome", datatype: "string", createdAt: "2024-01-01" },
];

const dummyFills: Fill[] = [
  { id: "fill1", value: "João", fieldId: "f1", createdAt: "2024-01-02" },
  { id: "fill2", value: "Maria", fieldId: "f1", createdAt: "2024-01-03" },
];

describe("FillsPage Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFieldsValues.fields = [];
    mockUseFieldsValues.loading = false;
    mockUseFieldsValues.error = null;

    mockUseFillsValues.fills = [];
    mockUseFillsValues.loading = false;
    mockUseFillsValues.error = null;
  });

  it("exibe mensagem de carregamento quando qualquer loading é true", () => {
    mockUseFieldsValues.loading = true;
    render(<FillsPage />);
    expect(screen.getByText("Carregando dados…")).toBeInTheDocument();
  });

  it("renderiza FillForm e FieldsAccordion quando não há erro nem loading", () => {
    mockUseFieldsValues.fields = dummyFields;
    mockUseFillsValues.fills = dummyFills;

    render(<FillsPage />);

    expect(screen.getByPlaceholderText("Valor")).toBeInTheDocument(); 
    expect(screen.getByText("Selecione um campo")).toBeInTheDocument()  
});
});
