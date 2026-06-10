import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, Heart } from 'lucide-react';
import { CATEGORIES } from '../../constants/categories';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

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
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden bg-white shadow-md group-hover:scale-105 transition-transform">
              <img src="https://scontent.fstv8-3.fna.fbcdn.net/v/t39.30808-6/300021862_402490028652945_4472372223676585025_n.png?stp=dst-png&cstp=mx1988x1988&ctp=s1988x1988&_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=a27DF4JTHrkQ7kNvwGa_95R&_nc_oc=AdpCpnZHRWUOA8J7g3cIN0eD0qnWflCUg2iCAfvHIJGMpIGO4zAdMFJhKHxRXoFWVcdYxjNQdziCGF8Xo4f1QDFG&_nc_zt=23&_nc_ht=scontent.fstv8-3.fna&_nc_gid=OgBEbQELv3IGsxePTgMJ9Q&_nc_ss=7b289&oh=00_Af8ktO_MTN191pgTqic1Z6LL--6lBrJkGujJa2OFNoJuZQ&oe=6A2F99E0" alt="Satguru Electricals Logo" className="w-full h-full object-cover" />
            </div>
            <span className="font-[800] text-[22px] tracking-tight text-[#242933]">
              SatguruElectricals
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
            <Link to="/compare" className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 font-semibold transition-colors text-sm">
              Compare
            </Link>
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
            <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-4 mt-2">
              <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg">
                <Heart size={16} /> Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
              </Link>
              <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-lg">Shop All</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
