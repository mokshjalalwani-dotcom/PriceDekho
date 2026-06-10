import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { Filter, SlidersHorizontal, ChevronRight, X, Search } from 'lucide-react';
import { CATEGORIES } from '../constants/categories';
import { CATEGORY_FIELDS, getFilterFields } from '../constants/CategoryFieldsConfig';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const [searchInCategory, setSearchInCategory] = useState('');

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
    return getFilterFields(categoryParam);
  }, [categoryParam]);

  const currentCategory = CATEGORIES.find(c => c.slug === categoryParam);

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
        const res = await axios.get('/api/brands');
        setBrands(res.data || []);
      } catch (e) { /* ignore */ }
    };
    fetchBrands();
  }, []);

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

  const clearAllFilters = () => navigate('/shop');

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
  const reservedKeys = ['page', 'pageSize', 'sortBy'];
  const activeFilters = [...searchParams.entries()].filter(([k]) => !reservedKeys.includes(k));

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center text-sm text-gray-500">
            <button onClick={() => navigate('/')} className="hover:text-orange-500 transition-colors">Home</button>
            <ChevronRight size={14} className="mx-1.5" />
            <button onClick={() => navigate('/shop')} className="hover:text-orange-500 transition-colors">Shop</button>
            {currentCategory && (
              <>
                <ChevronRight size={14} className="mx-1.5" />
                <span className="text-gray-900 font-medium">{currentCategory.name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentCategory ? currentCategory.name : keywordParam ? `Results for "${keywordParam}"` : 'All Products'}
            </h1>
            {!loading && <p className="text-sm text-gray-500 mt-1">{total} products found</p>}
          </div>
          <div className="flex items-center gap-3">
            <button
              className="md:hidden flex items-center gap-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2 hover:border-orange-300"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <SlidersHorizontal size={16} /> Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
            </button>
            <select
              value={sortParam}
              onChange={handleSortChange}
              className="border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-orange-200 outline-none"
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
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.map(([key, value]) => (
              <button
                key={`${key}-${value}`}
                onClick={() => toggleFilter(key, value)}
                className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200 hover:bg-orange-100 transition-colors"
              >
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>: {value}
                <X size={12} />
              </button>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-500 hover:text-red-500 font-medium underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className={`md:w-64 lg:w-72 shrink-0 ${mobileFiltersOpen ? 'block' : 'hidden'} md:block`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
                <Filter size={18} className="text-orange-500" />
                <h2 className="text-base font-bold text-gray-900">Filters</h2>
              </div>

              {/* Search within category */}
              {categoryParam && (
                <div className="mb-6">
                  <form onSubmit={handleSearchInCategory} className="flex gap-1">
                    <input
                      type="text"
                      value={searchInCategory}
                      onChange={(e) => setSearchInCategory(e.target.value)}
                      placeholder="Search in category..."
                      className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-200 outline-none"
                    />
                    <button type="submit" className="px-2 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      <Search size={14} className="text-gray-500" />
                    </button>
                  </form>
                </div>
              )}

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Categories</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => navigate('/shop')}
                    className={`block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${!categoryParam ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    All Categories
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`flex items-center justify-between w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${categoryParam === cat.slug ? 'bg-orange-50 text-orange-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <span>{cat.name}</span>
                      {categoryParam === cat.slug && <ChevronRight size={12} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              {brands.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm">Brand</h3>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {brands.map((brand) => (
                      <label key={brand._id} className="flex items-center group cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-3.5 h-3.5 rounded text-orange-500 border-gray-300 focus:ring-orange-400"
                          checked={isFilterActive('brand', brand.slug)}
                          onChange={() => toggleFilter('brand', brand.slug)}
                        />
                        <span className={`ml-2 text-sm transition-colors ${isFilterActive('brand', brand.slug) ? 'text-orange-600 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                          {brand.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability Filter */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Availability</h3>
                <div className="space-y-1.5">
                  {['In Stock', 'Out of Stock'].map(opt => (
                    <label key={opt} className="flex items-center group cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-3.5 h-3.5 rounded text-orange-500 border-gray-300 focus:ring-orange-400"
                        checked={isFilterActive('availability', opt)}
                        onChange={() => toggleFilter('availability', opt)}
                      />
                      <span className={`ml-2 text-sm transition-colors ${isFilterActive('availability', opt) ? 'text-orange-600 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                        {opt}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Dynamic Category-Specific Filters */}
              {categoryFilterFields.length > 0 && (
                <div className="space-y-6 pt-2 border-t border-gray-100">
                  {categoryFilterFields.map((field) => (
                    <div key={field.key}>
                      <h3 className="font-semibold text-gray-900 mb-3 text-sm">{field.label}</h3>
                      <div className="space-y-1.5">
                        {field.type === 'boolean' ? (
                          ['Yes', 'No'].map(opt => (
                            <label key={opt} className="flex items-center group cursor-pointer">
                              <input
                                type="checkbox"
                                className="w-3.5 h-3.5 rounded text-orange-500 border-gray-300 focus:ring-orange-400"
                                checked={isFilterActive(field.key, opt)}
                                onChange={() => toggleFilter(field.key, opt)}
                              />
                              <span className={`ml-2 text-sm transition-colors ${isFilterActive(field.key, opt) ? 'text-orange-600 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                {opt}
                              </span>
                            </label>
                          ))
                        ) : field.options ? (
                          field.options.map(opt => (
                            <label key={opt} className="flex items-center group cursor-pointer">
                              <input
                                type="checkbox"
                                className="w-3.5 h-3.5 rounded text-orange-500 border-gray-300 focus:ring-orange-400"
                                checked={isFilterActive(field.key, opt)}
                                onChange={() => toggleFilter(field.key, opt)}
                              />
                              <span className={`ml-2 text-sm transition-colors ${isFilterActive(field.key, opt) ? 'text-orange-600 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
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
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-80 animate-pulse shadow-sm border border-gray-100"></div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search size={28} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search query.</p>
                <button onClick={clearAllFilters} className="btn-primary">Clear All Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && pages > 1 && (
              <div className="flex justify-center mt-10 gap-2">
                {[...Array(pages).keys()].map((x) => (
                  <button
                    key={x + 1}
                    onClick={() => handlePageChange(x + 1)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium text-sm transition-colors ${Number(pageParam) === x + 1
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {x + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
