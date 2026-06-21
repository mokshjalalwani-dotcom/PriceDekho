import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, Heart, GitCompare, User } from 'lucide-react';
import { CATEGORIES } from '../../constants/categories';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCompare } from '../../context/CompareContext';
import { useAuth } from '../../context/AuthContext';
import AuthModal from '../AuthModal';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { compareCount } = useCompare();
  const { user, logout } = useAuth();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  return (
    <div className="w-full bg-white shadow-sm sticky top-0 z-50">
      <nav className="max-w-[1400px] mx-auto border-b border-gray-100">
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-[72px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center overflow-hidden bg-white shadow-md group-hover:scale-105 transition-transform p-1">
              <img src="/logo.png" alt="Satguru Electricals Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-[800] text-[22px] tracking-tight text-[#242933]">
              Satguru<span style={{ color: 'rgb(123,63,0)' }}>Electricals</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-12">
            <div className="flex w-full ring-1 ring-gray-200 rounded-md overflow-hidden bg-gray-50 focus-within:ring-2 focus-within:ring-gray-300 focus-within:bg-white transition-all h-[42px]">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-4 pr-4 bg-transparent outline-none text-sm text-gray-800"
              />
              <button type="submit" className="bg-[#242933] hover:bg-black text-white px-6 flex items-center justify-center transition-colors">
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/compare" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-semibold transition-colors text-sm relative">
              <GitCompare size={20} />
              Compare
              {compareCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white shadow-sm">
                  {compareCount}
                </span>
              )}
            </Link>
            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-1.5 text-gray-600 hover:text-[var(--color-primary)] font-semibold transition-colors text-sm">
                  <User size={20} />
                  {user.name.split(' ')[0]}
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <button onClick={logout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-1.5 text-gray-600 hover:text-[var(--color-primary)] font-semibold transition-colors text-sm">
                <User size={20} />
                Sign In
              </button>
            )}
            <Link to="/wishlist" className="text-gray-600 hover:text-red-500 transition-colors relative">
              <Heart size={22} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white shadow-sm">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="text-gray-600 hover:text-blue-600 transition-colors relative">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white shadow-sm">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="text-gray-600 hover:text-blue-600 transition-colors relative">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 p-1">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>


      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 shadow-xl absolute w-full z-40">
          <div className="px-4 pt-2 pb-6 space-y-1 max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSearch} className="relative mt-2 mb-4">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-md py-2.5 pl-4 pr-10 outline-none focus:border-blue-500"
              />
              <button type="submit" className="absolute right-3 top-2.5">
                <Search size={18} className="text-gray-400" />
              </button>
            </form>
              {CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                to={`/shop?category=${cat.slug}`}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-gray-800 hover:text-orange-500 hover:bg-orange-50 rounded-lg"
              >
                {cat.name}
              </Link>
            ))}

            {/* Mobile Auth Section */}
            <div className="border-t border-gray-100 mt-4 pt-4 px-2">
              {user ? (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }} 
                    className="w-full text-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsAuthModalOpen(true);
                  }} 
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-[var(--color-primary)] bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <User size={18} />
                  Sign In / Register
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 mt-2">
              <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg">
                <Heart size={16} /> Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
              </Link>
              <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg">Shop All</Link>
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
};

export default Navbar;
