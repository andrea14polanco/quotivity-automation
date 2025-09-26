import { Page, expect } from '@playwright/test';

export class HubspotLoginPage {
  constructor(private page: Page) {}

  async loginWithGoogle(email: string, password: string, otp: string, hubspotOtp: string, portalId: string, domain: string) {
    await this.gotoHubspotLogin(domain);
    await this.fillGoogleEmail(email);
    await this.fillGooglePassword(password);
    await this.fillGoogleOtp(otp);
    await this.selectGoogleAccount(email);

    await this.fillHubspotEmail(email);
    await this.signInWithGoogle();
    await this.selectHubspotAccount(email);
    await this.fillHubspotOtp(hubspotOtp);
    await this.finalizeLogin(portalId);
  }

  async gotoHubspotLogin(domain: string) {
    await this.page.goto(domain);
    await this.page.waitForSelector('input[data-test-id="email-input-field"]', { state: 'visible' });
  }

  async fillGoogleEmail(email: string) {
    await this.page.locator('input[type="email"]').fill(email);
    await this.page.getByRole('button', { name: /^next$/i }).click();
  }

  async fillGooglePassword(password: string) {
    await this.page.locator('input[type="password"][name="Passwd"]').fill(password);
    await this.page.getByRole('button', { name: /^next$|^sign in$/i }).click();
  }

  async fillGoogleOtp(otp: string) {
    await this.page.locator('input[type="tel"][name="totpPin"]').fill(otp);
    await this.page.getByRole('button', { name: /^next$/i }).click();
    await expect(this.page.getByText(/Please Select an Account to Sign In/i)).toBeVisible();
  }

  async selectGoogleAccount(email: string) {
    await this.page.getByText(email, { exact: true }).click();
  }

  async fillHubspotEmail(email: string) {
    await this.page.locator('input[data-test-id="email-input-field"]').fill(email);
    await this.page.getByRole('button', { name: /^next$|^sign in$/i }).click();
  }

  async signInWithGoogle() {
    await this.page.getByText('Sign In with Google').click();
  }

  async selectHubspotAccount(email: string) {
    await this.page.waitForSelector('[data-identifier]', { state: 'visible' });
    await this.page.getByText(email, { exact: true }).click();
  }

  async fillHubspotOtp(hubspotOtp: string) {
    await this.page.waitForSelector('#code', { state: 'visible' });
    await this.page.locator('#code').fill(hubspotOtp);
    await this.page.getByText('Log in', { exact: true }).click();
    await this.page.getByText('Remember me', { exact: true }).click();
  }

  async finalizeLogin(portalId: string) {
    await this.page.getByText(new RegExp(`Portal:\\s*${portalId}`)).click();
    await this.page.waitForURL(/hubspot|contacts|portal/i, { timeout: 20000 });
  }
}
