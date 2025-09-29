# 🔐 Authentication Flow

This document explains how the Google and HubSpot authentication flows work in **Quotivity Automation**, including required configurations, the OTP-based login sequence, and common pitfalls.

---

## 📝 Requirements

Before running any test that involves login:

- The **Google account** used for testing must have **only OTP (TOTP) authentication** enabled.  
  - ❌ No backup codes  
  - ❌ No additional login methods (e.g., recovery email, security keys)
- The **HubSpot account** should be linked to the same Google account and support OTP login.
- Ensure `.env` contains valid credentials and secrets (see `04_DEVELOPMENT_SETUP.md`).

Example `.env` values:
```env
GOOGLE_EMAIL=test.user@example.com
GOOGLE_PASS=supersecretpassword
GOOGLE_TOTP_SECRET=JBSWY3DPEHPK3PXP
HUBSPOT_URL=https://app.hubspot.com
TEST_ENV=staging
```

---

## 🌐 Google Login Flow

All Google logins follow this flow:

<details>
<summary>Step-by-step sequence</summary>

1. Navigate to the Google login page  
2. Fill in the **email address**  
3. Fill in the **password**  
4. Enter the **OTP code** generated from the TOTP secret  
5. (Optional) If multiple methods are present, Google may show an **auth selector screen** → ❌ This will break the test  
6. Upon successful login, Google redirects to HubSpot

</details>

Example Playwright code:

```typescript
await page.goto('https://accounts.google.com');

await page.locator('input[type="email"]').fill(process.env.GOOGLE_EMAIL!);
await page.getByRole('button', { name: /^next$/i }).click();

await page.locator('input[type="password"]').fill(process.env.GOOGLE_PASS!);
await page.getByRole('button', { name: /^next$/i }).click();

// Fill OTP
const otp = authenticator.generate(process.env.GOOGLE_TOTP_SECRET!);
await page.locator('input[type="tel"]').fill(otp);
await page.getByRole('button', { name: /^next$/i }).click();
```

---

## 🌐 HubSpot Login Flow

After a successful Google login, the browser is redirected to HubSpot.  
In most environments, the HubSpot OAuth screen appears once per session:

<details>
<summary>Step-by-step sequence</summary>

1. Google login completes  
2. User is redirected to HubSpot OAuth screen  
3. Click “Grant access” or “Accept”  
4. Land on the HubSpot application dashboard

</details>

---

## 💾 Storage State Reuse

Because the OTP flow can be time-consuming, we often **reuse storage states** to avoid logging in before every test.  
These are stored in the `storage/` folder.

Example:
```
storage/
├── google-staging.json
├── google-prod.json
└── hubspot-staging.json
```

You can generate these states manually or via a setup script and then reference them in fixtures.

```typescript
const requestContext = await playwright.request.newContext({
  storageState: `storage/google-${env}.json`,
});
```

---

## ⚠️ Known Issue: Google Auth Selector

Google may occasionally **auto-introduce additional login methods**, leading to an unexpected selector screen like this:

> “Choose an account to continue”

This interrupts the OTP flow and causes tests to fail.

### ✅ Mitigation Strategies
- Regularly verify that the test Google account has **exactly one authentication method** enabled.  
- If the selector appears, **manually log in once** and clear other login options.  
- Consider using **saved storage state** for stability in CI.

---

## ✅ Summary

- OTP-only Google authentication is required.  
- Auth selector screens will break tests — keep accounts clean.  
- HubSpot login follows after Google and may involve OAuth consent.  
- Storage state reuse is recommended for speed and reliability.
