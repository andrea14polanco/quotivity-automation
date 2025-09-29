import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/sign-in-link-request');
    //load the cookie
    
  }

  async loginWithGoogle({ email, password, otp }: { email: string; password: string; otp: string }) {
    await this.goto();
    await this.clickGoogle();

    await this.page.locator('input[type="email"]').fill(email);
    await this.page.getByRole('button', { name: /^next$/i }).click();

    await this.page.locator('input[type="password"][name="Passwd"]').fill(password);
    await this.page.getByRole('button', { name: /^next$|^sign in$/i }).click();

     // Handle Google 2FA selection screen if present
    if (await this.page.locator('div:has-text("Choose a verification method")').isVisible({ timeout: 2000 })) {
      // Try to select Authenticator app or OTP
      const otpOption = this.page.getByRole('button', { name: /authenticator app|google authenticator|otp|verification code/i });
      if (await otpOption.isVisible()) {
        await otpOption.click();
      } else {
        // Fallback: select first available method
        await this.page.getByRole('button', { name: /next|continue/i }).first().click();
      }
    }

    await this.page.locator('input[type="tel"][name="totpPin"]').fill(otp);
    await this.page.getByRole('button', { name: /^next$/i }).click();

    await expect(this.page.getByText(/Please Select an Account to Sign In/i)).toBeVisible();

    await this.chooseAccount();
    await this.expectLoggedIn();
  }

  async clickGoogle() {
    await this.page.getByText('Sign In with Google').click();
  }

  async chooseAccountByPortalId(portalId: string) {
    const row = this.page.locator(`tr:has-text("${portalId}")`);
    await row.getByRole('button', { name: /sign in/i }).click();
  }

  async chooseAccountByDomain(domain: string) {
    const row = this.page.locator(`tr:has-text("${domain}")`);
    await row.getByRole('button', { name: /sign in/i }).click();
  }

  async chooseAccount() {
    const portalId = process.env.PORTAL_ID;
    const domain = process.env.PORTAL_DOMAIN;

    if (portalId) {
      await this.chooseAccountByPortalId(portalId);
    } else if (domain) {
      await this.chooseAccountByDomain(domain);
    } else {
      throw new Error('No account selector defined. Set PORTAL_ID or PORTAL_DOMAIN in .env');
    }
  }

  async expectLoggedIn() {
     await expect(this.page.getByRole('heading', { name: /what would you like to do today/i }))
      .toBeVisible({timeout: 50000});
  }
}
