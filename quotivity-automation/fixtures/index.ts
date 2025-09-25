import { test as base, expect, request } from '@playwright/test';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { QuoteApi } from '../api/quote-api.js';

type Fixtures = {
  quoteApi: QuoteApi;
};

async function getGoogleIdToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Google token: ${res.status} ${await res.text()}`);
  }
  const json = await res.json() as { id_token: string };
  return json.id_token;
}

async function ensureStorageState(env: string) {
  const storagePath = path.resolve(`storage/google-${env}.json`);

  if (fs.existsSync(storagePath)) {
    return storagePath;
  }

  // --- 1. Get a fresh Google id_token ---
  const idToken = await getGoogleIdToken();

  // --- 2. Call your backend to exchange id_token for app session ---
  // Assume your backend has a test endpoint like /auth/test-google
  const ctx = await request.newContext({
    baseURL: `https://${env}.quote.hapily.com`,
  });

  const resp = await ctx.post('/auth/test-google', {
    data: { id_token: idToken },
  });

  if (!resp.ok()) {
    throw new Error(`Backend login failed: ${resp.status()} ${await resp.text()}`);
  }

  // --- 3. Save resulting storageState for reuse ---
  await ctx.storageState({ path: storagePath });
  await ctx.dispose();

  return storagePath;
}

export const test = base.extend<Fixtures>({
  quoteApi: async ({ playwright }, use) => {
    const env = process.env.TEST_ENV || 'staging';
    const storageStatePath = await ensureStorageState(env);

    const requestContext = await playwright.request.newContext({
      storageState: storageStatePath,
      baseURL: `https://${env}.quote.hapily.com`,
    });

    await use(new QuoteApi(requestContext));

    await requestContext.dispose();
  },
});

export { expect } from '@playwright/test';
