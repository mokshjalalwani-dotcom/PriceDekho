import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, Heart, GitCompare, User } from 'lucide-react';
import { useCategory } from '../../context/CategoryContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { categories } = useCategory();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareCount } = useCompare();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  return (
    <div className={`w-full bg-white sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <nav className="max-w-[1400px] mx-auto border-b border-gray-100/80">
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-[68px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-2.5 group shrink-0 min-w-0">
            <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-sm ring-1 ring-gray-100 group-hover:shadow-md transition-shadow p-0.5">
              <img src="/logo.png" alt="Satguru Electricals Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-[800] text-[15px] sm:text-lg tracking-tight text-[#242933] truncate">
              Satguru<span style={{ color: 'rgb(123,63,0)' }}>Electricals</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="flex w-full rounded-full overflow-hidden bg-gray-50 ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-orange-300 focus-within:bg-white transition-all h-[42px]">
              <div className="flex items-center pl-4 text-gray-400">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search for TVs, ACs, Fridges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-3 pr-4 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
              />
              <button type="submit" className="bg-[#242933] hover:bg-black text-white px-5 flex items-center justify-center transition-colors">
                <Search size={16} />
              </button>
            </div>
          </form>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-1">
            <Link to="/compare" className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 font-medium transition-colors text-sm relative rounded-full px-3 py-2">
              <GitCompare size={19} />
              <span className="hidden lg:inline">Compare</span>
              {compareCount > 0 && (
                <span className="absolute -top-0.5 right-0.5 bg-blue-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white">
                  {compareCount}
                </span>
              )}
            </Link>
            <Link to="/wishlist" className="text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors relative rounded-full p-2.5">
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 right-0 bg-red-500 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="text-gray-500 hover:text-[var(--color-primary)] hover:bg-orange-50 transition-colors relative rounded-full p-2.5">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 right-0 bg-[var(--color-primary)] text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-1.5 shrink-0">
            <Link to="/cart" className="text-gray-500 hover:text-[var(--color-primary)] transition-colors relative p-2">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[var(--color-primary)] text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - Rendered below main navbar header */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="flex w-full rounded-full overflow-hidden bg-gray-50 ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-orange-300 focus-within:bg-white transition-all h-[40px]">
            <div className="flex items-center pl-3 text-gray-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2 pl-2 pr-3 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
            />
            <button type="submit" className="bg-[#242933] hover:bg-black text-white px-4 flex items-center justify-center transition-colors">
              <Search size={16} />
            </button>
          </form>
        </div>
      </nav>


      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 shadow-xl absolute w-full z-40 animate-fade-in-up">
          <div className="px-4 pt-2 pb-6 space-y-1 max-h-[80vh] overflow-y-auto">
            {/* Mobile Menu Links */}
              {categories.map(cat => (
              <Link
                key={cat.slug}
                to={`/shop?category=${cat.slug}`}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-800 hover:text-orange-500 hover:bg-orange-50 rounded-lg"
              >
                {cat.name}
              </Link>
            ))}



            <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 mt-2">
              <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <Heart size={16} /> Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
              </Link>
              <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors">Shop All</Link>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Navbar;
