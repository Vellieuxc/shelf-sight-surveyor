
// Error types specific to your application
export type ErrorSource = 'auth' | 'database' | 'storage' | 'api' | 'ui' | 'unknown';

export interface ErrorContext {
  source: ErrorSource;
  operation: string;
  componentName?: string;
  additionalData?: Record<string, unknown>;
}

export interface ErrorOptions {
  silent?: boolean;
  fallbackMessage?: string;
  showToast?: boolean;
  logToService?: boolean;
  toastVariant?: "default" | "destructive";
  useShadcnToast?: boolean; // Whether to use shadcn/ui toast or sonner
  context?: ErrorContext;
  retry?: () => Promise<void>; // Optional retry function
  // Adding operation directly to ErrorOptions for backward compatibility
  operation?: string;
  // Adding additionalData directly to ErrorOptions for backward compatibility
  additionalData?: Record<string, unknown>;
}

export interface FormattedError {
  message: string;
  originalError: unknown;
  context?: ErrorContext;
}

// Specific database error types
export interface DatabaseError {
  code: string;
  details?: string;
  hint?: string;
  message: string;
}

// Specific storage error types
export interface StorageError {
  name: string;
  message: string;
  status?: number;
  statusText?: string;
}

// Specific auth error types
export interface AuthError {
  message: string;
  status?: number;
}

// Typed version of runSafely return
export type SafeResponse<T> = {
  data: T | null;
  error: Error | null;
};
