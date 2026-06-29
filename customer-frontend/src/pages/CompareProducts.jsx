import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, ChevronRight, GitCompare } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const specRows = [
  { label: 'Model No.', key: 'modelNumber', render: (p) => p.modelNumber || '-' },
  { label: 'Name', key: 'name', render: (p) => p.name || '-' },
  { label: 'Price', key: 'sellingPrice', render: (p) => <span className="font-bold text-gray-900">₹{(p.sellingPrice || p.price || 0).toLocaleString('en-IN')}</span> },
  { label: 'MRP', key: 'mrp', render: (p) => p.mrp ? <span className="line-through text-gray-500">₹{p.mrp.toLocaleString('en-IN')}</span> : '-' },
  { label: 'Category', key: 'category', render: (p) => p.category?.name || '-' },
  { label: 'Brand', key: 'brand', render: (p) => <span className="text-[var(--color-primary)] font-semibold">{p.brand?.name || '-'}</span> },
  { label: 'Highlights', key: 'highlights', render: (p) => p.highlights?.length > 0 ? <ul className="list-disc pl-3.5 space-y-0.5">{p.highlights.map((h, i) => <li key={i}>{h}</li>)}</ul> : '-' },
  { label: 'Description', key: 'shortDescription', render: (p) => p.shortDescription || '-' },
  { label: 'Details', key: 'fullDescription', render: (p) => <span className="line-clamp-6">{p.fullDescription || p.detailedDescription || '-'}</span> },
  { label: 'Box Contents', key: 'boxContents', render: (p) => p.boxContents?.length > 0 ? <ul className="list-disc pl-3.5 space-y-0.5">{p.boxContents.map((b, i) => <li key={i}>{b}</li>)}</ul> : '-' },
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

  const colCount = compareItems.length;

  return (
    <div className="bg-gray-50 min-h-screen pt-4 sm:pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-8">
          <Link to="/" className="hover:text-[var(--color-primary)] transition-colors">Home</Link>
          <ChevronRight size={14} className="mx-1 sm:mx-2" />
          <Link to="/shop" className="hover:text-[var(--color-primary)] transition-colors">Shop</Link>
          <ChevronRight size={14} className="mx-1 sm:mx-2" />
          <span className="text-gray-900 font-medium">Compare</span>
        </div>

        {/* Header */}
        <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <GitCompare className="text-[var(--color-primary)] w-5 h-5 sm:w-8 sm:h-8" />
              Compare Products
            </h1>
            <p className="text-gray-500 mt-1 text-xs sm:text-base">Side-by-side comparison ({compareCount}/4)</p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            {compareCount > 0 && (
              <button 
                onClick={() => { compareDispatch({ type: 'CLEAR' }); addToast('Compare list cleared', 'info'); }}
                className="btn-secondary text-xs sm:text-sm px-3 sm:px-6 py-1.5 sm:py-2"
              >
                Clear All
              </button>
            )}
            <Link to="/shop" className="btn-secondary text-xs sm:text-sm px-3 sm:px-6 py-1.5 sm:py-2">Add More</Link>
          </div>
        </div>

        {compareItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-16 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <GitCompare size={30} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No products to compare</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">Add at least 2 products from the shop to see a side-by-side comparison of their features and specifications.</p>
            <Link to="/shop" className="btn-primary text-sm">Browse Products</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Scroll hint on mobile */}
            <div className="sm:hidden px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
              <span>←</span> Swipe to compare <span>→</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse compare-table">
                {/* Product Header Row */}
                <thead>
                  <tr>
                    <th className="compare-label-cell p-3 sm:p-5 border-b border-r border-gray-200 bg-gray-50 align-top">
                      <h3 className="font-bold text-gray-900 text-xs sm:text-base">Products</h3>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-normal mt-0.5">{compareItems.length} of 4</p>
                    </th>
                    {compareItems.map(product => (
                      <th key={product._id} className="compare-product-cell p-2.5 sm:p-5 border-b border-gray-200 relative align-top">
                        <button 
                          onClick={() => removeProduct(product._id, product.name)}
                          className="absolute top-2 right-2 sm:top-3 sm:right-3 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 p-1 sm:p-1.5 rounded-full transition-colors z-10"
                          title="Remove"
                        >
                          <Trash2 size={12} className="sm:hidden" />
                          <Trash2 size={16} className="hidden sm:block" />
                        </button>
                        <div className="flex flex-col items-center text-center">
                          <Link to={`/product/${product.slug}`} className="mb-2 sm:mb-3 bg-gray-50 p-2 sm:p-3 rounded-lg sm:rounded-xl w-20 h-20 sm:w-28 sm:h-28 flex items-center justify-center">
                            <img 
                              src={product.mainImage || product.images?.[0]} 
                              alt={product.name} 
                              className="max-h-full max-w-full object-contain mix-blend-multiply" 
                            />
                          </Link>
                          <Link to={`/shop?brand=${product.brand?._id}`} className="text-[9px] sm:text-xs text-[var(--color-primary)] font-bold uppercase">
                            {product.brand?.name}
                          </Link>
                          <Link to={`/product/${product.slug}`} className="font-bold text-[11px] sm:text-sm text-gray-900 hover:text-[var(--color-primary)] line-clamp-2 mt-0.5 mb-1 sm:mb-2 leading-tight">
                            {product.name}
                          </Link>
                          <div className="text-sm sm:text-lg font-extrabold text-gray-900 mb-2 sm:mb-3">₹{(product.sellingPrice || product.price || 0).toLocaleString('en-IN')}</div>
                          <button 
                            onClick={() => handleAddToCart(product)}
                            className="btn-primary w-full flex items-center justify-center gap-1 sm:gap-2 shadow-sm py-1.5 sm:py-2 text-[11px] sm:text-sm"
                          >
                            <ShoppingCart size={13} className="sm:hidden" />
                            <ShoppingCart size={16} className="hidden sm:block" />
                            <span>Add</span>
                          </button>
                        </div>
                      </th>
                    ))}
                    {/* Empty slots — hidden on small screens if we already have 2+ products */}
                    {[...Array(Math.max(0, 4 - colCount))].map((_, i) => (
                      <th key={`empty-${i}`} className={`compare-product-cell p-2.5 sm:p-5 border-b border-gray-200 align-middle ${colCount >= 2 && i > 0 ? 'hidden sm:table-cell' : ''}`}>
                        <Link to="/shop" className="border-2 border-dashed border-gray-200 rounded-lg sm:rounded-xl h-40 sm:h-56 flex flex-col items-center justify-center text-center p-3 sm:p-4 bg-gray-50/50 hover:bg-gray-100/50 hover:border-gray-300 transition-colors block">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center text-gray-400 mb-1.5 sm:mb-2 shadow-sm">
                            <GitCompare size={14} className="sm:hidden" />
                            <GitCompare size={18} className="hidden sm:block" />
                          </div>
                          <span className="text-[10px] sm:text-xs font-medium text-gray-500">Add Product</span>
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Spec Rows */}
                <tbody className="divide-y divide-gray-100">
                  {specRows.map(row => (
                    <tr key={row.key}>
                      <td className="compare-label-cell p-2.5 sm:p-4 font-medium text-gray-600 border-r border-gray-200 bg-gray-50/30 text-[11px] sm:text-sm align-top whitespace-nowrap">
                        {row.label}
                      </td>
                      {compareItems.map(product => (
                        <td key={product._id} className="compare-product-cell p-2.5 sm:p-4 text-gray-800 text-[11px] sm:text-sm align-top">
                          {row.render(product)}
                        </td>
                      ))}
                      {[...Array(Math.max(0, 4 - colCount))].map((_, i) => (
                        <td key={`emp-${row.key}-${i}`} className={`compare-product-cell p-2.5 sm:p-4 ${colCount >= 2 && i > 0 ? 'hidden sm:table-cell' : ''}`}></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Responsive table styles */}
      <style>{`
        .compare-table .compare-label-cell {
          position: sticky;
          left: 0;
          z-index: 5;
          background: #f9fafb;
          min-width: 80px;
          max-width: 80px;
        }
        @media (min-width: 640px) {
          .compare-table .compare-label-cell {
            min-width: 140px;
            max-width: 180px;
          }
        }
        .compare-table .compare-product-cell {
          min-width: 140px;
        }
        @media (min-width: 640px) {
          .compare-table .compare-product-cell {
            min-width: 200px;
          }
        }
        /* Subtle shadow on sticky column edge */
        .compare-table .compare-label-cell::after {
          content: '';
          position: absolute;
          top: 0;
          right: -6px;
          bottom: 0;
          width: 6px;
          background: linear-gradient(to right, rgba(0,0,0,0.03), transparent);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default CompareProducts;
