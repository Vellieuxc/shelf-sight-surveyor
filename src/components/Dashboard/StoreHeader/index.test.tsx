
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import StoreHeader from './index';
import * as MobileHook from '@/hooks/use-mobile';

// Mock the useIsMobile hook
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn()
}));

describe('StoreHeader Component', () => {
  const mockStore = {
    id: 'store-1',
    name: 'Test Store',
    type: 'Grocery',
    address: '123 Main St',
    country: 'US',
    created_at: '2023-01-01T00:00:00Z',
    created_by: 'user-1',
    project_id: 'project-1',
    google_map_pin: null,
    store_image: null
  };

  it('renders correctly on desktop', () => {
    // Mock useIsMobile to return false (desktop view)
    vi.spyOn(MobileHook, 'useIsMobile').mockReturnValue(false);
    
    const mockSynthesize = vi.fn();
    render(<StoreHeader store={mockStore} onSynthesizeStore={mockSynthesize} />);
    
    expect(screen.getByText('Test Store')).toBeInTheDocument();
    expect(screen.getByText('Synthesize Data')).toBeInTheDocument();
    
    // In desktop view, SynthesizeButton should not have the full width class
    const synthesizeButton = screen.getByText('Synthesize Data').closest('button');
    expect(synthesizeButton).not.toHaveClass('w-full');
  });

  it('renders correctly on mobile', () => {
    // Mock useIsMobile to return true (mobile view)
    vi.spyOn(MobileHook, 'useIsMobile').mockReturnValue(true);
    
    const mockSynthesize = vi.fn();
    render(<StoreHeader store={mockStore} onSynthesizeStore={mockSynthesize} />);
    
    expect(screen.getByText('Test Store')).toBeInTheDocument();
    expect(screen.getByText('Synthesize Data')).toBeInTheDocument();
    
    // In mobile view, SynthesizeButton should have the full width class
    const synthesizeButton = screen.getByText('Synthesize Data').closest('button');
    expect(synthesizeButton).toHaveClass('w-full');
  });
});
