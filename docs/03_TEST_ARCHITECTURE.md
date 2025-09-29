# 🧪 Test Architecture

This document explains how tests are structured in **Quotivity Automation**, including the Playwright setup, fixtures, the Page Object Model (POM), and API context usage.

---

## 🧰 Stack Overview

The test suite uses the following stack:

- **[Playwright](https://playwright.dev)** — browser automation framework
- **TypeScript** — typed language support for maintainable tests
- **dotenv** — environment variable loading
- **notp / authenticator** — for OTP generation (TOTP)
- **Node.js** — runtime

```bash
npm install
npx playwright install
```

---

## 🧱 Base Test Fixture

Playwright allows extending the base `test` object to include custom fixtures.  
For example, the project defines a `quoteApi` fixture for authenticated API requests:

```typescript
// fixtures/base.ts
import { test as base } from '@playwright/test';
import { QuoteApi } from '../api/quote-api.js';

type Fixtures = {
  quoteApi: QuoteApi;
};

export const test = base.extend<Fixtures>({
  quoteApi: async ({ playwright }, use) => {
    const env = process.env.TEST_ENV || 'staging';

    const requestContext = await playwright.request.newContext({
      storageState: `storage/google-${env}.json`,
      baseURL: `https://${env}.quote.hapily.com`,
    });

    await use(new QuoteApi(requestContext));
    await requestContext.dispose();
  },
});

export { expect } from '@playwright/test';
```

With this fixture in place, any test can directly use `quoteApi` without manual setup.

---

## 🧭 Page Object Model (POM)

The **POM pattern** organizes selectors and actions into reusable classes under the `pages/` directory.  
Each page class represents a single page or component in the application.

Example:

```typescript
// pages/LoginPage.ts
import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('https://accounts.google.com');
  }

  async login(email: string, password: string, otp: string) {
    await this.page.locator('input[type="email"]').fill(email);
    await this.page.getByRole('button', { name: /^next$/i }).click();

    await this.page.locator('input[type="password"]').fill(password);
    await this.page.getByRole('button', { name: /^next$/i }).click();

    await this.page.locator('input[type="tel"]').fill(otp);
    await this.page.getByRole('button', { name: /^next$/i }).click();
  }
}
```

Using POM keeps tests clean:

```typescript
const login = new LoginPage(page);
await login.goto();
await login.login(process.env.GOOGLE_EMAIL!, process.env.GOOGLE_PASS!, otp);
```

---

## 🌐 API Context Usage

Some tests require authenticated API interactions (e.g., creating entities before UI tests).  
Using the fixture pattern, a **Playwright `APIRequestContext`** is initialized with storage state.

```typescript
// example usage inside a test
test('creates a bundle via API', async ({ quoteApi }) => {
  const bundle = await quoteApi.createBundle({ name: 'My Bundle' });
  expect(bundle.id).toBeDefined();
});
```

This avoids repetitive login UI flows when preparing test data.

---

## 🧪 Typical Test Flow

<details>
<summary>Click to expand an example flow</summary>

```typescript
test('user can log in and see dashboard', async ({ page }) => {
  const login = new LoginPage(page);
  await login.goto();

  const otp = authenticator.generate(process.env.GOOGLE_TOTP_SECRET!);
  await login.login(process.env.GOOGLE_EMAIL!, process.env.GOOGLE_PASS!, otp);

  await expect(page.getByText(/Dashboard/i)).toBeVisible();
});
```

</details>

---

## 📝 Summary

- Tests use Playwright + TypeScript + POM.  
- Fixtures provide reusable contexts (e.g., API, storage).  
- POM classes encapsulate page interactions.  
- API contexts speed up data setup.  
- Tests follow a clean and predictable flow.
