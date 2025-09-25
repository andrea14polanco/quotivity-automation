import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL!;
const GOOGLE_PASS = process.env.GOOGLE_PASS!;

const HAPILY_USER = process.env.HAPILY_USER!;
const PORTAL_ID = process.env.PORTAL_ID || '50339424';
test.skip(process.env.RUN_SETUP !== 'true', 'Only run when RUN_SETUP=true');
test('create storageState for Google', async ({ page, context }) => {
  test.skip(!GOOGLE_EMAIL || !GOOGLE_PASS, 'Google creds missing');

  const login = new LoginPage(page);
  await login.goto();
  await login.clickGoogle();

  await page.locator('input[type="email"]').fill(GOOGLE_EMAIL);
  await page.getByRole('button', { name: /^next$/i }).click();

  await page.locator('input[type="password"][name="Passwd"]').fill(GOOGLE_PASS);
  await page.getByRole('button', { name: /^next$|^sign in$/i }).click();
  await page.waitForTimeout(10000); // wait 5 seconds

  // Handle manual 2FA approval here (headed mode)
  await expect(page.getByText(/Please Select an Account to Sign In/i)).toBeVisible();

  // Dynamically pick based on env
  await login.chooseAccount();
  await login.expectLoggedIn();

  const out = path.resolve('storage/google.json');
  await fs.mkdir(path.dirname(out), { recursive: true });
  await context.storageState({ path: out });

  await page.getByText(GOOGLE_EMAIL, { exact: true }).click();
  //await page.waitForTimeout(10000000000); // wait 5 seconds
  await page.waitForTimeout(10000); // wait 5 seconds
  //await page.getByRole('link', { name: new RegExp(`Portal: ${PORTAL_ID}`) }).click();
  //await page.getByRole('link', { name: /${PORTAL_ID}/ }).click();
  //await page.getByText(/Portal:\s*${PORTAL_ID}/).click();
  await page.getByText(new RegExp(`Portal:\\s*${PORTAL_ID}`)).click();

  // HubSpot smart login form appears
  await page.waitForTimeout(100000); // Give time for page to render
  const emailInput = await page.$('[data-test-id="email-input-field"]');
  if (!emailInput) {
    console.error('DEBUG: [data-test-id="email-input-field"] not found!');
    const html = await page.content();
    console.error('DEBUG: Current page HTML:', html);
    throw new Error('Email input field not found');
  }
  await emailInput.fill(GOOGLE_EMAIL);
  await page.locator('[data-test-id="password-login-button"]').click();
  

  await page.waitForTimeout(10000000000);

  if (
    await page
      .getByRole('textbox', { name: /email/i })
      .isVisible({ timeout: 2000 })
      .catch(() => false)
  ) {
    // Fresh Google login
    await page.getByRole('textbox', { name: /email/i }).fill(GOOGLE_EMAIL);
    await page.getByRole('button', { name: /^next$/i }).click();

    await page.locator('input[type="password"][name="Passwd"]').fill(GOOGLE_PASS);
    await page.getByRole('button', { name: /^next$|^sign in$/i }).click();
  } else {
    // Already signed-in account → select it
    await page.getByRole('link', { name: GOOGLE_EMAIL }).click();
  }

  // 4. Verify inside HubSpot portal
  await expect(page.getByText(/Contacts|Deals|HubSpot/i)).toBeVisible();

  // 5. Save state
  const out2 = path.resolve('storage/hubspot.json');
  await fs.mkdir(path.dirname(out2), { recursive: true });
  await context.storageState({ path: out });
});
