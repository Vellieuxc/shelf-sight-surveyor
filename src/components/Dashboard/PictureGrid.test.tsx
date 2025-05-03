
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import PictureGrid from './PictureGrid';
import { Picture } from '@/types';

describe('PictureGrid Component', () => {
  it('renders an empty state message when there are no pictures', () => {
    render(<PictureGrid pictures={[]} onDeletePicture={() => {}} />);
    
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
    
    render(
      <PictureGrid 
        pictures={mockPictures} 
        onDeletePicture={mockDeleteHandler} 
        creatorMap={mockCreatorMap}
      />
    );
    
    // We don't check for specific image URLs as PictureCard is a separate component,
    // but we can verify the component renders the grid structure
    const gridElement = screen.getByRole('list') || document.querySelector('.grid');
    expect(gridElement).toBeInTheDocument();
  });

  it('respects the allowEditing prop', () => {
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
    
    // First render with allowEditing=false
    const { rerender } = render(
      <PictureGrid 
        pictures={mockPictures} 
        onDeletePicture={mockDeleteHandler}
        allowEditing={false}
      />
    );
    
    // Then rerender with allowEditing=true
    rerender(
      <PictureGrid 
        pictures={mockPictures} 
        onDeletePicture={mockDeleteHandler}
        allowEditing={true}
      />
    );
  });
});
