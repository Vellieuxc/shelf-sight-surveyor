
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth';
import '@testing-library/jest-dom'; // Make sure this is imported

// Define a type for the wrapper options
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
}

// Create a custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const { route = '/', ...renderOptions } = options || {};

  // Set up the URL location
  window.history.pushState({}, 'Test page', route);

  return render(ui, {
    wrapper: ({ children }) => (
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    ),
    ...renderOptions,
  });
};

// Re-export everything from testing-library
export * from '@testing-library/react';
export * from '@testing-library/jest-dom'; // Export jest-dom matchers
export { customRender as render };
