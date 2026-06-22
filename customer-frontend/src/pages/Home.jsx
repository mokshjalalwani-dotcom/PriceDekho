import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Zap, ShieldCheck, Truck, ChevronRight, Star, Headphones } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { CATEGORIES } from '../constants/categories';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      {/* ─── Shop by Category ─── */}
      <section className="pt-8 pb-10 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Shop by Category</h2>
              <p className="text-sm text-gray-500 mt-1">Browse from our wide range of home appliances</p>
            </div>
            <Link to="/shop" className="text-sm text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-1 transition-colors shrink-0">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          {/* Category Grid — 4 cols mobile, 8 cols desktop for 16 categories in 2 rows */}
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3 sm:gap-4">
            {CATEGORIES.map((cat, index) => (
              <Link
                key={cat.slug}
                to={`/shop?category=${cat.slug}`}
                className="category-card group flex flex-col items-center gap-2 p-2 sm:p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Icon circle with gradient */}
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm`}>
                  {React.cloneElement(cat.icon, { size: 26, className: "text-white stroke-[1.5]" })}
                </div>
                {/* Name */}
                <span className="font-semibold text-gray-700 text-[10px] sm:text-[11px] text-center leading-tight line-clamp-2 min-h-[28px] flex items-center">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── USP Trust Badges ─── */}
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

      {/* ─── Trending Products ─── */}
      <section className="py-10 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Trending Products</h2>
              <p className="text-sm text-gray-500 mt-1">Top-rated picks from our store</p>
            </div>
            <Link to="/shop?sortBy=rating_desc" className="text-sm text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-1 transition-colors shrink-0">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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

      {/* ─── Latest Arrivals ─── */}
      <section className="py-10 bg-[var(--color-background)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Latest Arrivals</h2>
              <p className="text-sm text-gray-500 mt-1">Freshly added to our inventory</p>
            </div>
            <Link to="/shop?sortBy=newest" className="text-sm text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-1 transition-colors shrink-0">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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
