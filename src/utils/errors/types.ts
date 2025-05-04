
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
