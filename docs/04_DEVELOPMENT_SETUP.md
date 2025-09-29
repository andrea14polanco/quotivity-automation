# ⚙️ Development Setup

This guide explains how to set up **Quotivity Automation** locally so you can run Playwright tests with Google + HubSpot OTP authentication.

---

## 🧭 Prerequisites

Before starting, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Playwright CLI](https://playwright.dev/docs/intro)
- A Google + HubSpot account configured for OTP-only authentication

Verify your installations:

```bash
node -v
npm -v
npx playwright --version
```

---

## 📦 Installing Dependencies

Clone the repository and install dependencies:

```bash
git clone <your-repo-url>
cd quotivity-automation
npm install
npx playwright install
```

This installs all required Node.js modules and browser binaries for Playwright.

---

## 📝 Environment Configuration

Create a `.env` file at the project root (based on `.env.sample`) and provide your credentials:

```env
GOOGLE_EMAIL=test.user@example.com
GOOGLE_PASS=supersecretpassword
GOOGLE_TOTP_SECRET=JBSWY3DPEHPK3PXP
HUBSPOT_URL=https://app.hubspot.com
TEST_ENV=staging
```

> ⚠️ Make sure this file is **not committed** to version control. Add `.env` to `.gitignore` if not already present.

---

## 🧪 Running Tests

Run all Playwright tests:

```bash
npx playwright test
```

Run a specific test file:

```bash
npx playwright test tests/login/hubspot-login.spec.ts
```

Run tests headed (with browser UI visible):

```bash
npx playwright test --headed
```

Run a single test by title:

```bash
npx playwright test -g "user can log in"
```

---

## 🌐 Useful npm Scripts

Common shortcuts are defined in `package.json`. For example:

```json
"scripts": {
  "test": "playwright test",
  "test:headed": "playwright test --headed",
  "report": "playwright show-report"
}
```

Run them like this:

```bash
npm run test:headed
npm run report
```

---

## 🧰 Playwright Test Report

After running tests, view the Playwright HTML report:

```bash
npx playwright show-report
```

This opens an interactive dashboard showing passed/failed tests, logs, screenshots, and traces.

---

## 📝 Summary

- Install Node, npm, Playwright.  
- Configure `.env` with valid Google/HubSpot credentials.  
- Use npm scripts to run tests.  
- Open Playwright reports for debugging.
