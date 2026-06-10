import React from 'react';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

const ProductCard = ({ product }) => {
  const price = product.sellingPrice || product.price || 0;
  const discount = product.mrp && product.mrp > price
    ? Math.round(((product.mrp - price) / product.mrp) * 100)
    : 0;
  const inStock = product.countInStock > 0 && product.availability !== 'Out of Stock';
  const imgSrc = product.mainImage || product.images?.[0] || 'https://placehold.co/300x300/f8fafc/94a3b8?text=No+Image';

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 relative h-full flex flex-col"
    >
      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
        {discount > 0 && (
          <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            {discount}% OFF
          </span>
        )}
        {product.isFeatured && (
          <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">Featured</span>
        )}
        {!inStock && (
          <span className="bg-gray-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">Out of Stock</span>
        )}
      </div>

      {/* Quick View */}
      <div className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center text-gray-500 hover:text-orange-500 transition-colors">
          <Eye size={15} />
        </span>
      </div>

      {/* Image */}
      <div className="relative bg-gray-50/50 flex items-center justify-center p-5 aspect-square">
        <img
          src={imgSrc}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          style={{ maxHeight: '180px' }}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://placehold.co/300x300/f8fafc/94a3b8?text=No+Image';
            e.target.onerror = null;
          }}
        />
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-grow border-t border-gray-50">
        {/* Brand */}
        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
          {product.brand?.name || 'Brand'}
        </span>

        {/* Name */}
        <h3 className="text-[13px] text-gray-800 font-semibold leading-snug line-clamp-2 mb-1 group-hover:text-orange-600 transition-colors min-h-[36px]">
          {product.name}
        </h3>

        {/* Model */}
        {product.modelNumber && (
          <span className="text-[10px] text-gray-400 mb-1.5">Model: {product.modelNumber}</span>
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
        <div className="mt-auto pt-2 border-t border-gray-50">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base font-bold text-gray-900">₹{price.toLocaleString('en-IN')}</span>
            {product.mrp && product.mrp > price && (
              <span className="text-xs text-gray-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
            )}
          </div>

          {/* Stock indicator */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${inStock ? 'bg-green-500' : 'bg-red-400'}`}></span>
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
