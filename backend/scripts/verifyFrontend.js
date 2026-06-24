import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  console.log('1. updateParam Implementation:');
  console.log(`  const updateParam = (key, value) => {
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', 1);
    navigate(\`/shop?\${params.toString()}\`);
  };`);

  console.log('\n2. Product Fetch Trigger Implementation:');
  console.log(`  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(\`/api/products\${location.search || '?'}\`);
        setProducts(res.data.products || []);
        setPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      } catch (error) { ... }
    };
    fetchProducts();
  }, [location.search]);`);

  let requestLogs = [];

  page.on('request', request => {
    if (request.url().includes('/api/products')) {
      requestLogs.push(request.url());
    }
  });

  console.log('\nNavigating to /shop?category=gas-stove ...');
  await page.goto('http://localhost:5175/shop?category=gas-stove', { waitUntil: 'networkidle0' });

  console.log('Initial API requests sent:');
  requestLogs.forEach(r => console.log('  ->', r));
  requestLogs = []; // clear

  console.log('\nLocating and Clicking "Chimney" button...');
  // Find the button with text "Chimney"
  const clicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const chimneyBtn = buttons.find(b => b.innerText.trim() === 'Chimney');
    if (chimneyBtn) {
      chimneyBtn.click();
      return true;
    }
    return false;
  });

  if (!clicked) {
    console.log('Could not find Chimney button!');
    await browser.close();
    process.exit(1);
  }

  // Wait a moment for react state and network requests to fire
  await new Promise(r => setTimeout(r, 1000));

  console.log('\n3. Browser Network Verification (After Click):');
  if (requestLogs.length === 0) {
    console.log('  No requests intercepted after clicking!');
  } else {
    requestLogs.forEach(r => {
      console.log('  Request URL:', r);
      console.log('  Query Params:', r.split('?')[1]);
    });
  }

  console.log('\n4. URL State Verification:');
  const finalHref = await page.evaluate(() => window.location.href);
  const finalSearch = await page.evaluate(() => window.location.search);
  console.log('  window.location.href:', finalHref);
  console.log('  searchParams.toString():', new URLSearchParams(finalSearch).toString());

  console.log('\n5. React State Verification:');
  console.log(`  searchParams.get('childCategory') = ${new URLSearchParams(finalSearch).get('childCategory')}`);

  console.log('\nResult:');
  if (!new URLSearchParams(finalSearch).get('childCategory')) {
    console.log('  URL does NOT contain childCategory=Chimney.');
    console.log('  CONCLUSION: The bug is inside updateParam/searchParams synchronization.');
  } else {
    console.log('  URL contains childCategory=Chimney.');
    console.log('  CONCLUSION: The bug is inside product fetching.');
  }

  await browser.close();
})();
