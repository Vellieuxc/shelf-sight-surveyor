import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import StoreLoading from './StoreLoading';

describe('StoreLoading Component', () => {
  it('renders all skeleton sections', () => {
    const { container } = render(<StoreLoading />);
    
    // Check for main container
    expect(container.querySelector('.container')).toBeInTheDocument();
    
    // Check for navigation skeletons
    const navSkeletons = container.querySelectorAll('.h-10.w-32');
    expect(navSkeletons).toHaveLength(2);
    
    // Check for store header card
    const headerCard = container.querySelector('.p-4.sm\\:p-6');
    expect(headerCard).toBeInTheDocument();
    
    // Check for main image skeleton
    expect(container.querySelector('.h-\\[200px\\]')).toBeInTheDocument();
    
    // Check for store info skeletons
    const infoSection = container.querySelector('.space-y-2');
    expect(infoSection).toBeInTheDocument();
    const infoSkeletons = infoSection?.querySelectorAll('[class*="animate-pulse"]');
    expect(infoSkeletons).toHaveLength(3);
    
    // Check for action button skeleton
    expect(container.querySelector('.h-10.w-48')).toBeInTheDocument();
    
    // Check for content grid
    const contentGrid = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3');
    expect(contentGrid).toBeInTheDocument();
    
    // Check for image grid skeletons
    const imageSkeletons = container.querySelectorAll('.h-\\[220px\\]');
    expect(imageSkeletons).toHaveLength(4);
    
    // Check for sidebar skeleton
    expect(container.querySelector('.h-\\[300px\\]')).toBeInTheDocument();
  });

  it('maintains responsive layout structure', () => {
    const { container } = render(<StoreLoading />);
    
    // Check main grid
    const mainGrid = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3');
    expect(mainGrid).toBeInTheDocument();
    
    // Check image grid
    const imageGrid = container.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2');
    expect(imageGrid).toBeInTheDocument();
    
    // Check header layout
    const header = container.querySelector('.flex.flex-col.sm\\:flex-row');
    expect(header).toBeInTheDocument();
  });

  it('applies correct spacing classes', () => {
    const { container } = render(<StoreLoading />);
    
    // Check container spacing
    expect(container.querySelector('.space-y-6')).toBeInTheDocument();
    
    // Check info section spacing
    const infoSection = container.querySelector('.space-y-2');
    expect(infoSection).toBeInTheDocument();
    
    // Check grid gap
    const grid = container.querySelector('.gap-4');
    expect(grid).toBeInTheDocument();
  });

  it('renders all skeletons with appropriate ARIA attributes', () => {
    const { container } = render(<StoreLoading />);
    
    const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
    skeletons.forEach(skeleton => {
      expect(skeleton).toHaveAttribute('aria-hidden', 'true');
    });
  });
}); 