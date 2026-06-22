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
      className="group block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 relative h-full flex flex-col"
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
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
      <div className="absolute top-2 right-2 z-10 flex flex-col gap-1">
        <span className="w-7 h-7 bg-white shadow-sm rounded-full flex items-center justify-center text-gray-400 hover:text-orange-500 transition-all opacity-0 group-hover:opacity-100 duration-200 border border-gray-100">
          <Eye size={14} />
        </span>
        <button
          onClick={handleCompareToggle}
          title={inCompare ? 'Remove from compare' : 'Add to compare'}
          className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 border ${
            inCompare
              ? 'bg-blue-500 text-white hover:bg-blue-600 border-blue-400'
              : 'bg-white text-gray-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 border-gray-100'
          }`}
        >
          <GitCompare size={13} />
        </button>
      </div>

      {/* Image */}
      <div className="relative bg-white flex items-center justify-center p-3 sm:p-4 aspect-square">
        <img
          src={imgSrc}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-300"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://placehold.co/300x300/f8fafc/94a3b8?text=No+Image';
            e.target.onerror = null;
          }}
        />
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-grow border-t border-gray-100">
        {/* Brand */}
        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
          {product.brand?.name || 'Brand'}
        </span>

        {/* Name */}
        <h3 className="text-[13px] text-gray-800 font-medium leading-snug line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors min-h-[36px]">
          {product.name}
        </h3>

        {/* Model */}
        {product.modelNumber && (
          <span className="text-[10px] text-gray-400 mb-1">Model: {product.modelNumber}</span>
        )}

        {/* Highlights */}
        {product.highlights && product.highlights.length > 0 && (
          <ul className="mb-1.5 space-y-0.5">
            {product.highlights.slice(0, 2).map((h, i) => (
              <li key={i} className="text-[11px] text-gray-500 flex items-start gap-1">
                <span className="text-green-500 mt-0.5 shrink-0">•</span>
                <span className="line-clamp-1">{h}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Price & Stock - pushed to bottom */}
        <div className="mt-auto pt-2 border-t border-gray-50">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base font-bold text-gray-900">₹{price.toLocaleString('en-IN')}</span>
            {product.mrp && product.mrp > price && (
              <>
                <span className="text-[11px] text-gray-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
                <span className="text-[10px] font-bold text-green-600">{discount}% off</span>
              </>
            )}
          </div>

          {/* Stock indicator */}
          <div className="flex items-center gap-1.5 mt-1">
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
