
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@/test/utils';
import SynthesizeButton from './SynthesizeButton';

describe('SynthesizeButton Component', () => {
  it('renders correctly with default props', () => {
    const mockSynthesize = vi.fn();
    render(<SynthesizeButton onSynthesizeStore={mockSynthesize} />);
    
    expect(screen.getByText('Synthesize Data')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveClass('whitespace-nowrap');
  });

  it('applies custom className when provided', () => {
    const mockSynthesize = vi.fn();
    render(<SynthesizeButton onSynthesizeStore={mockSynthesize} className="custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('whitespace-nowrap'); // Should still have the default class
  });

  it('calls onSynthesizeStore when clicked', () => {
    const mockSynthesize = vi.fn();
    render(<SynthesizeButton onSynthesizeStore={mockSynthesize} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(mockSynthesize).toHaveBeenCalledTimes(1);
  });
});
