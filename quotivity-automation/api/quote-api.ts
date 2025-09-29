import { APIRequestContext } from '@playwright/test';

const API_URL = process.env.API_URL!;
export class QuoteApi {
  constructor(private request: APIRequestContext) {}
   
  async searchBundles(params: any, cookieHeader: string) {
    console.log('Searching bundles with params:', params);
    return await this.request.post(`${API_URL}/pricebooks/search?bundle=header`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      data: params,
    });
  }

  async searchProducts(params: any, cookieHeader: string) {
    return await this.request.post(`${API_URL}/pricebooks/search`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      data: params,
    });
  }
}
