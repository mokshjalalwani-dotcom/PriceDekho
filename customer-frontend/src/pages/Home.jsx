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
    description: 'Welcome to Satguru Electricals - The best place to buy home appliances and electronics at unbeatable prices.',
    url: window.location.href
  });

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
      <section className="py-6 sm:pt-8 sm:pb-12 bg-white min-h-[calc(100dvh-70px)] sm:min-h-0 flex flex-col justify-center">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col flex-1 w-full justify-center">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="section-heading text-xl sm:text-2xl">What do you want to buy today?</h2>
              <p className="text-sm text-gray-500 mt-1 sm:mt-1.5 hidden sm:block">Browse from our wide range of home appliances</p>
            </div>
            <Link to="/shop" className="text-sm text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-1 transition-colors shrink-0">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-x-3 gap-y-5 sm:gap-4 lg:gap-6 my-auto">
            {categoriesLoading ? (
              Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center w-full">
                  <div className="w-full aspect-square rounded-[14px] sm:rounded-2xl bg-gray-100 animate-pulse max-w-[70px] sm:max-w-[110px] mx-auto" />
                  <div className="h-2.5 sm:h-3 bg-gray-100 animate-pulse rounded w-12 sm:w-16 mt-2 sm:mt-2.5" />
                </div>
              ))
            ) : (
              categories.map((cat) => (
                <div key={cat.slug} className="flex flex-col items-center w-full group">
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    className={`w-full aspect-square rounded-[16px] sm:rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 max-w-[85px] sm:max-w-[110px] mx-auto ring-1 ring-black/5 p-2 sm:p-0`}
                  >
                    {React.cloneElement(cat.icon, { size: "100%", className: "w-7 h-7 sm:w-10 sm:h-10 text-white stroke-[1.5] group-hover:scale-110 transition-transform" })}
                  </Link>
                  <span className="font-semibold text-gray-700 text-[10px] sm:text-xs text-center leading-[1.2] mt-2 sm:mt-2.5 w-full line-clamp-2 px-1">{cat.name}</span>
                </div>
              ))
            )}
          </div>
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
