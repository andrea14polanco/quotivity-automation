import { Page, test } from '../../fixtures/index.js';
import { LoginPage } from '../../pages/admin/login.page.js';
import { BundlePage } from 'pages/admin/bundle.page.js';

const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL!;
const GOOGLE_PASS = process.env.GOOGLE_PASS!;
const API_URL = process.env.API_URL!;

test.describe('Login Flow', () => {
 //test.use({ storageState: 'storage/google.json' }); // re-use saved Google session

  test('user sees landing page after portal selection', async ({ page, otp }: { page: Page, otp: string }) => {
  
    const login = new LoginPage(page);
    
    await login.loginWithGoogle({
        email: GOOGLE_EMAIL,
        password: GOOGLE_PASS,
        otp,
    });
    
      const bundle = new BundlePage(page);
    await bundle.goto();
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === 'hapily_session_quote');
    const cookieHeader = `hapily_session_quote=${sessionCookie?.value}`;
    const possibleBundleHeaderResponse = await page.request.post(`${API_URL}/pricebooks/search?bundle=header`, {
    headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
    },
    data: {
        filters: 0,
        filterGroups: [],
        limit: 25,
        properties: [
            "name",
            "hs_product_type",
            "hs_sku",
            "price",
            "quote_hapily_product_tax_code",
            "hs_recurring_billing_period",
            "recurringbillingfrequency",
            "hs_billing_start_delay_type",
            "name",
            "quantity",
            "recurringbillingfrequency",
            "hs_recurring_billing_start_date",
            "name",
            "hs_sku",
            "recurringbillingfrequency",
            "hs_recurring_billing_start_date",
            "hapily_price_books"
            ] 
    }

    });

    const data = await possibleBundleHeaderResponse.json();

    const firstUnrestricted = data.results.find((item: { bundleRestricted: boolean; }) => item.bundleRestricted === false);
    
    await bundle.createBundle(firstUnrestricted.properties?.name || '');


    const availableProductsResponse = await page.request.post(`${API_URL}/pricebooks/search`, {
    headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
    },
    data: {
        filters: 0,
        filterGroups: [],
        limit: 25,
        properties: [
            "id",
            "name",
            "quote_hapily_bundle_id"
            ] 
    }

    });

    const availableProductsData = await availableProductsResponse.json();
 
    const firstWithNoBundle = availableProductsData.results.find((item: 
      { properties: { quote_hapily_bundle_id: string } }) => item.properties?.quote_hapily_bundle_id === "");

    if (!firstWithNoBundle || !firstWithNoBundle.properties) {
      throw new Error('No available product found without a bundle or missing properties');
    }

    await bundle.addIncludedProduct(
      firstWithNoBundle.properties.name || '',
      firstWithNoBundle.id || ''
    );
    await bundle.setBundleAsActive();

    await bundle.goto();

    //check bundle is in bundle list
    await bundle.expectBundleInList(firstUnrestricted.properties?.name || '');
    
  });
});
