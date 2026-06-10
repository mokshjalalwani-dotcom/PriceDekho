import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ShoppingCart, Heart, ChevronRight, Share2, CheckCircle, Package,
  ShieldCheck, Truck, RotateCcw, Star, Info, Minus, Plus, ChevronDown, ChevronUp, CreditCard
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import { CATEGORY_FIELDS } from '../constants/CategoryFieldsConfig';

const ProductDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('specs');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  const { dispatch: cartDispatch } = useCart();
  const { isWishlisted, dispatch: wishlistDispatch } = useWishlist();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/products/${slug}`);
        setProduct(res.data);

        // Fetch similar products
        if (res.data._id) {
          const simRes = await axios.get(`/api/products/${res.data._id}/similar`);
          setSimilarProducts(simRes.data || []);
        }
      } catch (error) {
        console.error('Error fetching product', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    setSelectedImage(0);
    setQty(1);
    setSelectedVariant(null);
    setActiveTab('specs');
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white rounded-2xl aspect-square animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-6 bg-white rounded animate-pulse w-1/3"></div>
              <div className="h-10 bg-white rounded animate-pulse w-3/4"></div>
              <div className="h-8 bg-white rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <Link to="/shop" className="btn-primary inline-flex mt-4">Browse Products</Link>
        </div>
      </div>
    );
  }

  const price = selectedVariant?.sellingPrice || product.sellingPrice || product.price || 0;
  const mrp = selectedVariant?.mrp || product.mrp || 0;
  const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
  const stock = selectedVariant?.countInStock ?? product.countInStock ?? 0;
  const inStock = stock > 0;
  const allImages = [product.mainImage, ...(product.galleryImages || []), ...(product.images || [])].filter(Boolean);
  const uniqueImages = [...new Set(allImages)];
  const categorySlug = product.category?.slug || '';
  const categoryConfig = CATEGORY_FIELDS[categorySlug] || null;

  const handleAddToCart = () => {
    if (!inStock) return;
    cartDispatch({
      type: 'ADD_ITEM',
      payload: { ...product, price, qty: 1, countInStock: stock }
    });
    addToast(`${product.name} added to cart!`);
  };

  const handleToggleWishlist = () => {
    wishlistDispatch({ type: 'TOGGLE', payload: product });
    addToast(isWishlisted(product._id) ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard!', 'info');
    }
  };

  // Build spec table from specGroups + categoryFields
  const buildSpecSections = () => {
    const sections = [];

    // From specGroups
    if (product.specGroups && product.specGroups.length > 0) {
      product.specGroups.forEach(group => {
        if (group.groupName && group.fields?.length > 0) {
          sections.push({
            title: group.groupName,
            rows: group.fields.filter(f => f.fieldName && f.fieldValue).map(f => ({ label: f.fieldName, value: f.fieldValue }))
          });
        }
      });
    }

    // From categoryFields
    if (categoryConfig && product.categoryFields) {
      const catRows = [];
      categoryConfig.fields.forEach(field => {
        const val = product.categoryFields[field.key];
        if (val) catRows.push({ label: field.label, value: val });
      });
      if (catRows.length > 0) {
        sections.push({ title: `${product.category?.name || 'Category'} Details`, rows: catRows });
      }
    }

    // From legacy specifications map
    if (product.specifications && typeof product.specifications === 'object') {
      const specMap = product.specifications instanceof Map ? Object.fromEntries(product.specifications) : product.specifications;
      const legacyRows = Object.entries(specMap).filter(([k, v]) => v).map(([k, v]) => ({ label: k, value: v }));
      if (legacyRows.length > 0 && sections.length === 0) {
        sections.push({ title: 'Specifications', rows: legacyRows });
      }
    }

    return sections;
  };

  const specSections = buildSpecSections();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center text-sm text-gray-500 flex-wrap">
            <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
            <ChevronRight size={14} className="mx-1.5 shrink-0" />
            <Link to="/shop" className="hover:text-orange-500 transition-colors">Shop</Link>
            {product.category && (
              <>
                <ChevronRight size={14} className="mx-1.5 shrink-0" />
                <Link to={`/shop?category=${product.category.slug}`} className="hover:text-orange-500 transition-colors">{product.category.name}</Link>
              </>
            )}
            <ChevronRight size={14} className="mx-1.5 shrink-0" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden aspect-square flex items-center justify-center p-6 relative">
              <img
                src={uniqueImages[selectedImage] || 'https://placehold.co/500x500/f8fafc/94a3b8?text=No+Image'}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain transition-transform duration-500 hover:scale-105"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/500x500/f8fafc/94a3b8?text=No+Image';
                  e.target.onerror = null;
                }}
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-lg shadow">{discount}% OFF</span>
              )}
            </div>
            {uniqueImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {uniqueImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 border-2 rounded-xl overflow-hidden shrink-0 bg-white flex items-center justify-center p-1 transition-all ${selectedImage === idx ? 'border-orange-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <img 
                      src={img} 
                      alt="" 
                      referrerPolicy="no-referrer" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/100x100/f8fafc/94a3b8?text=No+Image';
                        e.target.onerror = null;
                      }} 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-5">
            {/* Brand + Model */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">{product.brand?.name}</span>
              {product.modelNumber && (
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-mono">{product.modelNumber}</span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">{product.name}</h1>

            {/* Rating */}
            {product.rating > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-lg">
                  <Star size={14} fill="currentColor" />
                  <span className="text-sm font-bold">{product.rating}</span>
                </div>
                {product.numReviews > 0 && (
                  <span className="text-sm text-gray-400">{product.numReviews} reviews</span>
                )}
              </div>
            )}

            {/* Price Section */}
            <div className="bg-orange-50/50 rounded-xl p-4 border border-orange-100/50">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-extrabold text-gray-900">₹{price.toLocaleString('en-IN')}</span>
                {mrp > price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">₹{mrp.toLocaleString('en-IN')}</span>
                    <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-md">
                      Save ₹{(mrp - price).toLocaleString('en-IN')} ({discount}%)
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className={`text-sm font-semibold ${inStock ? 'text-green-600' : 'text-red-500'}`}>
                {inStock ? `In Stock (${stock} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Variants</h3>
                <div className="flex gap-2 flex-wrap">
                  {product.variants.map((v, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariant(selectedVariant === v ? null : v)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${selectedVariant === v ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                    >
                      {v.variantName}
                      {v.color && <span className="text-gray-400 ml-1">({v.color})</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Key Highlights</h3>
                <ul className="space-y-1.5">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-sm text-gray-600 leading-relaxed">{product.shortDescription}</p>
            )}

            {/* Quantity & Action Buttons */}
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              {inStock && (
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-l-lg"><Minus size={14} /></button>
                  <span className="w-10 text-center text-sm font-bold">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(stock, q + 1))} className="w-9 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 rounded-r-lg"><Plus size={14} /></button>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={18} />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`w-12 h-12 flex items-center justify-center rounded-lg border transition-colors ${isWishlisted(product._id) ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
              >
                <Heart size={20} fill={isWishlisted(product._id) ? 'currentColor' : 'none'} />
              </button>

              <button onClick={handleShare} className="w-12 h-12 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                <Share2 size={18} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              {[
                { icon: ShieldCheck, label: 'Genuine Product', color: 'text-green-500' },
                { icon: Truck, label: 'Fast Delivery', color: 'text-blue-500' },
                { icon: CreditCard, label: 'Secure Checkout', color: 'text-orange-500' },
                { icon: Package, label: product.warrantyDetails || '1 Year Warranty', color: 'text-purple-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                  <item.icon size={16} className={item.color} />
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Below Fold Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
            {[
              { key: 'specs', label: 'Specifications' },
              { key: 'description', label: 'Description' },
              { key: 'box', label: "What's in the Box" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.key ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 min-h-[200px]">
            {/* Specifications Tab */}
            {activeTab === 'specs' && (
              <div>
                {specSections.length > 0 ? (
                  specSections.map((section, sIdx) => (
                    <div key={sIdx} className="mb-8 last:mb-0">
                      <h3 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">{section.title}</h3>
                      <table className="w-full text-sm">
                        <tbody>
                          {(showAllSpecs ? section.rows : section.rows.slice(0, 8)).map((row, rIdx) => (
                            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-gray-50/50' : ''}>
                              <td className="px-4 py-2.5 text-gray-500 font-medium w-1/3 border-r border-gray-100">{row.label}</td>
                              <td className="px-4 py-2.5 text-gray-800 font-medium">{row.value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {section.rows.length > 8 && (
                        <button
                          onClick={() => setShowAllSpecs(!showAllSpecs)}
                          className="flex items-center gap-1 text-sm text-orange-600 font-medium mt-3 hover:underline"
                        >
                          {showAllSpecs ? 'Show Less' : `Show All ${section.rows.length} Specs`}
                          {showAllSpecs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No specifications available for this product.</p>
                )}
              </div>
            )}

            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                {product.fullDescription ? (
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{product.fullDescription}</p>
                ) : product.shortDescription ? (
                  <p className="text-gray-600 leading-relaxed">{product.shortDescription}</p>
                ) : (
                  <p className="text-gray-500 text-sm">No description available.</p>
                )}
              </div>
            )}

            {/* Box Contents Tab */}
            {activeTab === 'box' && (
              <div>
                {product.boxContents && product.boxContents.length > 0 ? (
                  <ul className="space-y-2">
                    {product.boxContents.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-700 text-sm">
                        <CheckCircle size={16} className="text-green-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">Box contents not specified.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Similar Products</h2>
              <Link to={`/shop?category=${product.category?.slug}`} className="text-sm text-orange-600 font-semibold hover:underline flex items-center gap-1">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {similarProducts.slice(0, 4).map(p => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
