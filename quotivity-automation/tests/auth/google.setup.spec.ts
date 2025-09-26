import { test, expect } from '../../fixtures/index.js';
import { LoginPage } from '../../pages/admin/login.page.js';

const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL!;
const GOOGLE_PASS = process.env.GOOGLE_PASS!;
const PORTAL_ID = process.env.PORTAL_ID || '47294991';
test.skip(process.env.RUN_SETUP !== 'true', 'Only run when RUN_SETUP=true');
test('create storageState for Google', async ({ page, otp, hubspotOtp, context }) => {
  test.skip(!GOOGLE_EMAIL || !GOOGLE_PASS, 'Google creds missing');
  context.clearCookies()
  await page.goto('https://accounts.google.com');
  await page.evaluate(() => localStorage.clear());
  await page.evaluate(() => sessionStorage.clear());
  const login = new LoginPage(page);
  await login.goto();
  await login.clickGoogle();

  await page.locator('input[type="email"]').fill(GOOGLE_EMAIL);
  await page.getByRole('button', { name: /^next$/i }).click();

  await page.locator('input[type="password"][name="Passwd"]').fill(GOOGLE_PASS);
  await page.getByRole('button', { name: /^next$|^sign in$/i }).click();
  
  await page.locator('input[type="tel"][name="totpPin"]').fill(otp);
  await page.getByRole('button', { name: /^next$/i }).click();
  console.log('OTP:', otp);
  console.log('OTP hub:', hubspotOtp);
  // Handle manual 2FA approval here (headed mode)
  await expect(page.getByText(/Please Select an Account to Sign In/i)).toBeVisible();

  // Dynamically pick based on env
  await login.chooseAccount();
  await login.expectLoggedIn();
  await page.goto('https://app.hubspot.com/login/');

  await page.waitForSelector('input[data-test-id="email-input-field"]', { state: 'visible', timeout: 10000 });
  
  await page.locator('input[data-test-id="email-input-field"]').fill(GOOGLE_EMAIL);
  
  await page.getByRole('button', { name: /^next$|^sign in$/i }).click();
  await page.getByText('Sign In with Google').click();
  console.log('Current URL:', await page.url());
  await page.waitForSelector('[data-identifier="andrea@hapily.com"]', { state: 'visible', timeout: 10000 });
  await page.getByText(GOOGLE_EMAIL, { exact: true }).click();
  await page.waitForSelector('#code', { state: 'visible', timeout: 10000 });
  await page.locator('#code').fill(hubspotOtp);
  // await page.waitForSelector('[data-test-id="confirm-to-login-submit"]', { state: 'visible', timeout: 10000 });
  await page.getByText("Log in", { exact: true }).click();
  await page.getByText("Remember me", { exact: true }).click();
  await page.getByText(new RegExp(`Portal:\\s*${PORTAL_ID}`)).click();
  console.log('Current URL:', await page.url());
  await page.waitForURL(/hubspot|contacts|portal/i, { timeout: 20000 });
  console.log('Current URL:', await page.url());
  await page.waitForSelector('input[data-test-id="email-input-field"]', { state: 'visible', timeout: 10000 });




});
