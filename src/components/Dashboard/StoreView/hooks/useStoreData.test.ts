import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useStoreData } from './useStoreData';
import { supabase } from '@/integrations/supabase/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  }
}));

// Create a wrapper component that provides the query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: Infinity,
      staleTime: Infinity,
    },
  },
});

function Wrapper({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

describe('useStoreData Hook', () => {
  const mockStoreId = 'test-store-id';
  const mockOnError = vi.fn();
  const mockOnLoading = vi.fn();
  
  beforeEach(() => {
    vi.resetAllMocks();
    queryClient.clear();
    
    // Mock the Supabase responses
    vi.mocked(supabase.from).mockImplementation((table) => {
      if (table === 'stores') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            data: {
              id: mockStoreId,
              name: 'Test Store',
              address: '123 Test St',
              type: 'Grocery',
              created_at: '2023-01-01',
              created_by: 'user-1',
              project_id: 'project-1',
              projects: { is_closed: false }
            },
            error: null
          })
        } as any;
      } else if (table === 'pictures') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: 'pic-1',
                store_id: mockStoreId,
                uploaded_by: 'user-1',
                image_url: 'https://example.com/image1.jpg',
                created_at: '2023-01-01',
                analysis_data: []
              }
            ],
            error: null
          })
        } as any;
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null })
      } as any;
    });
  });

  it('should fetch store and pictures data', async () => {
    const { result } = renderHook(() => useStoreData({
      storeId: mockStoreId,
      onError: mockOnError,
      onLoading: mockOnLoading
    }), { wrapper: Wrapper });
    
    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);
    
    // Wait for the data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    // Check that store and pictures are loaded
    expect(result.current.store).toBeTruthy();
    expect(result.current.pictures.length).toBeGreaterThan(0);
    expect(result.current.isProjectClosed).toBe(false);
    
    // Check that loading callback was called
    expect(mockOnLoading).toHaveBeenCalledWith(false);
  });
});
