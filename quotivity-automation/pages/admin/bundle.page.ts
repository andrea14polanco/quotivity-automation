import {Page, expect} from '@fixtures';

export class BundlePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/bundles');
  }

  async createBundle(name: string, description: string) {
    await this.page.goto('/admin/bundles/create');
    await this.page.getByRole('button', { name: 'Select from Product Library' }).click();
    const row = await this.page.locator('tbody tr:not(.cursor-not-allowed)').first();
    await row.hover();
    await row.locator('button.cursor-pointer:not([disabled])').click();

  }
}
