# 📂 Project Structure

This document explains the structure of the **Quotivity Automation** repository.  
It’s meant to help new contributors understand where things live and how the pieces fit together.

---

## 🏗️ Folder Tree

<details>
<summary>Click to expand the folder structure</summary>

```plaintext
quotivity-automation/
├── api/                    # API clients and helper classes
├── config/                 # Global config files (e.g. env.ts)
├── fixtures/               # Test data and mock objects
├── pages/                  # Page Object Model (POM) files for Playwright
├── storage/                # Saved browser storage states (Google, HubSpot)
├── tests/                  # Test suites
├── utils/                  # Utility functions
├── playwright-report/      # Auto-generated Playwright HTML reports
├── test-results/           # Screenshots, traces, videos
├── package.json
├── .env.sample
└── README.md
```

</details>

---

## 📁 Directory Descriptions

### `api/`
Contains helper classes for making authenticated API requests.  
These are typically initialized inside Playwright fixtures and shared across tests.

---

### `config/`
Holds global configuration, such as environment selectors (`env.ts`).  
This helps centralize URLs and environment-specific variables.

---

### `fixtures/`
Stores static data, test fixtures, or example payloads that are reused in tests.

---

### `pages/`
Implements the **Page Object Model (POM)**.  
Each file represents a page or component in the application, encapsulating selectors and actions.  
This helps keep tests clean and maintainable.

---

### `storage/`
Contains pre-saved authenticated browser storage states.  
For example: `storage/google-staging.json` may contain a Google login session for the `staging` environment.

---

### `tests/`
Contains the actual Playwright test suites.  
Tests are typically organized by feature or flow.

Example structure:

```plaintext
tests/
├── admin/
│   └── create-bundle.spec.ts
└── login/
    └── hubspot-login.spec.ts
```

---

### `utils/`
Contains general-purpose utility functions (e.g., TOTP generation, random string helpers, etc.).

---

## 🧭 How Everything Fits Together

1. **Tests** import **POMs** from `pages/` to interact with the UI.  
2. **Fixtures** (e.g., API clients, storage states) are loaded during test setup.  
3. **Config** files provide environment-specific settings.  
4. **Utils** support various helper operations like OTP generation.

This separation makes it easy to maintain and scale the test suite.
