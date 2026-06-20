import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Trash2, ChevronRight, GitCompare, Check, X, Star } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const CompareProducts = () => {
  const { compareItems, compareCount, dispatch: compareDispatch } = useCompare();
  const { dispatch: cartDispatch } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const removeProduct = (id, name) => {
    compareDispatch({ type: 'REMOVE', payload: id });
    addToast(`${name} removed from compare`, 'info');
  };

  const handleAddToCart = (product) => {
    const price = product.sellingPrice || product.price || 0;
    const stock = product.countInStock ?? 0;
    if (stock <= 0) return;
    cartDispatch({
      type: 'ADD_ITEM',
      payload: { ...product, price, qty: 1, countInStock: stock }
    });
    addToast(`${product.name} added to cart!`);
  };

  // Find all unique specification keys across all products
  const allSpecsKeys = new Set();
  compareItems.forEach(p => {
    if (p.specifications) {
      Object.keys(p.specifications).forEach(k => allSpecsKeys.add(k));
    }
  });
  const specKeysArray = Array.from(allSpecsKeys);

  return (
    <div className="bg-gray-50 min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-8">
          <Link to="/" className="hover:text-[var(--color-primary)] transition-colors">Home</Link>
          <ChevronRight size={16} className="mx-2" />
          <Link to="/shop" className="hover:text-[var(--color-primary)] transition-colors">Shop</Link>
          <ChevronRight size={16} className="mx-2" />
          <span className="text-gray-900 font-medium">Compare</span>
        </div>

        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <GitCompare size={32} className="text-[var(--color-primary)]" />
              Compare Products
            </h1>
            <p className="text-gray-500 mt-2">Side-by-side comparison of electrical items ({compareCount}/4)</p>
          </div>
          <div className="flex gap-3">
            {compareCount > 0 && (
              <button 
                onClick={() => { compareDispatch({ type: 'CLEAR' }); addToast('Compare list cleared', 'info'); }}
                className="btn-secondary text-sm"
              >
                Clear All
              </button>
            )}
            <Link to="/shop" className="btn-secondary">Add More Products</Link>
          </div>
        </div>

        {compareItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <GitCompare size={36} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products to compare</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">Add at least 2 products from the shop to see a side-by-side comparison of their features and specifications.</p>
            <Link to="/shop" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto min-w-[800px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="w-1/4 p-6 border-b border-r border-gray-200 bg-gray-50 align-top">
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">Products</h3>
                      <p className="text-sm text-gray-500 font-normal">Showing {compareItems.length} out of up to 4 items.</p>
                    </th>
                    {compareItems.map(product => (
                      <th key={product._id} className="w-1/4 p-6 border-b border-gray-200 relative align-top">
                        <button 
                          onClick={() => removeProduct(product._id, product.name)}
                          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                          title="Remove from comparison"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="flex flex-col items-center text-center">
                          <Link to={`/product/${product.slug}`} className="mb-4 bg-gray-50 p-4 rounded-xl w-32 h-32 flex items-center justify-center">
                            <img 
                              src={product.mainImage || product.images?.[0]} 
                              alt={product.name} 
                              className="max-h-full object-contain mix-blend-multiply" 
                            />
                          </Link>
                          <Link to={`/shop?brand=${product.brand?._id}`} className="text-xs text-[var(--color-primary)] font-bold uppercase mb-1">
                            {product.brand?.name}
                          </Link>
                          <Link to={`/product/${product.slug}`} className="font-bold text-gray-900 hover:text-[var(--color-primary)] line-clamp-2 mb-2">
                            {product.name}
                          </Link>
                          <div className="text-xl font-extrabold text-gray-900 mb-4">₹{(product.sellingPrice || product.price || 0).toLocaleString('en-IN')}</div>
                          <button 
                            onClick={() => handleAddToCart(product)}
                            className="btn-primary w-full flex items-center justify-center gap-2 shadow-sm py-2"
                          >
                            <ShoppingCart size={18} /> Add
                          </button>
                        </div>
                      </th>
                    ))}
                    {/* Empty Slots */}
                    {[...Array(Math.max(0, 4 - compareItems.length))].map((_, i) => (
                      <th key={`empty-${i}`} className="w-1/4 p-6 border-b border-gray-200 align-middle">
                        <Link to="/shop" className="border-2 border-dashed border-gray-200 rounded-xl h-64 flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 hover:bg-gray-100/50 hover:border-gray-300 transition-colors block">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 mb-3 shadow-sm">
                            <GitCompare size={20} />
                          </div>
                          <span className="text-sm font-medium text-gray-500">Add Product</span>
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* General Specs */}
                  <tr>
                    <td className="p-4 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200" colSpan={5}>General Details</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-gray-600 border-r border-gray-200 bg-gray-50/30">Rating</td>
                    {compareItems.map(product => (
                      <td key={product._id} className="p-4 text-gray-800">
                        <div className="flex items-center gap-1 font-bold">
                          {product.rating} <Star size={14} className="text-yellow-400 inline" fill="#FACC15"/> 
                          <span className="text-xs text-gray-400 font-normal ml-1">({product.numReviews})</span>
                        </div>
                      </td>
                    ))}
                    {[...Array(Math.max(0, 4 - compareItems.length))].map((_, i) => <td key={`emp-rating-${i}`} className="p-4"></td>)}
                  </tr>
                  <tr>
                    <td className="p-4 font-medium text-gray-600 border-r border-gray-200 bg-gray-50/30">Availability</td>
                    {compareItems.map(product => (
                      <td key={product._id} className="p-4">
                        {product.countInStock > 0
                          ? <span className="text-green-600 flex items-center gap-1 text-sm font-medium"><Check size={16}/> In Stock</span>
                          : <span className="text-red-500 flex items-center gap-1 text-sm font-medium"><X size={16}/> Out of Stock</span>
                        }
                      </td>
                    ))}
                    {[...Array(Math.max(0, 4 - compareItems.length))].map((_, i) => <td key={`emp-avail-${i}`} className="p-4"></td>)}
                  </tr>

                  {/* Dynamic Specifications */}
                  {specKeysArray.length > 0 && (
                    <tr>
                      <td className="p-4 bg-gray-50 font-semibold text-gray-700 border-r border-gray-200" colSpan={5}>Technical Specifications</td>
                    </tr>
                  )}
                  {specKeysArray.map(key => (
                    <tr key={key}>
                      <td className="p-4 font-medium text-gray-600 border-r border-gray-200 bg-gray-50/30">{key}</td>
                      {compareItems.map(product => (
                        <td key={product._id} className="p-4 text-gray-800 text-sm">
                          {product.specifications && product.specifications[key] ? product.specifications[key] : '-'}
                        </td>
                      ))}
                      {[...Array(Math.max(0, 4 - compareItems.length))].map((_, i) => <td key={`emp-spec-${key}-${i}`} className="p-4"></td>)}
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompareProducts;
