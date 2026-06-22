import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ShoppingCart, Heart, ChevronRight, Share2, CheckCircle, Package,
  ShieldCheck, Truck, RotateCcw, Star, Info, Minus, Plus, ChevronDown, ChevronUp, CreditCard, GitCompare, MessageCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCompare } from '../context/CompareContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/ProductCard';
import { CATEGORY_FIELDS } from '../constants/CategoryFieldsConfig';
import useSEO from '../hooks/useSEO';

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
  const [settings, setSettings] = useState(null);

  const { dispatch: cartDispatch } = useCart();
  const { isWishlisted, dispatch: wishlistDispatch } = useWishlist();
  const { isInCompare, isFull, dispatch: compareDispatch } = useCompare();
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

        // Fetch settings for WhatsApp number
        const setRes = await axios.get('/api/settings');
        setSettings(setRes.data);
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
      <div className="min-h-screen bg-[var(--color-background)] py-8">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white rounded-2xl aspect-square skeleton-shimmer"></div>
            <div className="space-y-4">
              <div className="h-5 bg-white rounded skeleton-shimmer w-1/4"></div>
              <div className="h-8 bg-white rounded skeleton-shimmer w-3/4"></div>
              <div className="h-6 bg-white rounded skeleton-shimmer w-1/3"></div>
              <div className="h-24 bg-white rounded-xl skeleton-shimmer w-full mt-4"></div>
              <div className="h-12 bg-white rounded-lg skeleton-shimmer w-1/2 mt-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
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
  
  const inStock = true;
  
  const allImages = [product.mainImage, ...(product.galleryImages || []), ...(product.images || [])].filter(Boolean);
  const uniqueImages = [...new Set(allImages)];
  const categorySlug = product.category?.slug || '';
  const categoryConfig = CATEGORY_FIELDS[categorySlug] || null;

  useSEO({
    title: product ? product.name : (loading ? 'Loading...' : 'Product Not Found'),
    description: product ? (product.shortDescription || product.name) : '',
    image: product ? product.mainImage : '',
    url: window.location.href
  });

  const structuredData = product ? {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": uniqueImages,
    "description": product.shortDescription || product.name,
    "sku": product.modelNumber || product._id,
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": price,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock"
    }
  } : null;

  const handleAddToCart = () => {
    cartDispatch({
      type: 'ADD_ITEM',
      payload: { ...product, price, qty }
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

  const handleWhatsAppEnquiry = () => {
    if (!settings?.whatsappNumber) {
      addToast('WhatsApp enquiry is not configured yet', 'error');
      return;
    }

    const categoryName = product.category?.name || 'N/A';
    const brandName = product.brand?.name || product.brand || 'N/A';
    const modelNum = product.modelNumber || product.categoryFields?.modelNumber || 'N/A';
    const capacitySize = product.capacity || product.size || product.categoryFields?.capacity || product.categoryFields?.size || 'N/A';
    const color = product.color || product.categoryFields?.color || 'N/A';

    const message = `Hello, I am interested in this product:

Product: ${product.name}
Category: ${categoryName}
Brand: ${brandName}
Model: ${modelNum}
Capacity/Size: ${capacitySize}
Color: ${color}
Price: ₹${price.toLocaleString('en-IN')}

Please share more details.`;

    const waLink = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(waLink, '_blank');
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
    <div className="min-h-screen bg-[var(--color-background)]">
      {structuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      )}
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center text-sm text-gray-500 flex-wrap">
            <Link to="/" className="hover:text-orange-500 transition-colors">Home</Link>
            <ChevronRight size={14} className="mx-1.5 shrink-0 text-gray-300" />
            <Link to="/shop" className="hover:text-orange-500 transition-colors">Shop</Link>
            {product.category && (
              <>
                <ChevronRight size={14} className="mx-1.5 shrink-0 text-gray-300" />
                <Link to={`/shop?category=${product.category.slug}`} className="hover:text-orange-500 transition-colors">{product.category.name}</Link>
              </>
            )}
            <ChevronRight size={14} className="mx-1.5 shrink-0 text-gray-300" />
            <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden aspect-square flex items-center justify-center p-6 relative group">
              <img
                src={uniqueImages[selectedImage] || 'https://placehold.co/500x500/f8fafc/94a3b8?text=No+Image'}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.target.src = 'https://placehold.co/500x500/f8fafc/94a3b8?text=No+Image';
                  e.target.onerror = null;
                }}
              />
              {discount > 0 && (
                <span className="absolute top-4 left-4 badge-discount text-xs px-3 py-1 rounded-lg shadow">{discount}% OFF</span>
              )}
            </div>
            {uniqueImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {uniqueImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 border-2 rounded-xl overflow-hidden shrink-0 bg-white flex items-center justify-center p-1.5 transition-all ${selectedImage === idx ? 'border-orange-500 shadow-md ring-1 ring-orange-200' : 'border-gray-200 hover:border-gray-300'}`}
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
              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold bg-gray-100 px-2.5 py-0.5 rounded">{product.brand?.name}</span>
              {product.modelNumber && (
                <span className="text-xs bg-gray-50 px-2 py-0.5 rounded text-gray-400 font-mono border border-gray-100">{product.modelNumber}</span>
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
            <div className="bg-orange-50/60 rounded-xl p-5 border border-orange-100/50">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl font-extrabold text-gray-900">₹{price.toLocaleString('en-IN')}</span>
                {mrp > price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">₹{mrp.toLocaleString('en-IN')}</span>
                    <span className="text-sm font-bold text-green-600 bg-green-100 px-2.5 py-1 rounded-md">
                      Save ₹{(mrp - price).toLocaleString('en-IN')} ({discount}%)
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1.5">Inclusive of all taxes</p>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 stock-pulse"></span>
              <span className="text-sm font-semibold text-green-600">In Stock</span>
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
                      className={`px-3.5 py-2 text-sm font-medium rounded-lg border-2 transition-colors ${selectedVariant === v ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
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
                <h3 className="text-sm font-semibold text-gray-700 mb-2.5">Key Highlights</h3>
                <ul className="space-y-2">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <CheckCircle size={15} className="text-green-500 shrink-0 mt-0.5" />
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
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden shrink-0 bg-white">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"><Minus size={15} /></button>
                <span className="w-10 text-center text-sm font-bold border-x border-gray-100">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-10 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"><Plus size={15} /></button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 btn-primary py-3 flex items-center justify-center gap-2 text-sm font-bold"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 transition-colors ${isWishlisted(product._id) ? 'bg-red-50 border-red-200 text-red-500' : 'border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-red-400'}`}
              >
                <Heart size={20} fill={isWishlisted(product._id) ? 'currentColor' : 'none'} />
              </button>

              <button onClick={handleShare} className="w-12 h-12 flex items-center justify-center rounded-lg border-2 border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
                <Share2 size={18} />
              </button>

              <button
                onClick={() => {
                  if (isInCompare(product._id)) {
                    compareDispatch({ type: 'REMOVE', payload: product._id });
                    addToast('Removed from compare', 'info');
                  } else {
                    if (isFull) {
                      addToast('Compare list is full (max 4). Remove one first.', 'error');
                      return;
                    }
                    compareDispatch({ type: 'ADD', payload: product });
                    addToast('Added to compare');
                  }
                }}
                className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 transition-colors ${
                  isInCompare(product._id)
                    ? 'bg-blue-50 border-blue-200 text-blue-500'
                    : 'border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-blue-400'
                }`}
                title={isInCompare(product._id) ? 'Remove from compare' : 'Add to compare'}
              >
                <GitCompare size={18} />
              </button>
            </div>

            {/* WhatsApp Enquiry */}
            <div className="pt-2">
              <button
                onClick={handleWhatsAppEnquiry}
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-3 rounded-lg font-bold transition-colors shadow-sm"
              >
                <MessageCircle size={20} />
                Send Enquiry
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-3">
              {[
                { icon: ShieldCheck, label: 'Genuine Product', color: 'text-green-500', bg: 'bg-green-50' },
                { icon: Truck, label: 'Fast Delivery', color: 'text-blue-500', bg: 'bg-blue-50' },
                { icon: CreditCard, label: 'Secure Checkout', color: 'text-orange-500', bg: 'bg-orange-50' },
                { icon: Package, label: product.warrantyDetails || '1 Year Warranty', color: 'text-purple-500', bg: 'bg-purple-50' },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg ${item.bg}`}>
                  <item.icon size={16} className={item.color} />
                  <span className="text-xs font-medium text-gray-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Below Fold Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden mb-12">
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
                className={`px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200 ${activeTab === tab.key ? 'border-orange-500 text-orange-600 bg-orange-50/30' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'}`}
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
                      <div className="rounded-lg overflow-hidden border border-gray-100">
                        <table className="w-full text-sm">
                          <tbody>
                            {(showAllSpecs ? section.rows : section.rows.slice(0, 8)).map((row, rIdx) => (
                              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-gray-50/70' : 'bg-white'}>
                                <td className="px-4 py-3 text-gray-500 font-medium w-1/3 border-r border-gray-100">{row.label}</td>
                                <td className="px-4 py-3 text-gray-800 font-medium">{row.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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
                  <ul className="space-y-2.5">
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
              <h2 className="section-heading">Similar Products</h2>
              <Link to={`/shop?category=${product.category?.slug}`} className="text-sm text-orange-600 font-semibold hover:text-orange-700 flex items-center gap-1 transition-colors">
                View All <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
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
