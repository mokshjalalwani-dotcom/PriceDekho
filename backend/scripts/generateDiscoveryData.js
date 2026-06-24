const run = async () => {
  try {
    const cats = await fetch('http://localhost:5000/api/categories?all=true').then(r=>r.json());
    const gasStoveCat = cats.find(c => c.slug === 'gas-stove');
    const fanCat = cats.find(c => c.slug === 'fan');

    console.log('--- SECTION A: 1 & 2 ---');
    console.log('Gas Stove Cat:', JSON.stringify(gasStoveCat, null, 2));
    console.log('Fan Cat:', JSON.stringify(fanCat, null, 2));

    // Wait, getting subcategories using API requires admin auth.
    // I will read products directly.
    const gasProductsRes = await fetch('http://localhost:5000/api/products?category=gas-stove').then(r=>r.json());
    const fanProductsRes = await fetch('http://localhost:5000/api/products?category=fan').then(r=>r.json());
    
    const gasStoveProducts = gasProductsRes.products || [];
    const fanProducts = fanProductsRes.products || [];

    console.log('\n--- SECTION A: 3 ---');
    console.log('Total Gas Stove Products:', gasStoveProducts.length);
    console.log('Total Fan Products:', fanProducts.length);

    console.log('\n--- SECTION A: 4 ---');
    console.log('Product Name | Category | Child Category | SubCategory');
    const allProducts = [...gasStoveProducts, ...fanProducts];
    allProducts.forEach(p => {
      console.log(`${p.name} | ${p.category?.name} | ${p.childCategory} | ${p.subCategory}`);
    });

    console.log('\n--- SECTION A: 5 ---');
    const missingChild = allProducts.filter(p => !p.childCategory);
    const missingSub = allProducts.filter(p => !p.subCategory);
    console.log('Missing childCategory:', missingChild.map(p => p.name));
    console.log('Missing subCategory:', missingSub.map(p => p.name));

  } catch (err) {
    console.error(err);
  }
};
run();
