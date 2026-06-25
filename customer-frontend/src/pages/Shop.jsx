import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, ChevronRight, ChevronLeft, X, Search } from 'lucide-react';
import { useCategory } from '../context/CategoryContext';
import { CATEGORY_FIELDS, getFilterFields } from '../constants/CategoryFieldsConfig';
import useSEO from '../hooks/useSEO';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const [searchInCategory, setSearchInCategory] = useState('');
  const [dbSubcategories, setDbSubcategories] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const categoryParam = searchParams.get('category') || '';
  const pageParam = searchParams.get('page') || 1;
  const sortParam = searchParams.get('sortBy') || '';
  const keywordParam = searchParams.get('keyword') || '';

  // Get category-specific filter fields
  const categoryFilterFields = useMemo(() => {
    if (!categoryParam) return [];
    return getFilterFields(categoryParam, searchParams.get('childCategory') || searchParams.get('subCategory'));
  }, [categoryParam, searchParams]);

  const { categories } = useCategory();
  const currentCategory = categories.find(c => c.slug === categoryParam);

  useSEO({
    title: currentCategory ? currentCategory.name : (keywordParam ? `Search: ${keywordParam}` : 'Shop All Products'),
    description: currentCategory 
      ? `Buy the best ${currentCategory.name} at great prices.` 
      : 'Browse our extensive range of home appliances and electronics.',
    url: window.location.href
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/products${location.search || '?'}`);
        setProducts(res.data.products || []);
        setPages(res.data.pages || 1);
        setTotal(res.data.total || 0);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [location.search]);

  // Fetch brands for filter
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const childCat = searchParams.get('childCategory');
        let url = '/api/brands';
        if (currentCategory) {
          url += `?category=${currentCategory._id}`;
          if (childCat) {
            url += `&childCategory=${encodeURIComponent(childCat)}`;
          }
        }
        const res = await axios.get(url);
        setBrands(res.data || []);
      } catch (e) { /* ignore */ }
    };
    fetchBrands();
  }, [currentCategory?._id, searchParams.get('childCategory')]);

  // Fetch db subcategories for dynamic third tier
  useEffect(() => {
    if (currentCategory) {
      const fetchDbSubcategories = async () => {
        try {
          const res = await axios.get(`/api/subcategories?category=${currentCategory._id}`);
          setDbSubcategories(res.data || []);
        } catch (e) { /* ignore */ }
      };
      fetchDbSubcategories();
    } else {
      setDbSubcategories([]);
    }
  }, [currentCategory]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(location.search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', 1);
    navigate(`/shop?${params.toString()}`);
  };

  const updateParams = (updates) => {
    const params = new URLSearchParams(location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    params.set('page', 1);
    navigate(`/shop?${params.toString()}`);
  };

  const toggleFilter = (key, value) => {
    const params = new URLSearchParams(location.search);
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.set('page', 1);
    navigate(`/shop?${params.toString()}`);
  };

  const isFilterActive = (key, value) => searchParams.get(key) === value;

  const clearAllFilters = () => {
    if (categoryParam) {
      navigate(`/shop?category=${categoryParam}`);
    } else {
      navigate('/shop');
    }
  };

  const handleCategoryChange = (slug) => {
    if (slug === categoryParam) {
      navigate('/shop');
    } else {
      navigate(`/shop?category=${slug}`);
    }
  };

  const handleSortChange = (e) => updateParam('sortBy', e.target.value);

  const handleSearchInCategory = (e) => {
    e.preventDefault();
    if (searchInCategory.trim()) {
      updateParam('keyword', searchInCategory.trim());
    }
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(location.search);
    params.set('page', page);
    navigate(`/shop?${params.toString()}`);
  };

  // Active filters count
  const reservedKeys = ['page', 'pageSize', 'sortBy', 'subCategory', 'category', 'childCategory'];
  const activeFilters = [...searchParams.entries()].filter(([k]) => !reservedKeys.includes(k));

  /* Skeleton card for loading states */
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden">
      <div className="aspect-square skeleton-shimmer" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 skeleton-shimmer rounded w-1/3" />
        <div className="h-4 skeleton-shimmer rounded w-4/5" />
        <div className="h-4 skeleton-shimmer rounded w-2/3" />
        <div className="pt-2 border-t border-gray-50">
          <div className="h-5 skeleton-shimmer rounded w-1/2" />
        </div>
      </div>
    </div>
  );

  const pageNum = Number(pageParam);

  return (
    <div className="bg-[var(--color-background)] min-h-screen pb-16">
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-5 lg:px-6 py-2.5">
          <div className="flex items-center text-sm text-gray-500">
            <button onClick={() => navigate('/')} className="hover:text-theme-primary transition-colors">Home</button>
            <ChevronRight size={14} className="mx-1.5 text-gray-300" />
            <button onClick={() => navigate('/shop')} className="hover:text-theme-primary transition-colors">Shop</button>
            {currentCategory && (
              <>
                <ChevronRight size={14} className="mx-1.5 text-gray-300" />
                <span className="text-gray-900 font-medium">{currentCategory.name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-3 sm:px-5 lg:px-6 pt-3 md:pt-4">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 md:mb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              {currentCategory ? currentCategory.name : keywordParam ? `Results for "${keywordParam}"` : 'All Products'}
            </h1>
            {!loading && <p className="text-xs md:text-sm text-gray-500 mt-1">{total} products found</p>}
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <button
              className="md:hidden flex items-center gap-2 text-xs md:text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2 md:px-3.5 md:py-2.5 hover:border-theme-focus transition-colors shadow-sm"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <SlidersHorizontal size={16} /> Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
            </button>
            <select
              value={sortParam}
              onChange={handleSortChange}
              className="border border-gray-200 bg-white rounded-lg px-3 py-2 md:px-4 md:py-2.5 text-xs md:text-sm text-gray-700 focus:ring-2 focus:ring-theme-focus outline-none shadow-sm cursor-pointer appearance-none pr-7 md:pr-8"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
            >
              <option value="">Sort: Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="rating_desc">Top Rated</option>
              <option value="discount_desc">Highest Discount</option>
            </select>
          </div>
        </div>


        {/* Active Filter Pills */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-1.5 md:gap-2 mb-3 md:mb-4">
            {activeFilters.map(([key, value]) => (
              <button
                key={`${key}-${value}`}
                onClick={() => toggleFilter(key, value)}
                className="inline-flex items-center gap-1 md:gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 bg-theme-light text-theme-dark text-[10px] md:text-xs font-medium rounded-full border border-theme-light hover:bg-theme-light transition-colors"
              >
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>: {value}
                <X size={10} className="md:w-3 md:h-3" />
              </button>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-[10px] md:text-xs text-gray-500 hover:text-red-500 font-medium underline ml-1"
            >
              Clear All
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          {/* Mobile Filter Overlay Backdrop */}
          {mobileFiltersOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-30 md:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
          )}

          {/* Sidebar Filters */}
          <div className={`${mobileFiltersOpen ? 'fixed inset-y-0 left-0 z-40 w-72 animate-slide-in-left' : 'hidden'} md:relative md:block md:w-60 lg:w-64 shrink-0`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-4 md:sticky md:top-24 max-h-[calc(100vh-120px)] overflow-y-auto h-full md:h-auto">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-theme-primary" />
                  <h2 className="text-base font-bold text-gray-900">Filters</h2>
                </div>
                <button
                  className="md:hidden text-gray-400 hover:text-gray-600 p-1"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>


              {/* Categories */}
              <div className="mb-6">
                {!currentCategory ? (
                  <>
                    <h3 className="font-semibold text-gray-900 mb-3 text-sm">Categories</h3>
                    <div className="space-y-0.5">
                      <button
                        onClick={() => navigate('/shop')}
                        className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!categoryParam ? 'bg-theme-light text-theme-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        All Categories
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.slug}
                          onClick={() => handleCategoryChange(cat.slug)}
                          className={`flex items-center justify-between w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${categoryParam === cat.slug ? 'bg-theme-light text-theme-primary font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                          <span>{cat.name}</span>
                          {categoryParam === cat.slug && <ChevronRight size={12} />}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => navigate('/shop')}
                      className="flex items-center text-sm font-medium text-gray-500 hover:text-theme-primary mb-4 transition-colors group"
                    >
                      <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-0.5 transition-transform" /> Back to Categories
                    </button>
                    <button
                      onClick={() => updateParams({ childCategory: '', subCategory: '' })}
                      className={`block w-full text-left font-bold mb-3 text-sm transition-colors ${!searchParams.get('childCategory') ? 'text-theme-primary' : 'text-gray-900 hover:text-theme-primary'}`}
                    >
                      {currentCategory.name}
                    </button>
                    
                    {currentCategory?.subCategories?.length > 0 && (
                      <div className="space-y-0.5 border-l-2 border-theme-light pl-3 ml-1">
                        
                        {currentCategory.subCategories.map(sub => {
                          const subName = typeof sub === 'string' ? sub : sub.name;
                          const isActiveChild = searchParams.get('childCategory') === subName;
                          const isActiveCategory = typeof sub === 'string' ? true : sub.isActive !== false;
                          
                          if (!isActiveCategory) return null;
                          
                          return (
                            <div key={subName} className="py-0.5">
                               <button 
                                 onClick={() => updateParams({ childCategory: subName, subCategory: '' })}
                                 className={`block w-full text-left py-1.5 text-sm transition-colors ${isActiveChild && !searchParams.get('subCategory') ? 'text-theme-primary font-medium' : isActiveChild ? 'text-gray-900 font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                               >
                                 {subName}
                               </button>
                               
                               {isActiveChild && dbSubcategories.filter(s => s.childCategory === subName).length > 0 && (
                                 <div className="ml-2 mt-1 mb-2 space-y-1 pl-3 border-l-2 border-gray-100">
                                   {dbSubcategories.filter(s => s.childCategory === subName).map(s => (
                                     <button 
                                       key={s._id}
                                       onClick={() => updateParam('subCategory', s.name)}
                                       className={`block w-full text-left py-1 text-xs transition-colors ${searchParams.get('subCategory') === s.name ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                                     >
                                       {s.name}
                                     </button>
                                   ))}
                                 </div>
                               )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Brand Filter */}
              {brands.length > 0 && (
                <div className="mb-6 pt-4 border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Brand</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {brands.map((brand) => (
                      <label key={brand._id} className="flex items-center group cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 rounded text-theme-primary border-gray-300 focus:ring-theme-focus"
                          checked={isFilterActive('brand', brand.slug)}
                          onChange={() => toggleFilter('brand', brand.slug)}
                        />
                        <span className={`ml-2.5 text-sm transition-colors ${isFilterActive('brand', brand.slug) ? 'text-theme-primary font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                          {brand.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Filter */}
              <div className="mb-6 pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Availability</h3>
                <div className="space-y-2">
                  {['In Stock', 'Out of Stock'].map(opt => (
                    <label key={opt} className="flex items-center group cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 rounded text-theme-primary border-gray-300 focus:ring-theme-focus"
                        checked={isFilterActive('availability', opt)}
                        onChange={() => toggleFilter('availability', opt)}
                      />
                      <span className={`ml-2.5 text-sm transition-colors ${isFilterActive('availability', opt) ? 'text-theme-primary font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dynamic Category-Specific Filters */}
              {categoryFilterFields.length > 0 && (
                <div className="space-y-6 pt-4 border-t border-gray-100">
                  {categoryFilterFields.map((field) => (
                    <div key={field.key}>
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm">{field.label}</h3>
                      <div className="space-y-2">
                        {field.type === 'boolean' ? (
                          ['Yes', 'No'].map(opt => (
                            <label key={opt} className="flex items-center group cursor-pointer">
                              <input
                                type="checkbox"
                                className="w-3.5 h-3.5 rounded text-theme-primary border-gray-300 focus:ring-theme-focus"
                                checked={isFilterActive(field.key, opt)}
                                onChange={() => toggleFilter(field.key, opt)}
                              />
                              <span className={`ml-2.5 text-sm transition-colors ${isFilterActive(field.key, opt) ? 'text-theme-primary font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                {opt}
                              </span>
                            </label>
                          ))
                        ) : field.options ? (
                          field.options.map(opt => (
                            <label key={opt} className="flex items-center group cursor-pointer">
                              <input
                                type="checkbox"
                                className="w-3.5 h-3.5 rounded text-theme-primary border-gray-300 focus:ring-theme-focus"
                                checked={isFilterActive(field.key, opt)}
                                onChange={() => toggleFilter(field.key, opt)}
                              />
                              <span className={`ml-2.5 text-sm transition-colors ${isFilterActive(field.key, opt) ? 'text-theme-primary font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                {opt}
                              </span>
                            </label>
                          ))
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Product Grid */}
          <div className="flex-1 min-w-0">


            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-5">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200/60 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={28} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search query.</p>
                <button onClick={clearAllFilters} className="btn-primary">Clear All Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-5">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && pages > 1 && (
              <div className="flex justify-center items-center mt-10 gap-1.5">
                <button
                  onClick={() => pageNum > 1 && handlePageChange(pageNum - 1)}
                  disabled={pageNum <= 1}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-colors bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                {[...Array(pages).keys()].map((x) => (
                  <button
                    key={x + 1}
                    onClick={() => handlePageChange(x + 1)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm transition-colors ${pageNum === x + 1
                        ? 'bg-theme-primary text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {x + 1}
                  </button>
                ))}
                <button
                  onClick={() => pageNum < pages && handlePageChange(pageNum + 1)}
                  disabled={pageNum >= pages}
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-colors bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
