import { test, expect } from '@playwright/test';

test.describe('Store View', () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Set up authentication state
    // This would typically involve setting up session cookies or local storage
    await page.goto('/dashboard');
  });

  test('should display store loading state', async ({ page }) => {
    // Navigate to a store page
    await page.goto('/dashboard/stores/123');
    
    // Should show loading skeletons
    await expect(page.locator('.skeleton')).toBeVisible();
    
    // Loading state should be replaced with content
    await expect(page.locator('.skeleton')).toBeHidden();
  });

  test('should handle image upload', async ({ page }) => {
    await page.goto('/dashboard/stores/123');
    
    // Click upload button
    const uploadButton = page.getByRole('button', { name: /upload/i });
    await uploadButton.click();
    
    // Upload dialog should be visible
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // TODO: Test file upload once we have the proper test files
    // This would involve using page.setInputFiles()
  });

  test('should display store summary', async ({ page }) => {
    await page.goto('/dashboard/stores/123');
    
    // Wait for store data to load
    await page.waitForSelector('[data-testid="store-summary"]');
    
    // Check for key store information
    await expect(page.getByTestId('store-name')).toBeVisible();
    await expect(page.getByTestId('store-address')).toBeVisible();
    await expect(page.getByTestId('store-status')).toBeVisible();
  });

  test('should handle store actions', async ({ page }) => {
    await page.goto('/dashboard/stores/123');
    
    // Test store action buttons
    const actionButtons = page.getByTestId('store-actions');
    await expect(actionButtons.getByRole('button', { name: /upload/i })).toBeVisible();
    await expect(actionButtons.getByRole('button', { name: /take picture/i })).toBeVisible();
    
    // Click actions and verify responses
    await actionButtons.getByRole('button', { name: /upload/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('should navigate between stores', async ({ page }) => {
    await page.goto('/dashboard/stores');
    
    // Click on a store in the list
    await page.getByTestId('store-list-item').first().click();
    
    // Should navigate to store details
    await expect(page).toHaveURL(/.*\/stores\/\d+/);
    
    // Navigate back
    await page.getByRole('button', { name: /back/i }).click();
    await expect(page).toHaveURL(/.*\/stores$/);
  });
}); 