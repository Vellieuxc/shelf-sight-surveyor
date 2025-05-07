import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PictureCard from './PictureCard';
import { AllTheProviders } from '@/test/utils';

// Mock OptimizedImage component
vi.mock('@/components/Common/OptimizedImage', () => ({
  default: ({ src, alt, className, loading }: any) => (
    <img src={src} alt={alt} className={className} loading={loading} />
  )
}));

// Mock the auth context
vi.mock('@/contexts/auth', () => ({
  useAuth: () => ({
    profile: { role: 'user' }
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis()
    }),
    removeChannel: vi.fn()
  }
}));

// Mock the comment count hook
vi.mock('@/hooks/use-comment-count', () => ({
  useCommentCount: () => ({ count: 0, isLoading: false })
}));

describe('PictureCard Component', () => {
  const defaultProps = {
    id: 'test-id',
    image_url: 'https://example.com/test.jpg',
    analysis_data: null,
    created_at: '2024-05-07T10:00:00Z',
    onClick: vi.fn(),
    storeId: 'store-1',
    allowDelete: true,
    onDelete: vi.fn()
  };

  it('renders correctly with basic props', () => {
    render(<PictureCard {...defaultProps} />, { wrapper: AllTheProviders });
    
    // Check if the image is rendered
    const image = screen.getByRole('img', { name: `Picture ${defaultProps.id}` });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', defaultProps.image_url);
    
    // Check if metadata is rendered
    expect(screen.getByText(/Uploaded:/)).toBeInTheDocument();
  });

  it('shows analysis badge when analysis data is present', () => {
    render(
      <PictureCard 
        {...defaultProps} 
        analysis_data={[{ some: 'data' }]} 
      />,
      { wrapper: AllTheProviders }
    );
    
    expect(screen.getByText('Analyzed')).toBeInTheDocument();
  });

  it('handles click events', () => {
    render(<PictureCard {...defaultProps} />, { wrapper: AllTheProviders });
    
    const imageContainer = screen.getByRole('img', { name: `Picture ${defaultProps.id}` }).parentElement;
    fireEvent.click(imageContainer!);
    
    expect(defaultProps.onClick).toHaveBeenCalled();
  });

  it('shows delete button when allowDelete is true', () => {
    render(<PictureCard {...defaultProps} allowDelete={true} />, { wrapper: AllTheProviders });
    
    // Use getAllByRole and check that at least one delete button exists
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it('hides delete button when allowDelete is false', () => {
    render(<PictureCard {...defaultProps} allowDelete={false} />, { wrapper: AllTheProviders });
    
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('toggles comments section visibility', () => {
    render(<PictureCard {...defaultProps} />, { wrapper: AllTheProviders });
    
    // Use getAllByRole and get the first comments button
    const commentsButtons = screen.getAllByRole('button', { name: /comments/i });
    const commentsButton = commentsButtons[0];
    
    fireEvent.click(commentsButton);
    expect(screen.getByTestId('comments-section')).toBeInTheDocument();
    
    fireEvent.click(commentsButton);
    expect(screen.queryByTestId('comments-section')).not.toBeInTheDocument();
  });
}); 