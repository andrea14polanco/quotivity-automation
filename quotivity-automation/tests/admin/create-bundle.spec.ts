import { Page, test } from '../../fixtures/index.js';
import { LoginPage } from '../../pages/admin/login.page.js';
import { BundlePage } from 'pages/admin/bundle.page.js';

const GOOGLE_EMAIL = process.env.GOOGLE_EMAIL!;
const GOOGLE_PASS = process.env.GOOGLE_PASS!;
const API_URL = process.env.API_URL!;

test.describe('Login Flow', () => {
 //test.use({ storageState: 'storage/google.json' }); // re-use saved Google session

  test('user sees landing page after portal selection', async ({ page, otp, quoteApi }: { page: Page, otp: string, quoteApi: any }) => {
  
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
    const bundleParams = {
      filters: 0,
      filterGroups: [],
      limit: 25,
      properties: ["name",]
    };
        
    const possibleBundleHeaderResponse = await quoteApi.searchBundles({...bundleParams}, cookieHeader);
    
    const data = await possibleBundleHeaderResponse.json();
    
    const firstUnrestricted = data.results.find((item: { bundleRestricted: boolean; }) => item.bundleRestricted === false);
    
    const bundleName = firstUnrestricted?.properties?.name;
    if (!bundleName) {
      throw new Error('No unrestricted bundle with a valid name found');
    }
    await bundle.createBundle(bundleName);

    const productSearch = {
      filters: 0,
      filterGroups: [],
      limit: 25,
      properties:[
            "id",
            "name",
            "quote_hapily_bundle_id"
        ] 
    };
    const availableProductsResponse = await quoteApi.searchProducts({...productSearch}, cookieHeader);

    const availableProductsData = await availableProductsResponse.json();

    const firstWithNoBundle = availableProductsData.results.find((item: 
      { properties: {
        name: string; quote_hapily_bundle_id: string  
    }}) => item.properties?.quote_hapily_bundle_id === "" && item.properties?.name !== bundleName);

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
