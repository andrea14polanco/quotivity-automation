import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/sign-in-link-request');
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
      .toBeVisible();
  }
}
