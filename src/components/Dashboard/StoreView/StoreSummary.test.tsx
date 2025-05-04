
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StoreSummary from './StoreSummary';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn()
}));

describe('StoreSummary Component', () => {
  const mockStore = {
    id: 'store-123',
    name: 'Test Store',
    address: '123 Main St',
    country: 'US',
    type: 'Grocery',
    project_id: 'proj-123',
    created_at: '2023-01-01T00:00:00Z',
    created_by: 'user-123',
    google_map_pin: null,
    store_image: null
  };

  const mockSummaryData = {
    store: {
      id: 'store-123',
      name: 'Test Store',
      address: '123 Main St',
      country: 'US',
      type: 'Grocery'
    },
    summary: {
      totalPictures: 10,
      picturesWithAnalysis: 8,
      totalSKUCount: 120,
      averageEmptySpace: '15%',
      positionDistribution: {
        Top: 40,
        Middle: 50,
        Bottom: 30
      },
      topBrands: [
        { brand: 'Brand A', count: 25 },
        { brand: 'Brand B', count: 18 },
        { brand: 'Brand C', count: 12 }
      ]
    }
  };

  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock toast - fixed the type issue
    (useToast as ReturnType<typeof vi.fn>).mockReturnValue({
      toast: vi.fn()
    });
  });

  it('renders initial state correctly', () => {
    render(<StoreSummary store={mockStore} />);
    
    expect(screen.getByText('Store Analysis Summary')).toBeInTheDocument();
    expect(screen.getByText('Generate Summary')).toBeInTheDocument();
    expect(screen.getByText('Click "Generate Summary" to analyze store data.')).toBeInTheDocument();
  });

  it('shows loading state when generating summary', async () => {
    // Mock the Supabase function to return a promise that doesn't resolve immediately
    (supabase.functions.invoke as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(() => {})
    );
    
    render(<StoreSummary store={mockStore} />);
    
    fireEvent.click(screen.getByText('Generate Summary'));
    
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  });

  it('displays summary data when successful', async () => {
    // Mock successful response
    (supabase.functions.invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockSummaryData,
      error: null
    });
    
    render(<StoreSummary store={mockStore} />);
    
    fireEvent.click(screen.getByText('Generate Summary'));
    
    await waitFor(() => {
      expect(screen.getByText('10')).toBeInTheDocument(); // Total Pictures
      expect(screen.getByText('8')).toBeInTheDocument(); // Analyzed Pictures
      expect(screen.getByText('120')).toBeInTheDocument(); // Total SKUs
      expect(screen.getByText('15%')).toBeInTheDocument(); // Avg Empty Space
      expect(screen.getByText('Brand A')).toBeInTheDocument(); // Top brand
    });
  });

  it('displays error message on failure', async () => {
    // Mock error response
    (supabase.functions.invoke as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: null,
      error: new Error('Failed to connect')
    });
    
    render(<StoreSummary store={mockStore} />);
    
    fireEvent.click(screen.getByText('Generate Summary'));
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to connect/)).toBeInTheDocument();
    });
  });
});
