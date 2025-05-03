
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import StoreInfo from './StoreInfo';

describe('StoreInfo Component', () => {
  it('renders store information correctly', () => {
    render(
      <StoreInfo 
        name="Walmart Superstore" 
        type="Grocery" 
        address="123 Main St, Anytown, USA" 
        creationDate="January 1, 2023" 
        creatorName="John Doe" 
      />
    );
    
    expect(screen.getByText('Walmart Superstore')).toBeInTheDocument();
    expect(screen.getByText('Grocery')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, Anytown, USA')).toBeInTheDocument();
    expect(screen.getByText('Created on January 1, 2023')).toBeInTheDocument();
    expect(screen.getByText('Created by John Doe')).toBeInTheDocument();
  });

  it('does not show creator info when creatorName is empty', () => {
    render(
      <StoreInfo 
        name="Walmart Superstore" 
        type="Grocery" 
        address="123 Main St, Anytown, USA" 
        creationDate="January 1, 2023" 
        creatorName="" 
      />
    );
    
    expect(screen.getByText('Walmart Superstore')).toBeInTheDocument();
    expect(screen.queryByText('Created by')).not.toBeInTheDocument();
  });
});
