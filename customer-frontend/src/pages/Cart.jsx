import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cart, cartCount, cartTotal, dispatch } = useCart();
  const navigate = useNavigate();

  const shippingPrice = cartTotal > 999 ? 0 : 60;
  const totalWithShipping = cartTotal + shippingPrice;

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center">
          <ShoppingBag size={40} className="text-[var(--color-primary)]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft size={18} /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Shopping Cart <span className="text-lg font-normal text-gray-500">({cartCount} items)</span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {cart.map(item => (
              <div key={item._id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex gap-5 items-center">
                <Link to={`/product/${item.slug}`}>
                  <img
                    src={item.images?.[0]}
                    alt={item.name}
                    className="w-20 h-20 object-contain rounded-lg border border-gray-100 p-1 bg-gray-50"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.slug}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-[var(--color-primary)] transition-colors line-clamp-2">{item.name}</h3>
                  </Link>
                  <p className="text-sm text-gray-500 mt-1">{item.brand?.name}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => dispatch({ type: 'UPDATE_QTY', payload: { id: item._id, qty: item.qty - 1 } })}
                        disabled={item.qty <= 1}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.qty}</span>
                      <button
                        onClick={() => dispatch({ type: 'UPDATE_QTY', payload: { id: item._id, qty: item.qty + 1 } })}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-bold text-gray-900 text-lg">₹{(item.price * item.qty).toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item._id })}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2 shrink-0"
                  title="Remove"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] font-medium hover:underline mt-2">
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="font-medium text-gray-900">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={`font-medium ${shippingPrice === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}
                  </span>
                </div>
                {shippingPrice > 0 && (
                  <p className="text-xs text-orange-600 bg-orange-50 rounded-lg p-2">
                    Add ₹{(999 - cartTotal).toLocaleString()} more for free shipping
                  </p>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900 text-base">
                  <span>Total</span>
                  <span>₹{totalWithShipping.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary mt-6 flex items-center justify-center gap-2 py-3"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                <span>🔒 Secure checkout</span>
                <span>·</span>
                <span>COD available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
