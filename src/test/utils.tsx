import React, { ReactElement, ReactNode } from 'react';
import { render as rtlRender, RenderOptions as RTLRenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Import jest-dom separately
import '@testing-library/jest-dom';

// Create a QueryClient for testing
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: Infinity,
      staleTime: Infinity,
    },
    mutations: {
      retry: false,
    },
  },
});

interface AllTheProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
}

export const AllTheProviders = ({ children, queryClient = createTestQueryClient() }: AllTheProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

type RenderOptions = Omit<RTLRenderOptions, 'wrapper'> & {
  queryClient?: QueryClient;
};

const customRender = (
  ui: ReactElement,
  { queryClient, ...options }: RenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllTheProviders queryClient={queryClient}>
      {children}
    </AllTheProviders>
  );

  return rtlRender(ui, { ...options, wrapper: Wrapper });
};

// Mock Supabase channel
export const mockSupabaseChannel = {
  subscribe: vi.fn().mockReturnValue({
    unsubscribe: vi.fn()
  })
};

// Helper to wait for all pending promises
export const waitForPromises = () => new Promise(resolve => setImmediate(resolve));

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
