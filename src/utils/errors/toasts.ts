
import { useToast as useShadcnToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { ToastVariant } from "./types";

interface ErrorToastOptions {
  title: string;
  message: string;
  variant?: ToastVariant;
  useShadcnToast?: boolean;
  retry?: () => void;
}

/**
 * Show an error toast notification using either Sonner or Shadcn UI toast
 */
export function showErrorToast({
  title,
  message,
  variant = 'destructive',
  useShadcnToast = false,
  retry
}: ErrorToastOptions) {
  if (useShadcnToast) {
    // Use shadcn toast - we can't directly use the hook here
    // so we set a global variable that components can use
    (window as any).__errorToastMessage = {
      title,
      description: message,
      variant,
      retry
    };
    
    // Dispatch a custom event that toast-capable components can listen for
    window.dispatchEvent(new CustomEvent('showErrorToast'));
  } else {
    // Use sonner toast
    sonnerToast[variant === 'destructive' ? 'error' : variant === 'success' ? 'success' : 'info'](
      title,
      {
        description: message,
        action: retry ? {
          label: 'Try Again',
          onClick: retry
        } : undefined
      }
    );
  }
}

/**
 * Hook to listen for global error toasts in components
 */
export function useErrorToasts() {
  const { toast } = useShadcnToast();
  
  React.useEffect(() => {
    const handleErrorToast = () => {
      const toastMessage = (window as any).__errorToastMessage;
      if (toastMessage) {
        toast({
          title: toastMessage.title,
          description: toastMessage.description,
          variant: toastMessage.variant,
          action: toastMessage.retry ? (
            <button onClick={toastMessage.retry}>Try Again</button>
          ) : undefined
        });
        
        // Clear the message
        (window as any).__errorToastMessage = null;
      }
    };
    
    window.addEventListener('showErrorToast', handleErrorToast);
    return () => {
      window.removeEventListener('showErrorToast', handleErrorToast);
    };
  }, [toast]);
}
