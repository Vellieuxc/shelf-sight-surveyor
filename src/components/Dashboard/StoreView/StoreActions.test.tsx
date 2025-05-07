import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import StoreActions from './StoreActions';

describe('StoreActions Component', () => {
  it('renders nothing when project is closed', () => {
    const { container } = render(
      <StoreActions
        isProjectClosed={true}
        onUploadClick={() => {}}
        onCaptureClick={() => {}}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders upload and capture buttons when project is open', () => {
    render(
      <StoreActions
        isProjectClosed={false}
        onUploadClick={() => {}}
        onCaptureClick={() => {}}
      />
    );
    
    expect(screen.getByTestId('store-actions')).toBeInTheDocument();
    expect(screen.getByTestId('upload-button')).toBeInTheDocument();
    expect(screen.getByTestId('capture-button')).toBeInTheDocument();
  });

  it('calls onUploadClick when upload button is clicked', () => {
    const mockUploadClick = vi.fn();
    render(
      <StoreActions
        isProjectClosed={false}
        onUploadClick={mockUploadClick}
        onCaptureClick={() => {}}
      />
    );
    
    fireEvent.click(screen.getByTestId('upload-button'));
    expect(mockUploadClick).toHaveBeenCalledTimes(1);
  });

  it('calls onCaptureClick when capture button is clicked', () => {
    const mockCaptureClick = vi.fn();
    render(
      <StoreActions
        isProjectClosed={false}
        onUploadClick={() => {}}
        onCaptureClick={mockCaptureClick}
      />
    );
    
    fireEvent.click(screen.getByTestId('capture-button'));
    expect(mockCaptureClick).toHaveBeenCalledTimes(1);
  });

  it('only renders buttons for provided handlers', () => {
    render(
      <StoreActions
        isProjectClosed={false}
        onUploadClick={() => {}}
      />
    );
    
    expect(screen.getByTestId('upload-button')).toBeInTheDocument();
    expect(screen.queryByTestId('capture-button')).not.toBeInTheDocument();
  });

  it('renders with correct button variants and icons', () => {
    render(
      <StoreActions
        isProjectClosed={false}
        onUploadClick={() => {}}
        onCaptureClick={() => {}}
      />
    );
    
    const uploadButton = screen.getByTestId('upload-button');
    const captureButton = screen.getByTestId('capture-button');
    
    // Check for flex and gap classes
    expect(uploadButton).toHaveClass('flex', 'items-center', 'gap-2');
    expect(captureButton).toHaveClass('flex', 'items-center', 'gap-2');
    
    // Check for variant classes (using shadcn/ui classes)
    expect(uploadButton).toHaveClass('bg-primary', 'text-primary-foreground');
    expect(captureButton).toHaveClass('bg-secondary', 'text-secondary-foreground');
    
    // Check for icons
    expect(uploadButton.querySelector('svg')).toBeInTheDocument();
    expect(captureButton.querySelector('svg')).toBeInTheDocument();
  });
}); 