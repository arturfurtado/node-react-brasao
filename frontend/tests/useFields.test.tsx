/**
 * @vitest-environment jsdom
 */

import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

vi.mock("../src/services/api", () => ({
  api: {
    get: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}));
vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));
vi.mock("../src/utils/errorUtils", () => ({
  isApiError: vi.fn(),
}));

import { renderHook, act, waitFor } from "@testing-library/react";
import { useFields } from "../src/hooks/useFields";
import { api } from "../src/services/api";
import { toast } from "react-toastify";
import { isApiError } from "../src/utils/errorUtils";
import { FieldsResponseSchema } from "../src/schemas";
import type { Field } from "../src/types";
import type { MockedFunction, Mocked } from "vitest";
import type { SafeParseReturnType } from "zod";

const mockedApi = api as Mocked<typeof api>;
const mockedIsApiError = isApiError as unknown as MockedFunction<
  typeof isApiError
>;
const mockedToastError = toast.error as MockedFunction<typeof toast.error>;
const mockedToastSuccess = toast.success as MockedFunction<
  typeof toast.success
>;

describe("useFields hook", () => {
  let safeParseSpy: any;

  const mockData: Field[] = [
    { id: "1", name: "Field One", datatype: "string", createdAt: "" },
    { id: "2", name: "Field Two", datatype: "number", createdAt: "" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    safeParseSpy = vi.spyOn(FieldsResponseSchema, "safeParse").mockReturnValue({
      success: true,
      data: mockData,
    } as SafeParseReturnType<Field[], Field[]>);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches fields on mount and updates state", async () => {
    mockedApi.get.mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useFields());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.fields).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it("handles network errors on fetch and shows toast", async () => {
    const networkErr = new Error("Network down");
    mockedApi.get.mockRejectedValue(networkErr);
    mockedIsApiError.mockReturnValue(false);

    const { result } = renderHook(() => useFields());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Network down");
    expect(mockedToastError).toHaveBeenCalledWith("Network down");
  });

  it("handles API errors with response.message", async () => {
    const apiErr = { response: { data: { message: "API says no" } } };
    mockedApi.get.mockRejectedValue(apiErr);
    mockedIsApiError.mockReturnValue(true);

    const { result } = renderHook(() => useFields());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("API says no");
    expect(mockedToastError).toHaveBeenCalledWith("API says no");
  });

  it("handles schema parse failures and shows formatting error", async () => {
    mockedApi.get.mockResolvedValue({ data: {} });
    safeParseSpy.mockReturnValue({ success: false, error: new Error() });

    const { result } = renderHook(() => useFields());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Formato de campos inválido");
    expect(mockedToastError).toHaveBeenCalledWith("Formato de campos inválido");
  });

  it("deleteField calls delete, toasts success and refetches", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: mockData });
    const { result } = renderHook(() => useFields());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockedApi.delete.mockResolvedValue({});
    const after = [mockData[1]];
    mockedApi.get.mockResolvedValueOnce({ data: after });

    safeParseSpy.mockReturnValueOnce({ success: true, data: after });

    await act(async () => {
      await result.current.deleteField("1");
    });
    await waitFor(() => expect(result.current.fields).toEqual(after));

    expect(mockedApi.delete).toHaveBeenCalledWith("/campos/1");
    expect(mockedToastSuccess).toHaveBeenCalledWith(
      "Campo excluído com sucesso!"
    );
  });

  it("updateField calls put, toasts success and refetches", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: mockData });
    const { result } = renderHook(() => useFields());
    await waitFor(() => expect(result.current.loading).toBe(false));

    mockedApi.put.mockResolvedValue({});
    const updated: Field[] = [{ ...mockData[0], name: "Updated" }, mockData[1]];
    mockedApi.get.mockResolvedValueOnce({ data: updated });

    safeParseSpy.mockReturnValueOnce({ success: true, data: updated });

    await act(async () => {
      await result.current.updateField("1", {
        name: "Updated",
        datatype: "string",
      });
    });
    await waitFor(() => expect(result.current.fields).toEqual(updated));

    expect(mockedApi.put).toHaveBeenCalledWith("/campos/1", {
      name: "Updated",
      datatype: "string",
    });
    expect(mockedToastSuccess).toHaveBeenCalledWith(
      "Campo atualizado com sucesso!"
    );
  });

  it("refresh() triggers a refetch", async () => {
    mockedApi.get.mockResolvedValueOnce({ data: mockData });
    const { result } = renderHook(() => useFields());
    await waitFor(() => expect(result.current.loading).toBe(false));

    const fresh: Field[] = [
      { id: "3", name: "New", datatype: "boolean", createdAt: "" },
    ];
    mockedApi.get.mockResolvedValueOnce({ data: fresh });
    safeParseSpy.mockReturnValueOnce({ success: true, data: fresh });

    await act(async () => {
      await result.current.refresh();
    });
    await waitFor(() => expect(result.current.fields).toEqual(fresh));
  });
});
