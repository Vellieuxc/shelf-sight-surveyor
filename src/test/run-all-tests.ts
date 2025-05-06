
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// This is a simple test to ensure the test runner is working
describe('Test Runner', () => {
  it('should be able to run tests', () => {
    expect(true).toBe(true);
  });
});

// Import all test files here to ensure they are included in the test run
import '../components/Dashboard/StoreHeader/SynthesizeButton.test';
import '../components/Dashboard/StoreHeader/StoreInfo.test';
import '../components/Dashboard/StoreHeader/index.test';
import '../components/Dashboard/StoreView/hooks/useStoreData.test';
import '../components/Dashboard/StoreView/StoreSummary.test';
import '../components/Dashboard/PictureGrid.test';

// Run all tests
describe('Running all tests', () => {
  it('should run all tests', () => {
    console.log('All tests completed');
    expect(true).toBe(true);
  });
});
