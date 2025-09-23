import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL!;
const GOOGLE_PASS = process.env.GOOGLE_PASS!;

test('create storageState for Google', async ({ page, context }) => {
  test.skip(!GOOGLE_EMAIL || !GOOGLE_PASS, 'Google creds missing');

  const login = new LoginPage(page);
  await login.goto();
  await login.clickGoogle();

  await page.locator('input[type="email"]').fill(GOOGLE_EMAIL);
  await page.getByRole('button', { name: /^next$/i }).click();

  await page.locator('input[type="password"][name="Passwd"]').fill(GOOGLE_PASS);
  await page.getByRole('button', { name: /^next$|^sign in$/i }).click();

  // Handle manual 2FA approval here (headed mode)
  await expect(page.getByText(/Please Select an Account to Sign In/i)).toBeVisible();

  // Dynamically pick based on env
  await login.chooseAccount();
  await login.expectLoggedIn();

  const out = path.resolve('storage/google.json');
  await fs.mkdir(path.dirname(out), { recursive: true });
  await context.storageState({ path: out });
});
