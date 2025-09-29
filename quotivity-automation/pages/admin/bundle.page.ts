import {Page, expect} from '@fixtures';

export class BundlePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/bundles');
  }

  async createBundle(name: string) {
    console.log('Creating bundle with name:', name);
    await this.page.goto('/bundles/create');
    await this.page.getByRole('button', { name: 'Select from Product Library' }).click();
    await this.searchAndSelectItem(name);


  }

  async searchAndSelectItem(searchTerm: string) {
    // Type in the search box
    await this.page.locator('input[placeholder="Search name or SKU"]').fill(searchTerm);
    // Wait for search results to load
    await this.page.waitForTimeout(1000);
    // Hover over the first enabled row to reveal the button using mouse.move for reliability
    const firstRow = this.page.locator('tbody tr:not(.cursor-not-allowed)').first();
    await firstRow.scrollIntoViewIfNeeded();
    const box = await firstRow.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    }
    
      await firstRow.click({ force: true });
      await this.page.waitForTimeout(200);
      const button = firstRow.locator('button:not([disabled])');
      try {
        await button.waitFor({ state: 'visible', timeout: 2000 });
        await button.click();
      } catch (e) {
        console.warn('Button not visible after row click, trying force click...', e);
        await button.click({ force: true });
      }

    // Shows selected item
    await expect(this.page.getByText(searchTerm)).toBeVisible();
  }

  async addIncludedProduct(name: string, id: string) {
  // Click the first enabled 'Add Option' button
    await this.page.getByRole('button', { name: 'Add Option' }).first().click();
    await this.page.getByRole('button', { name: 'Add Products' }).click();
    await this.searchProductToOption(name, id);
  }

  async searchProductToOption(name: string, id: string) {
    await this.page.locator('input[placeholder="Search by name, SKU, or product type..."]').fill(name);
    await this.page.locator(`input#products\\.${id}\\.checked`).check();
    await this.page.getByRole('button', { name: 'Add Selected Products' }).click();
    await this.page.getByRole('button', { name: 'Save Option' }).click();


  }
  async setBundleAsActive() {
    const toggle = this.page.locator('div[data-sentry-component="Toggle"]');
    await expect(toggle.getByText('OFF')).toBeVisible();
    await toggle.click();
    await expect(toggle.getByText('ON')).toBeVisible();
  }

  async expectBundleInList(bundleName: string) {
    await expect(
      this.page.locator('table tbody tr td').getByText(bundleName)
    ).toBeVisible();
  }

}
