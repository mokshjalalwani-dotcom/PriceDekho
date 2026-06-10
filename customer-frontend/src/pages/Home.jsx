import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Zap, ShieldCheck, Truck, Clock, ChevronRight, Star } from 'lucide-react';
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

  return (
    <div className="w-full">
      {/* What do you want to buy today? */}
      <section className="pt-8 pb-14 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl font-[500] text-gray-900">What do you want to buy today?</h2>
            <Link to="/shop" className="text-sm text-orange-600 font-semibold hover:underline flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-4 sm:gap-6">
            {CATEGORIES.map((cat) => (
              <div key={cat.slug} className="flex flex-col items-center gap-2.5 w-full">
                <Link
                  to={`/shop?category=${cat.slug}`}
                  className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group max-w-[120px] mx-auto`}
                >
                  {React.cloneElement(cat.icon, { size: 40, className: "text-white stroke-[1.5] group-hover:scale-110 transition-transform" })}
                </Link>
                <span className="font-semibold text-gray-800 text-xs md:text-[13px] text-center leading-tight">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured / Trending Products */}
      <section className="py-14 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Trending Products</h2>
              <p className="text-sm text-gray-500 mt-1">Top-rated picks from our store</p>
            </div>
            <Link to="/shop?sortBy=rating_desc" className="text-sm text-orange-600 font-semibold hover:underline flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-80 animate-pulse shadow-sm border border-gray-100"></div>
              ))
            ) : (
              featuredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Latest Arrivals */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Latest Arrivals</h2>
              <p className="text-sm text-gray-500 mt-1">Freshly added to our inventory</p>
            </div>
            <Link to="/shop?sortBy=newest" className="text-sm text-orange-600 font-semibold hover:underline flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-80 animate-pulse shadow-sm border border-gray-100"></div>
              ))
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
