import { APIRequestContext } from '@playwright/test';

export class QuoteApi {
  constructor(private request: APIRequestContext) {}

  async searchBundles(params: any, cookieHeader: string) {
    return await this.request.post('/pricebooks/search?bundle=header', {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      data: params,
    });
  }

  async searchProducts(params: any, cookieHeader: string) {
    return await this.request.post('/pricebooks/search', {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      data: params,
    });
  }
}
