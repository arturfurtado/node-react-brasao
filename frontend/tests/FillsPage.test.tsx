import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import FillsPage from "../src/pages/fillsPage";
import type { Field, Fill } from "../src/types";
import { useFills } from "../src/hooks/useFills";
import { useFields } from "../src/hooks/useFields";

beforeAll(() => {
  vi.stubGlobal('XMLHttpRequest', class {
    onload: any;
    open() {}
    send() {  if (this.onload) this.onload(); }
  } as any);
});

vi.mock("../src/components/common/fillForm", () => ({
  FillForm: ({ onSaved }: any) => (
   <div data-testid="mock-fill-form" onClick={onSaved}>
      Mocked FillForm
    </div>
  ),
}));

vi.mock("../src/components/common/fieldsAccordion", () => ({
  FieldsAccordion: ({ groups }: any) => (
    <div data-testid="mock-fields-accordion">
      Mocked FieldsAccordion with 1 groups
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

 it("renderiza FillForm quando não há erro nem loading", () => {
  mockUseFieldsValues.fields = dummyFields;
  mockUseFillsValues.fills = dummyFills;

  render(<FillsPage />);

expect(screen.getByTestId("mock-fill-form"))
  .toHaveTextContent("Mocked FillForm");
});
});
