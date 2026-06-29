import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, ChevronRight, GitCompare } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const specRows = [
  { label: 'Model Number', key: 'modelNumber', render: (p) => p.modelNumber || '-' },
  { label: 'Selling Price', key: 'sellingPrice', render: (p) => <span className="font-bold text-gray-900">₹{(p.sellingPrice || p.price || 0).toLocaleString('en-IN')}</span> },
  { label: 'MRP', key: 'mrp', render: (p) => p.mrp ? <span className="line-through text-gray-500">₹{p.mrp.toLocaleString('en-IN')}</span> : '-' },
  { label: 'Category', key: 'category', render: (p) => p.category?.name || '-' },
  { label: 'Brand', key: 'brand', render: (p) => <span className="text-[var(--color-primary)] font-semibold">{p.brand?.name || '-'}</span> },
  { label: 'Key Highlights', key: 'highlights', render: (p) => p.highlights?.length > 0 ? <ul className="list-disc pl-4 space-y-1">{p.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul> : '-' },
  { label: 'Short Description', key: 'shortDescription', render: (p) => p.shortDescription || '-' },
  { label: 'Full Description', key: 'fullDescription', render: (p) => <span className="line-clamp-6">{p.fullDescription || p.detailedDescription || '-'}</span> },
  { label: 'Box Contents', key: 'boxContents', render: (p) => p.boxContents?.length > 0 ? <ul className="list-disc pl-4 space-y-1">{p.boxContents.map((b, i) => <li key={i}>{b}</li>)}</ul> : '-' },
];

const CompareProducts = () => {
  const { compareItems, compareCount, dispatch: compareDispatch } = useCompare();
  const { dispatch: cartDispatch } = useCart();
  const { addToast } = useToast();

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

  return (
    <div className="bg-gray-50 min-h-screen pt-4 sm:pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-5 sm:mb-8">
          <Link to="/" className="hover:text-[var(--color-primary)] transition-colors">Home</Link>
          <ChevronRight size={14} className="mx-1.5 sm:mx-2" />
          <Link to="/shop" className="hover:text-[var(--color-primary)] transition-colors">Shop</Link>
          <ChevronRight size={14} className="mx-1.5 sm:mx-2" />
          <span className="text-gray-900 font-medium">Compare</span>
        </div>

        {/* Header */}
        <div className="mb-5 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <GitCompare size={24} className="text-[var(--color-primary)] sm:w-8 sm:h-8" />
              Compare Products
            </h1>
            <p className="text-gray-500 mt-1 sm:mt-2 text-sm">Side-by-side comparison ({compareCount}/4)</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            {compareCount > 0 && (
              <button 
                onClick={() => { compareDispatch({ type: 'CLEAR' }); addToast('Compare list cleared', 'info'); }}
                className="btn-secondary text-xs sm:text-sm px-3 sm:px-6 py-2"
              >
                Clear All
              </button>
            )}
            <Link to="/shop" className="btn-secondary text-xs sm:text-sm px-3 sm:px-6 py-2">Add More</Link>
          </div>
        </div>

        {compareItems.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-16 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <GitCompare size={30} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No products to compare</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">Add at least 2 products from the shop to see a side-by-side comparison of their features and specifications.</p>
            <Link to="/shop" className="btn-primary text-sm">Browse Products</Link>
          </div>
        ) : (
          <>
            {/* ========== MOBILE CARD LAYOUT (visible below md) ========== */}
            <div className="md:hidden space-y-4">
              {compareItems.map(product => (
                <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  {/* Product Header */}
                  <div className="p-4 border-b border-gray-100 flex gap-3 items-start relative">
                    <Link to={`/product/${product.slug}`} className="bg-gray-50 p-2 rounded-lg w-20 h-20 flex items-center justify-center shrink-0">
                      <img 
                        src={product.mainImage || product.images?.[0]} 
                        alt={product.name} 
                        className="max-h-full max-w-full object-contain mix-blend-multiply" 
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      {product.brand?.name && (
                        <Link to={`/shop?brand=${product.brand?._id}`} className="text-[11px] text-[var(--color-primary)] font-bold uppercase tracking-wide">
                          {product.brand.name}
                        </Link>
                      )}
                      <Link to={`/product/${product.slug}`} className="block font-semibold text-sm text-gray-900 hover:text-[var(--color-primary)] line-clamp-2 leading-tight mt-0.5">
                        {product.name}
                      </Link>
                      <div className="text-lg font-extrabold text-gray-900 mt-1.5">
                        ₹{(product.sellingPrice || product.price || 0).toLocaleString('en-IN')}
                        {product.mrp && product.mrp > (product.sellingPrice || product.price || 0) && (
                          <span className="text-xs font-normal text-gray-400 line-through ml-2">₹{product.mrp.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => removeProduct(product._id, product.name)}
                      className="text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-1.5 rounded-full transition-colors shrink-0"
                      title="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Spec Rows */}
                  <div className="divide-y divide-gray-50">
                    {specRows.filter(r => !['sellingPrice', 'mrp', 'brand'].includes(r.key)).map(row => {
                      const val = row.render(product);
                      if (val === '-') return null;
                      return (
                        <div key={row.key} className="flex px-4 py-2.5 text-sm">
                          <span className="w-28 shrink-0 text-gray-500 font-medium text-xs pt-0.5">{row.label}</span>
                          <span className="flex-1 text-gray-800 text-xs">{val}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="p-3 border-t border-gray-100">
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-2 text-sm"
                    >
                      <ShoppingCart size={16} /> Add to Cart
                    </button>
                  </div>
                </div>
              ))}

              {/* Add more slot */}
              {compareItems.length < 4 && (
                <Link to="/shop" className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center bg-white/50 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-2">
                    <GitCompare size={18} />
                  </div>
                  <span className="text-sm font-medium text-gray-500">Add another product to compare</span>
                </Link>
              )}
            </div>

            {/* ========== DESKTOP TABLE LAYOUT (visible at md+) ========== */}
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" style={{ minWidth: '700px' }}>
                  <thead>
                    <tr>
                      <th className="w-1/5 p-5 border-b border-r border-gray-200 bg-gray-50 align-top">
                        <h3 className="font-bold text-gray-900 mb-1 text-base">Products</h3>
                        <p className="text-xs text-gray-500 font-normal">Showing {compareItems.length} of 4</p>
                      </th>
                      {compareItems.map(product => (
                        <th key={product._id} className="p-5 border-b border-gray-200 relative align-top" style={{ width: `${80 / Math.max(compareItems.length, 2)}%` }}>
                          <button 
                            onClick={() => removeProduct(product._id, product.name)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                            title="Remove from comparison"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="flex flex-col items-center text-center">
                            <Link to={`/product/${product.slug}`} className="mb-3 bg-gray-50 p-3 rounded-xl w-28 h-28 flex items-center justify-center">
                              <img 
                                src={product.mainImage || product.images?.[0]} 
                                alt={product.name} 
                                className="max-h-full object-contain mix-blend-multiply" 
                              />
                            </Link>
                            <Link to={`/shop?brand=${product.brand?._id}`} className="text-xs text-[var(--color-primary)] font-bold uppercase mb-0.5">
                              {product.brand?.name}
                            </Link>
                            <Link to={`/product/${product.slug}`} className="font-bold text-sm text-gray-900 hover:text-[var(--color-primary)] line-clamp-2 mb-2">
                              {product.name}
                            </Link>
                            <div className="text-lg font-extrabold text-gray-900 mb-3">₹{(product.sellingPrice || product.price || 0).toLocaleString('en-IN')}</div>
                            <button 
                              onClick={() => handleAddToCart(product)}
                              className="btn-primary w-full flex items-center justify-center gap-2 shadow-sm py-2 text-sm"
                            >
                              <ShoppingCart size={16} /> Add
                            </button>
                          </div>
                        </th>
                      ))}
                      {/* Empty Slots */}
                      {[...Array(Math.max(0, 4 - compareItems.length))].map((_, i) => (
                        <th key={`empty-${i}`} className="p-5 border-b border-gray-200 align-middle" style={{ width: `${80 / Math.max(compareItems.length, 2)}%` }}>
                          <Link to="/shop" className="border-2 border-dashed border-gray-200 rounded-xl h-56 flex flex-col items-center justify-center text-center p-4 bg-gray-50/50 hover:bg-gray-100/50 hover:border-gray-300 transition-colors block">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 mb-2 shadow-sm">
                              <GitCompare size={18} />
                            </div>
                            <span className="text-xs font-medium text-gray-500">Add Product</span>
                          </Link>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {specRows.map(row => (
                      <tr key={row.key}>
                        <td className="p-4 font-medium text-gray-600 border-r border-gray-200 bg-gray-50/30 text-sm">{row.label}</td>
                        {compareItems.map(product => (
                          <td key={product._id} className="p-4 text-gray-800 text-sm">
                            {row.render(product)}
                          </td>
                        ))}
                        {[...Array(Math.max(0, 4 - compareItems.length))].map((_, i) => <td key={`emp-${row.key}-${i}`} className="p-4"></td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CompareProducts;
