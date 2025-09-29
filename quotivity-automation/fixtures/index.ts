import { test as base, expect, request } from '@playwright/test';
import type { Page } from '@playwright/test';
import { QuoteApi } from '../api/quote-api.js';
import { generateToken } from 'authenticator';
import 'dotenv/config';

type Fixtures = {
  quoteApi: QuoteApi;
  otp: string;
  hubspotOtp: string;
  page: Page;
};


export const test = base.extend<Fixtures>({
  quoteApi: async ({ playwright }, use) => {
    const env = process.env.TEST_ENV || 'app';
    const requestContext = await playwright.request.newContext({
      baseURL: `https://${env}.quote.hapily.com`,
    });
    await use(new QuoteApi(requestContext));
    await requestContext.dispose();
  },
  otp: async ({}, use) => {
    const secret = process.env.OTP_SECRET;
    if (!secret) {
      throw new Error('OTP_SECRET not set in .env');
    }
    // Generate a fresh OTP every time it's used in a test
    const getOtp = () => generateToken(secret);
    await use(getOtp());
  },
  hubspotOtp: async ({}, use) => {
    const secret = process.env.HUBSPOT_OTP_SECRET;
    if (!secret) {
      throw new Error('HUBSPOT_OTP_SECRET not set in .env');
    }
    // Generate a fresh OTP every time it's used in a test
    const getOtp = () => generateToken(secret);
    await use(getOtp());
  }, page: async ({ page }, use) => {
    // Set default timeout for all actions
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(60000);
    await use(page);  
  }
});

export { expect } from '@playwright/test';
export type { Page } from '@playwright/test';
