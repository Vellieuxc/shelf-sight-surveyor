
import { toast as sonnerToast } from "sonner";
import { toast as shadowToast } from "@/hooks/use-toast";

interface ToastOptions {
  title?: string;
  message: string;
  variant?: "default" | "destructive";
  useShadcnToast?: boolean;
  retry?: () => Promise<void>;
}

/**
 * Display an error toast using either sonner or shadcn/ui toast
 */
export function showErrorToast({
  title,
  message,
  variant = "destructive",
  useShadcnToast = false,
  retry
}: ToastOptions): void {
  if (useShadcnToast) {
    shadowToast({
      title: title || "Error",
      description: message,
      variant
    });
  } else {
    // For retry functionality with sonner
    if (retry) {
      sonnerToast.error(message, {
        action: {
          label: 'Retry',
          onClick: () => retry(),
        },
      });
    } else {
      sonnerToast.error(message);
    }
  }
}
