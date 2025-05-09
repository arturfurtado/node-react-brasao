import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import FieldsPage from "../src/pages/fieldsPage";
import type { Field } from "../src/types";
import React from "react";

interface UseFieldsMockData {
    fields: Field[];
    loading: boolean;
    error: string | null;
    refresh: () => void;
    deleteField: (id: string) => Promise<void>;
  }
const mockUseFieldsValues: UseFieldsMockData = {
  fields: [],
  loading: false,
  error: null,
  refresh: vi.fn(),
  deleteField: vi.fn(async () => {}),
};

vi.mock("../hooks/useFields", () => ({
  useFields: () => mockUseFieldsValues,
}));

vi.mock("../src/services/api", () => ({
  api: {
    post: vi.fn(),
    put: vi.fn(),
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

const dummyFields: Field[] = [
  {
    id: "id1",
    name: "Campo Um",
    datatype: "string",
    createdAt: "d1",
  },
  {
    id: "id2",
    name: "Campo Dois",
    datatype: "number",
    createdAt: "d2",
  },
];

describe("FieldsPage Component", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFieldsValues.fields = [];
    mockUseFieldsValues.loading = false;
    mockUseFieldsValues.error = null;
  });

  it("exibe mensagem de carregamento quando loading é true", () => {
    mockUseFieldsValues.loading = true;
    render(<FieldsPage />);
  });

  it("exibe mensagem de erro quando error está presente", () => {
    const errorMessage = "Falha ao buscar campos";
    mockUseFieldsValues.error = errorMessage;
    render(<FieldsPage />);
  });

  it("renderiza FieldsTable quando há campos", () => {
    mockUseFieldsValues.fields = dummyFields;
    render(<FieldsPage />);
  });
});
