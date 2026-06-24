import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, GitCompare } from 'lucide-react';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../context/ToastContext';

const ProductCard = ({ product }) => {
  const price = product.sellingPrice || product.price || 0;
  const discount = product.mrp && product.mrp > price
    ? Math.round(((product.mrp - price) / product.mrp) * 100)
    : 0;
  const inStock = product.countInStock > 0 && product.availability !== 'Out of Stock';
  const imgSrc = product.mainImage || product.images?.[0] || 'https://placehold.co/300x300/f8fafc/94a3b8?text=No+Image';

  const { isInCompare, isFull, dispatch: compareDispatch } = useCompare();
  const { addToast } = useToast();

  const inCompare = isInCompare(product._id);

  const handleCompareToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      compareDispatch({ type: 'REMOVE', payload: product._id });
      addToast(`${product.name} removed from compare`, 'info');
    } else {
      if (isFull) {
        addToast('Compare list is full (max 4 products). Remove one first.', 'error');
        return;
      }
      compareDispatch({ type: 'ADD', payload: product });
      addToast(`${product.name} added to compare`);
    }
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block bg-white rounded-xl border border-gray-200/60 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative h-full flex flex-col"
    >
      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
        {discount > 0 && (
          <span className="badge-discount">
            {discount}% OFF
          </span>
        )}
        {product.isFeatured && (
          <span className="badge-featured">Featured</span>
        )}
        {!inStock && (
          <span className="badge-oos">Out of Stock</span>
        )}
      </div>

      {/* Quick Actions */}
      <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5">
        <span className="w-8 h-8 bg-white/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-gray-400 hover:text-theme-primary transition-all opacity-0 group-hover:opacity-100 duration-300 ring-1 ring-gray-100">
          <Eye size={15} />
        </span>
        <button
          onClick={handleCompareToggle}
          title={inCompare ? 'Remove from compare' : 'Add to compare'}
          className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ring-1 ring-gray-100 ${
            inCompare
              ? 'bg-blue-500 text-white hover:bg-blue-600 ring-blue-400'
              : 'bg-white/90 backdrop-blur-sm text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100'
          }`}
        >
          <GitCompare size={14} />
        </button>
      </div>

      {/* Image */}
      <div className="relative bg-gray-50/50 flex items-center justify-center p-4 aspect-square">
        <img
          src={imgSrc}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://placehold.co/300x300/f8fafc/94a3b8?text=No+Image';
            e.target.onerror = null;
          }}
        />
      </div>

      {/* Content */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-grow border-t border-gray-100">
        {/* Brand */}
        <span className="inline-block text-sm text-gray-500 font-medium uppercase tracking-wider mb-1 bg-gray-100 px-2 py-0.5 rounded w-fit max-w-full truncate">
          {product.brand?.name || 'Brand'}
        </span>

        {/* Name */}
        <h3 className="text-[13px] text-gray-800 font-semibold leading-snug line-clamp-2 mb-1 group-hover:text-theme-primary transition-colors min-h-[36px]">
          {product.name}
        </h3>

        {/* Model */}
        {product.modelNumber && (
          <span className="text-sm text-gray-400 font-medium mb-1.5 truncate max-w-full block">Model: {product.modelNumber}</span>
        )}

        {/* Highlights */}
        {product.highlights && product.highlights.length > 0 && (
          <ul className="mb-2 space-y-0.5">
            {product.highlights.slice(0, 2).map((h, i) => (
              <li key={i} className="text-[11px] text-gray-500 flex items-start gap-1">
                <span className="text-green-500 mt-0.5 shrink-0">•</span>
                <span className="line-clamp-1">{h}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Price & Stock - pushed to bottom */}
        <div className="mt-auto pt-2 border-t border-gray-100">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-bold text-gray-900">₹{price.toLocaleString('en-IN')}</span>
            {product.mrp && product.mrp > price && (
              <>
                <span className="text-xs text-gray-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
                <span className="text-[10px] font-bold text-green-600">{discount}% off</span>
              </>
            )}
          </div>

          {/* Stock indicator */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${inStock ? 'bg-green-500 stock-pulse' : 'bg-red-400'}`}></span>
            <span className={`text-[11px] font-medium ${inStock ? 'text-green-600' : 'text-red-500'}`}>
              {inStock ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
