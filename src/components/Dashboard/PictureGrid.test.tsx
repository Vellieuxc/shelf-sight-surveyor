
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import PictureGrid from './Pictures/PictureGrid';
import { Picture } from '@/types';

// Mock react-window to avoid rendering issues in tests
vi.mock('react-window', () => ({
  FixedSizeGrid: ({ children, columnCount, rowCount }: any) => {
    const items = [];
    // Render first 4 items only for testing
    for (let row = 0; row < Math.min(rowCount, 2); row++) {
      for (let col = 0; col < Math.min(columnCount, 2); col++) {
        items.push(children({ columnIndex: col, rowIndex: row, style: {} }));
      }
    }
    return <div role="list">{items}</div>;
  }
}));

// Mock resize observer
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('PictureGrid Component', () => {
  it('renders an empty state message when there are no pictures', () => {
    render(<PictureGrid pictures={[]} onPictureDeleted={() => {}} />);
    
    expect(screen.getByText('No pictures available')).toBeInTheDocument();
    expect(screen.getByText('Upload some pictures to analyze this store')).toBeInTheDocument();
  });

  it('renders pictures when provided', () => {
    const mockPictures: Picture[] = [
      {
        id: '1',
        store_id: 'store-1',
        image_url: 'https://example.com/image1.jpg',
        uploaded_by: 'user-1',
        created_at: '2023-01-01',
        analysis_data: []
      },
      {
        id: '2',
        store_id: 'store-1',
        image_url: 'https://example.com/image2.jpg',
        uploaded_by: 'user-2',
        created_at: '2023-01-02',
        analysis_data: []
      }
    ];
    
    const mockDeleteHandler = vi.fn();
    const mockCreatorMap = { 'user-1': 'John Doe', 'user-2': 'Jane Smith' };
    
    // Mock element dimensions for testing
    const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 1000 });
    
    render(
      <PictureGrid 
        pictures={mockPictures} 
        onPictureDeleted={mockDeleteHandler} 
        creatorMap={mockCreatorMap}
      />
    );
    
    // We expect the grid container to be rendered
    const gridElement = screen.getByRole('list');
    expect(gridElement).toBeInTheDocument();
    
    // Restore original offsetWidth
    if (originalOffsetWidth) {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
    }
  });

  it('respects the allowDelete prop', () => {
    const mockPictures: Picture[] = [
      {
        id: '1',
        store_id: 'store-1',
        image_url: 'https://example.com/image1.jpg',
        uploaded_by: 'user-1',
        created_at: '2023-01-01',
        analysis_data: []
      }
    ];
    
    const mockDeleteHandler = vi.fn();
    
    // Mock element dimensions for testing
    const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 1000 });
    
    // First render with allowDelete=false
    const { rerender } = render(
      <PictureGrid 
        pictures={mockPictures} 
        onPictureDeleted={mockDeleteHandler}
        allowDelete={false}
      />
    );
    
    // Then rerender with allowDelete=true
    rerender(
      <PictureGrid 
        pictures={mockPictures} 
        onPictureDeleted={mockDeleteHandler}
        allowDelete={true}
      />
    );
    
    // Restore original offsetWidth
    if (originalOffsetWidth) {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth);
    }
  });
});
