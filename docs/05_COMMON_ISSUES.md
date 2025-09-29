# 🐞 Common Issues & Troubleshooting

This document lists frequent issues encountered when running **Quotivity Automation** tests, along with troubleshooting tips and best practices for stable runs.

---

## ⚠️ 1. Google Auth Selector Appears Unexpectedly

### ❌ Problem
Sometimes Google automatically adds new authentication methods (e.g. recovery email, backup codes).  
This triggers an **“auth selector” screen** during login:

> “Choose an account to continue”

This breaks the OTP-based login flow, causing tests to fail.

### 🧰 Solution
- Ensure the Google test account is configured with **OTP as the only login method**.  
- Regularly log into the Google account manually to confirm no extra methods were added.  
- If the selector appears, clear unused methods and retry.  
- Consider using **storage state** to bypass the login flow for repeated runs.

---

## 🔑 2. OTP Code Fails During Login

### ❌ Problem
The test enters an OTP code but Google rejects it.

### 🧰 Solution
- Make sure the system clock on the test runner is accurate. TOTP codes are time-sensitive.  
- Verify that the correct `GOOGLE_TOTP_SECRET` is set in `.env`.  
- Print the generated OTP temporarily for debugging:

```typescript
console.log('Generated OTP:', otp);
```

- If codes are consistently off, resync the TOTP secret with Google Authenticator.

---

## 🌐 3. Tests Hang During OAuth Consent Screen

### ❌ Problem
HubSpot OAuth screen sometimes doesn’t auto-redirect or the consent button selector changes.

### 🧰 Solution
- Check if HubSpot UI has changed (selectors might need updating).  
- Run the test in `--headed` mode to visually inspect what’s happening.  
- If necessary, add an explicit click for the consent button and wait for navigation.

---

## 🧼 4. Stale Storage State

### ❌ Problem
Using an old storage state can cause unexpected behavior if sessions expire or Google invalidates cookies.

### 🧰 Solution
- Regenerate the storage state manually or via a setup script.  
- Delete the stale file in `storage/` before regenerating.  
- Avoid committing personal or expired storage states to the repo.

---

## 🔁 5. Flaky Tests in CI

### ❌ Problem
Tests sometimes pass locally but fail intermittently in CI.

### 🧰 Solution
- Use `--retries=2` in CI to auto-retry failed tests:
```bash
npx playwright test --retries=2
```
- Ensure network stability in the CI environment.  
- Increase timeouts for OTP entry or slow pages using `test.slow()` or `page.setDefaultTimeout()`.  
- Use **storage state** for authentication instead of redoing OTP flows in CI.

---

## 📝 Best Practices

- Keep Google test accounts clean and OTP-only.  
- Regularly regenerate storage states to avoid session drift.  
- Use Playwright reports and traces to debug flaky behavior.  
- Run headed locally to quickly diagnose UI issues.  
- Document any selector or flow changes in the tests promptly.

---

## ✅ Summary

Most issues arise from authentication flow changes or stale sessions.  
Following these troubleshooting steps ensures more stable and predictable test runs.
