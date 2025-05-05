
/**
 * Source of an error
 */
export type ErrorSource = 
  | 'ui' 
  | 'api' 
  | 'database' 
  | 'storage' 
  | 'auth' 
  | 'unknown';

/**
 * Context information for an error
 */
export interface ErrorContext {
  /** Source system where the error occurred */
  source: ErrorSource;
  /** Operation that was being performed */
  operation: string;
  /** Component name where the error occurred */
  componentName?: string;
  /** Any additional data relevant to the error */
  additionalData?: Record<string, any>;
}

/**
 * Toast variant type
 */
export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning';

/**
 * Options for error handling
 */
export interface ErrorOptions {
  /** Whether to suppress console errors */
  silent?: boolean;
  /** Fallback message if error doesn't have one */
  fallbackMessage?: string;
  /** Custom title for error toast */
  title?: string;
  /** Custom description for error toast */
  description?: string;
  /** Whether to show a toast notification */
  showToast?: boolean;
  /** Whether to log to error monitoring service */
  logToService?: boolean;
  /** Toast variant style */
  toastVariant?: ToastVariant;
  /** Whether to use shadcn toast instead of sonner */
  useShadcnToast?: boolean;
  /** Error context information */
  context?: ErrorContext;
  /** Function to retry the failed operation */
  retry?: () => void;
  /** Operation name (deprecated, use context) */
  operation?: string;
  /** Additional data (deprecated, use context) */
  additionalData?: Record<string, any>;
  /** Toast variant (deprecated, use toastVariant) */
  variant?: ToastVariant;
}

/**
 * Formatted error with context
 */
export interface FormattedError {
  /** Error message */
  message: string;
  /** Original error object */
  originalError: unknown;
  /** Error context */
  context: ErrorContext;
}
