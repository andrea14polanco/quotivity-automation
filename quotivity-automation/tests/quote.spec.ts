import { test, expect } from '../fixtures/index.js';
import { config } from '../config/env.js';

test.use({ storageState: `storage/google-${process.env.TEST_ENV || 'staging'}.json` });

test('create quote and open builder', async ({ page, quoteApi }) => {
  //const quoteId = await quoteApi.createQuote('44462208529');

 // await page.goto(`${config.appUrl}/wizard?action=edit&quoteId=${quoteId}&padded=true`);

  //await expect(page.getByRole('heading', { name: /create quote/i })).toBeVisible();
});
