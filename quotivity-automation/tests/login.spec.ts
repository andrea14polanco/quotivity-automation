import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page.js';
test.skip(process.env.RUN_SETUP !== 'true', 'Only run when RUN_SETUP=true');
test.describe('Login Flow', () => {
  test.use({ storageState: 'storage/google.json' }); // re-use saved Google session

  test('user sees landing page after portal selection', async ({ page }) => {
    const login = new LoginPage(page);

    // If session is already valid, just go to root
    await page.goto('/');
    
    // Expect login success marker
    await login.expectLoggedIn();
  });
});
