import { APIRequestContext } from '@playwright/test';

export class QuoteApi {
  constructor(private request: APIRequestContext) {}

  async createQuote(dealId: string): Promise<string> {
    const res = await this.request.post('/quotes', {
      data: { dealId },
    });

    if (!res.ok()) {
      throw new Error(`Quote creation failed: ${res.status()} ${res.statusText()}`);
    }

    const body = await res.json();
    return body.id || body.quoteId;
  }
}
