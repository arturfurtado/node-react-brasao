/**
 * @vitest-environment jsdom
 */

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('../src/services/api', () => ({
  api: { get: vi.fn() },
}));
vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));
vi.mock('../src/utils/errorUtils', () => ({
  isApiError: vi.fn(),
}));

import { useFills } from '../src/hooks/useFills';
import { api } from '../src/services/api';
import { toast } from 'react-toastify';
import { isApiError } from '../src/utils/errorUtils';
import { FillsResponseSchema } from '../src/schemas';
import type { Fill } from '../src/types';
import type { MockedFunction, MockInstance } from 'vitest';

const mockedApiGet = api.get as MockedFunction<typeof api.get>;
const mockedToastError = toast.error as MockedFunction<typeof toast.error>;
const mockedIsApiError = isApiError as unknown as MockedFunction<typeof isApiError>;

const mockFillsData: Fill[] = [
  { id: 'fill1', fieldId: 'fieldA', value: 'Value A', createdAt: '2023-01-01T00:00:00.000Z' },
  { id: 'fill2', fieldId: 'fieldB', value: '100',    createdAt: '2023-01-02T00:00:00.000Z' },
];
const mockNewFillsData: Fill[] = [
  { id: 'fill3', fieldId: 'fieldC', value: 'true', createdAt: '2023-01-03T00:00:00.000Z' },
];

interface ZodLikeError extends Error {
  errors: Array<{ path: (string|number)[]; message: string }>;
}

describe('useFills hook', () => {
  let parseSpy: MockInstance<typeof FillsResponseSchema.parse>;

  beforeEach(() => {
    vi.clearAllMocks();
    parseSpy = vi
      .spyOn(FillsResponseSchema, 'parse')
      .mockReturnValue([...mockFillsData]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches fills on mount and updates state correctly', async () => {
    mockedApiGet.mockResolvedValue({ data: [...mockFillsData] });
    const { result } = renderHook(() => useFills());

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockedApiGet).toHaveBeenCalledWith('/preenchimentos');
    expect(result.current.fills).toEqual(mockFillsData);
    expect(result.current.error).toBeNull();
  });

  it('handles network errors during fetch', async () => {
    const networkError = new Error('Network connection lost');
    mockedApiGet.mockRejectedValue(networkError);
    mockedIsApiError.mockReturnValue(false);

    const { result } = renderHook(() => useFills());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network connection lost');
    expect(mockedToastError).toHaveBeenCalledWith('Network connection lost');
    expect(result.current.fills).toEqual([]);
  });

  it('handles API errors with a message during fetch', async () => {
    const apiErrorWithMessage = {
      isAxiosError: true,
      response: { data: { message: 'Specific API error message' } },
    };
    mockedApiGet.mockRejectedValue(apiErrorWithMessage);
    mockedIsApiError.mockReturnValue(true);

    const { result } = renderHook(() => useFills());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Specific API error message');
    expect(mockedToastError).toHaveBeenCalledWith('Specific API error message');
  });

  it('handles API errors without a specific message during fetch', async () => {
    const apiErrorWithoutMessage = {
      isAxiosError: true,
      response: { data: {} },
    };
    mockedApiGet.mockRejectedValue(apiErrorWithoutMessage);
    mockedIsApiError.mockReturnValue(true);

    const { result } = renderHook(() => useFills());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Erro ao carregar preenchimentos');
    expect(mockedToastError).toHaveBeenCalledWith('Erro ao carregar preenchimentos');
  });

  it('handles Zod parsing errors (schema validation failure)', async () => {
    const malformedDataFromApi = { someUnexpectedData: true };
    mockedApiGet.mockResolvedValue({ data: malformedDataFromApi });

    const zodErrorInstance = new Error("Validation failed") as ZodLikeError;
    zodErrorInstance.errors = [{ path: ['field'], message: 'Invalid type' }];

    parseSpy.mockImplementation(() => {
      throw zodErrorInstance;
    });

    const { result } = renderHook(() => useFills());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Dados de preenchimentos inválidos recebidos da API.');
    expect(result.current.fills).toEqual([]);
  });

  it('refresh function fetches fills again', async () => {
    mockedApiGet.mockResolvedValueOnce({ data: [...mockFillsData] });
    const { result } = renderHook(() => useFills());
    await waitFor(() => expect(result.current.fills).toEqual(mockFillsData));
    expect(result.current.loading).toBe(false);

    mockedApiGet.mockResolvedValueOnce({ data: [...mockNewFillsData] });
    parseSpy.mockReturnValueOnce([...mockNewFillsData]);

    await act(async () => {
      result.current.refresh();
    });

    expect(result.current.loading).toBe(false);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockedApiGet).toHaveBeenCalledTimes(2);
    expect(mockedApiGet).toHaveBeenLastCalledWith('/preenchimentos');
    expect(parseSpy).toHaveBeenCalledTimes(0);
    expect(result.current.fills).toEqual(mockNewFillsData);
    expect(result.current.error).toBeNull();
  });
});
