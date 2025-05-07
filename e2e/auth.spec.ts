import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should redirect to auth page when not logged in', async ({ page }) => {
    // Start from the homepage
    await page.goto('/');
    
    // Should be redirected to /auth
    await expect(page).toHaveURL(/.*\/auth/);
    
    // Auth page should have the expected elements
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible();
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    await page.goto('/auth');
    
    // Try to sign in with invalid credentials
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const signInButton = page.getByRole('button', { name: /sign in/i });
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('wrongpassword');
    await signInButton.click();
    
    // Should show error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('should maintain auth state after refresh', async ({ page }) => {
    // This test would need to mock the auth provider
    // We'll implement this after setting up auth mocking
  });
}); 