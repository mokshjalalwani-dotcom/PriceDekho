import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { wishlist, dispatch } = useWishlist();
  const { dispatch: cartDispatch } = useCart();
  const { addToast } = useToast();

  const moveToCart = (item) => {
    cartDispatch({ type: 'ADD_ITEM', payload: item });
    dispatch({ type: 'REMOVE', payload: item._id });
    addToast(`${item.name} moved to cart!`);
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
          <Heart size={40} className="text-red-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-6">Save items you love to your wishlist.</p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={18} /> Discover Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Wishlist <span className="text-lg font-normal text-gray-500">({wishlist.length} items)</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map(product => (
            <div key={product._id} className="relative">
              <ProductCard product={product} />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => moveToCart(product)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white text-sm font-medium py-2 rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors"
                >
                  <ShoppingBag size={15} /> Move to Cart
                </button>
                <button
                  onClick={() => dispatch({ type: 'REMOVE', payload: product._id })}
                  className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg text-gray-400 hover:text-red-500 hover:border-red-300 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
