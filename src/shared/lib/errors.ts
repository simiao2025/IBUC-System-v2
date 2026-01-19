export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'API_ERROR'
  | 'AUTH_ERROR'
  | 'NOT_FOUND'
  | 'FORBIDDEN'
  | 'UNKNOWN_ERROR';

export class AppError extends Error {
  constructor(
    public message: string,
    public code: ErrorCode = 'UNKNOWN_ERROR',
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class ApiError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 'API_ERROR', details);
    this.name = 'ApiError';
  }
}

export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 'AUTH_ERROR');
    this.name = 'AuthError';
  }
}

export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};
