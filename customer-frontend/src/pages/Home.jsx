import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Zap, ShieldCheck, Truck, Clock, ChevronRight, Star, Headphones } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCategory } from '../context/CategoryContext';
import useSEO from '../hooks/useSEO';

const Home = () => {
  useSEO({
    title: 'Home',
    description: 'Welcome to Satguru Electronics - The best place to buy home appliances and electronics at unbeatable prices.',
    url: window.location.href
  });

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllMobile, setShowAllMobile] = useState(false);
  const { categories, loading: categoriesLoading } = useCategory();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, latestRes] = await Promise.all([
          axios.get('/api/products?pageSize=8&sortBy=rating_desc'),
          axios.get('/api/products?pageSize=8&sortBy=newest'),
        ]);
        setFeaturedProducts(featuredRes.data.products || []);
        setLatestProducts(latestRes.data.products || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  return (
    <div className="w-full">
      {/* Shop by Category */}
      <section className="pt-10 pb-12 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-heading">What do you want to buy today?</h2>
              <p className="text-sm text-gray-500 mt-1.5">Browse from our wide range of home appliances</p>
            </div>
            <Link to="/shop" className="text-sm text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-1 transition-colors shrink-0">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-8 gap-x-4 gap-y-6 sm:gap-6">
            {categoriesLoading ? (
              Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className={`flex flex-col items-center gap-2.5 w-full ${!showAllMobile && i >= 15 ? 'hidden sm:flex' : 'flex'}`}>
                  <div className="w-full aspect-square rounded-2xl bg-gray-100 animate-pulse max-w-[110px] mx-auto" />
                  <div className="h-3 bg-gray-100 animate-pulse rounded w-16" />
                </div>
              ))
            ) : (
              categories.map((cat, idx) => {
                const isHiddenMobile = !showAllMobile && idx >= 15;
                return (
                  <div key={cat.slug} className={`flex-col items-center gap-2.5 w-full group ${isHiddenMobile ? 'hidden sm:flex' : 'flex'}`}>
                    <Link
                      to={`/shop?category=${cat.slug}`}
                      className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 max-w-[110px] mx-auto ring-1 ring-black/5`}
                    >
                      {React.cloneElement(cat.icon, { size: 38, className: "text-white stroke-[1.5] group-hover:scale-110 transition-transform" })}
                    </Link>
                    <span className="font-semibold text-gray-700 text-[11px] sm:text-xs text-center leading-tight">{cat.name}</span>
                  </div>
                );
              })
            )}
          </div>
          
          {/* Mobile View More / View Less Toggle */}
          {!categoriesLoading && categories.length > 15 && (
            <div className="mt-8 flex justify-center sm:hidden">
              <button 
                onClick={() => setShowAllMobile(!showAllMobile)}
                className="px-6 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
              >
                {showAllMobile ? 'View Less' : 'View More'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* USP Trust Badges */}
      <section className="py-5 bg-gray-50/80 border-y border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, label: 'Genuine Products', sub: '100% authentic brands', color: 'text-green-600', bg: 'bg-green-50' },
              { icon: Truck, label: 'Fast Delivery', sub: 'Quick & reliable shipping', color: 'text-blue-600', bg: 'bg-blue-50' },
              { icon: Zap, label: 'Best Prices', sub: 'Competitive pricing always', color: 'text-orange-600', bg: 'bg-orange-50' },
              { icon: Headphones, label: 'Expert Support', sub: 'Dedicated service team', color: 'text-purple-600', bg: 'bg-purple-50' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className={`w-10 h-10 ${item.bg} rounded-full flex items-center justify-center shrink-0`}>
                  <item.icon size={20} className={item.color} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-[11px] text-gray-500">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-12 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-heading">Trending Products</h2>
              <p className="text-sm text-gray-500 mt-1.5">Top-rated picks from our store</p>
            </div>
            <Link to="/shop?sortBy=rating_desc" className="text-sm text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-1 transition-colors shrink-0">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Latest Arrivals */}
      <section className="py-12 bg-[var(--color-background)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="section-heading">Latest Arrivals</h2>
              <p className="text-sm text-gray-500 mt-1.5">Freshly added to our inventory</p>
            </div>
            <Link to="/shop?sortBy=newest" className="text-sm text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-1 transition-colors shrink-0">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              latestProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
