import { Page, test } from '../../fixtures';
import { LoginPage } from '../../pages/admin/login.page.js';
import { BundlePage } from 'pages/admin/bundle.page.js';

const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL!;
const GOOGLE_PASS = process.env.GOOGLE_PASS!;

test.describe('Login Flow', () => {
  test.use({ storageState: 'storage/google.json' }); // re-use saved Google session

  test('user sees landing page after portal selection', async ({ page, otp }: { page: Page, otp: string }) => {
    const login = new LoginPage(page);
    
    await login.loginWithGoogle({
        email: GOOGLE_EMAIL,
        password: GOOGLE_PASS,
        otp,
    });
    
    
    const bundle = new BundlePage(page);
    await bundle.goto();
    await bundle.createBundle('Test Bundle', 'This is a test bundle created by Playwright');

    // Add assertions to verify bundle creation if applicable
    // e.g., await expect(page.locator('text=Test Bundle')).toBeVisible();
  });
});
