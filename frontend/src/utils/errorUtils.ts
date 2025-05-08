export interface ApiError {
    response?: {
      data?: {
        message?: string;
      };
    };
  }
  
  export function isApiError(error: unknown): error is ApiError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'response' in error &&
      typeof (error as ApiError).response?.data?.message === 'string'
    );
  }
  