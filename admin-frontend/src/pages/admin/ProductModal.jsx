import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import { X, Save, AlertCircle, Plus, Trash2, ChevronDown, ChevronUp, Image, Package, IndianRupee, FileText, Settings, Tag, Layers, List, Box, Search } from 'lucide-react';
import { getCategoryConfig } from '../../constants/CategoryFieldsConfig';
import { convertToNLC } from '../../utils/nlcConverter';

const SECTIONS = [
  { id: 'basic', label: 'Basic Info', icon: Package },
  { id: 'pricing', label: 'Pricing', icon: IndianRupee },
  { id: 'images', label: 'Images', icon: Image },
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'highlights', label: 'Highlights & Box', icon: List },
  { id: 'category', label: 'Category Details', icon: Settings },
  { id: 'specs', label: 'Specifications', icon: Layers },
  { id: 'variants', label: 'Variants', icon: Box },
  { id: 'tags', label: 'Tags & SEO', icon: Tag },
];

const emptyForm = {
  name: '', slug: '', modelNumber: '', color: '', subCategory: '',
  category: '', brand: '',
  sellingPrice: '', mrp: '', discountPercentage: '', offerPrice: '',
  countInStock: 0, availability: 'In Stock', isVisible: true,
  shortDescription: '', fullDescription: '',
  youtubeUrl: '', additionalContent: '',
  highlights: [''], boxContents: [''], warrantyDetails: '',
  tags: '',
  mainImage: '', galleryImages: [],
  images: [],
  isFeatured: false, isBestSeller: false,
  variants: [],
  specGroups: [{ groupName: '', fields: [{ fieldName: '', fieldValue: '' }] }],
  categoryFields: {},
};

const ProductModal = ({ isOpen, onClose, onSave, product = null }) => {
  const [formData, setFormData] = useState({ ...emptyForm });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSections, setOpenSections] = useState(['basic', 'pricing', 'content']);

  const token = localStorage.getItem('adminToken');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // Find category slug from selected category ID
  // Find category slug and object from selected category ID
  const selectedCategoryObj = useMemo(() => {
    if (!formData.category) return null;
    return categories.find(c => c._id === formData.category) || null;
  }, [formData.category, categories]);

  const selectedCategorySlug = selectedCategoryObj?.slug || '';

  const [brandSearch, setBrandSearch] = useState('');
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const brandDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target)) {
        setIsBrandDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredBrands = useMemo(() => {
    let result = brands;

    if (formData.category) {
      result = result.filter(b => {
        const mapping = b.mappedCategories?.find(m => m.category === formData.category || m.category?._id === formData.category);
        if (!mapping) return false;
        
        const isCombined = selectedCategorySlug === 'gas-stove' || selectedCategorySlug === 'fan';
        if (isCombined && formData.childCategory) {
           return mapping.childCategories?.includes(formData.childCategory);
        }
        return true;
      });
    }

    if (brandSearch) {
      result = result.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()));
    }
    return result;
  }, [brands, brandSearch, formData.category, formData.childCategory, selectedCategorySlug]);

  const categoryConfig = useMemo(() => {
    const isCombinedCategory = selectedCategorySlug === 'gas-stove' || selectedCategorySlug === 'fan' || selectedCategorySlug === 'mixer';
    if (isCombinedCategory && !formData.childCategory) {
      return null;
    }
    return getCategoryConfig(selectedCategorySlug, formData.childCategory || formData.subCategory);
  }, [selectedCategorySlug, formData.subCategory, formData.childCategory]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes, subRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/brands?all=true'),
          axios.get('/api/admin/subcategories?all=true', authHeader)
        ]);
        setCategories(catRes.data);
        setBrands(brandRes.data);
        setSubcategories(subRes.data);
      } catch (err) {
        console.error('Error fetching categories/brands', err);
      }
    };

    if (isOpen) {
      fetchData();
      if (product) {
        const p = { ...product };
        setFormData({
          ...emptyForm,
          ...p,
          category: p.category?._id || p.category || '',
          brand: p.brand?._id || p.brand || '',
          sellingPrice: p.sellingPrice || p.price || '',
          youtubeUrl: p.youtubeUrl || '',
          additionalContent: p.additionalContent || '',
          highlights: p.highlights?.length > 0 ? p.highlights : [''],
          boxContents: p.boxContents?.length > 0 ? p.boxContents : [''],
          tags: (p.tags || []).join(', '),
          specGroups: p.specGroups?.length > 0 ? p.specGroups : [{ groupName: '', fields: [{ fieldName: '', fieldValue: '' }] }],
          variants: p.variants || [],
          categoryFields: p.categoryFields || {},
          mainImage: p.mainImage || (p.images?.[0]) || '',
          galleryImages: p.galleryImages || p.images?.slice(1) || [],
        });
        setOpenSections(['basic', 'pricing', 'category', 'content']);
      } else {
        setFormData({ ...emptyForm });
        setOpenSections(['basic', 'pricing', 'content']);
      }
      setError(null);
    }
  }, [isOpen, product]);

  const toggleSection = (id) => {
    setOpenSections(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const nextState = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        slug: name === 'name' && !product
          ? value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
          : prev.slug
      };

      // Reset brand if category or childCategory changes and current brand is not valid
      if ((name === 'category' || name === 'childCategory') && prev.brand) {
        // Validate against mappedCategories
        const categoryToUse = name === 'category' ? value : prev.category;
        const childToUse = name === 'childCategory' ? value : prev.childCategory;
        const slugToUse = name === 'category' ? (categories.find(c => c._id === value)?.slug || '') : selectedCategorySlug;
        
        const isCombined = slugToUse === 'gas-stove' || slugToUse === 'fan';

        const isValid = brands.find(b => b._id === prev.brand)?.mappedCategories?.some(m => {
           if (m.category !== categoryToUse && m.category?._id !== categoryToUse) return false;
           if (isCombined && childToUse) {
              return m.childCategories?.includes(childToUse);
           }
           return true;
        });

        if (!isValid) {
          nextState.brand = '';
        }
      }

      // Reset subcategory if category changes
      if (name === 'category') {
        nextState.subCategory = '';
        nextState.childCategory = '';
      }

      return nextState;
    });
  };

  const handleCategoryFieldChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      categoryFields: { ...prev.categoryFields, [key]: value }
    }));
  };

  // --- Array helpers ---
  const handleArrayChange = (idx, val, field) => {
    setFormData(prev => {
      const arr = [...(prev[field] || [])];
      arr[idx] = val;
      return { ...prev, [field]: arr };
    });
  };
  const addArrayItem = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...(prev[field] || []), ''] }));
  };
  const removeArrayItem = (idx, field) => {
    setFormData(prev => ({ ...prev, [field]: (prev[field] || []).filter((_, i) => i !== idx) }));
  };

  // --- Spec groups ---
  const handleSpecGroupChange = (gIdx, key, val) => {
    setFormData(prev => {
      const groups = [...prev.specGroups];
      groups[gIdx] = { ...groups[gIdx], [key]: val };
      return { ...prev, specGroups: groups };
    });
  };
  const handleSpecFieldChange = (gIdx, fIdx, key, val) => {
    setFormData(prev => {
      const groups = [...prev.specGroups];
      const fields = [...groups[gIdx].fields];
      fields[fIdx] = { ...fields[fIdx], [key]: val };
      groups[gIdx] = { ...groups[gIdx], fields };
      return { ...prev, specGroups: groups };
    });
  };
  const addSpecGroup = () => {
    setFormData(prev => ({
      ...prev,
      specGroups: [...prev.specGroups, { groupName: '', fields: [{ fieldName: '', fieldValue: '' }] }]
    }));
  };
  const removeSpecGroup = (gIdx) => {
    setFormData(prev => ({
      ...prev,
      specGroups: prev.specGroups.filter((_, i) => i !== gIdx)
    }));
  };
  const addSpecField = (gIdx) => {
    setFormData(prev => {
      const groups = [...prev.specGroups];
      groups[gIdx] = { ...groups[gIdx], fields: [...groups[gIdx].fields, { fieldName: '', fieldValue: '' }] };
      return { ...prev, specGroups: groups };
    });
  };
  const removeSpecField = (gIdx, fIdx) => {
    setFormData(prev => {
      const groups = [...prev.specGroups];
      groups[gIdx] = { ...groups[gIdx], fields: groups[gIdx].fields.filter((_, i) => i !== fIdx) };
      return { ...prev, specGroups: groups };
    });
  };

  // --- Variants ---
  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { variantName: '', color: '', sellingPrice: '', mrp: '' }]
    }));
  };
  const handleVariantChange = (idx, key, val) => {
    setFormData(prev => {
      const vars = [...prev.variants];
      vars[idx] = { ...vars[idx], [key]: val };
      return { ...prev, variants: vars };
    });
  };
  const removeVariant = (idx) => {
    setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== idx) }));
  };

  // --- Price auto-calc ---
  useEffect(() => {
    if (formData.mrp && formData.sellingPrice && Number(formData.mrp) > Number(formData.sellingPrice)) {
      const disc = Math.round(((formData.mrp - formData.sellingPrice) / formData.mrp) * 100);
      setFormData(prev => ({ ...prev, discountPercentage: disc }));
    }
  }, [formData.mrp, formData.sellingPrice]);

  // --- Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.name.trim()) throw new Error('Product name is required');
      if (!formData.category) throw new Error('Category is required');
      if (!formData.brand) throw new Error('Brand is required');
      if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0) throw new Error('Valid price is required');

      const isCombinedCategory = selectedCategorySlug === 'gas-stove' || selectedCategorySlug === 'fan';
      if (isCombinedCategory && !formData.childCategory) {
        throw new Error('Please select a Child Category.');
      }

      if (formData.youtubeUrl) {
        const ytRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        if (!ytRegex.test(formData.youtubeUrl)) {
          throw new Error('Please enter a valid YouTube URL.');
        }
      }

      const allImages = [formData.mainImage, ...(formData.galleryImages || [])].filter(Boolean);

      const submissionData = {
        ...formData,
        price: Number(formData.sellingPrice),
        sellingPrice: Number(formData.sellingPrice),
        mrp: formData.mrp ? Number(formData.mrp) : undefined,
        offerPrice: formData.offerPrice ? Number(formData.offerPrice) : undefined,
        countInStock: 9999,
        availability: 'In Stock',
        images: allImages,
        tags: typeof formData.tags === 'string'
          ? formData.tags.split(',').map(t => t.trim()).filter(Boolean)
          : formData.tags,
        highlights: (formData.highlights || []).filter(h => h.trim()),
        boxContents: (formData.boxContents || []).filter(h => h.trim()),
        specGroups: (formData.specGroups || [])
          .filter(g => g.groupName.trim())
          .map(g => ({
            ...g,
            fields: g.fields.filter(f => f.fieldName.trim() && f.fieldValue.trim())
          })),
        variants: (formData.variants || []).filter(v => v.variantName.trim()),
        // Also build legacy specifications map from specGroups for backward compat
        specifications: (() => {
          const specs = {};
          (formData.specGroups || []).forEach(g => {
            g.fields.forEach(f => {
              if (f.fieldName && f.fieldValue) specs[f.fieldName] = f.fieldValue;
            });
          });
          return specs;
        })(),
      };

      await onSave(submissionData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-focus focus:border-transparent text-sm outline-none transition-all';
  const labelCls = 'block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide';

  const renderCategoryFields = () => {
    if (!categoryConfig) {
      return <p className="text-sm text-gray-400 italic">Select a category to see category-specific fields.</p>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoryConfig.fields.map(field => (
          <div key={field.key}>
            <label className={labelCls}>
              {field.label} {field.required && <span className="text-red-400">*</span>}
            </label>
            {field.type === 'boolean' ? (
              <select
                value={formData.categoryFields?.[field.key] || ''}
                onChange={(e) => handleCategoryFieldChange(field.key, e.target.value)}
                className={inputCls}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            ) : field.type === 'select' ? (
              <select
                value={formData.categoryFields?.[field.key] || ''}
                onChange={(e) => handleCategoryFieldChange(field.key, e.target.value)}
                className={inputCls}
              >
                <option value="">Select {field.label}</option>
                {field.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={formData.categoryFields?.[field.key] || ''}
                onChange={(e) => handleCategoryFieldChange(field.key, e.target.value)}
                placeholder={field.placeholder || ''}
                className={inputCls}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  const SectionHeader = ({ section }) => {
    const Icon = section.icon;
    const isOpen = openSections.includes(section.id);
    return (
      <button
        type="button"
        onClick={() => toggleSection(section.id)}
        className={`w-full flex items-center justify-between px-5 py-3 rounded-lg transition-colors ${
          isOpen ? 'bg-theme-light text-theme-dark' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Icon size={16} />
          {section.label}
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 pt-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {product ? 'Edit Product' : 'Add New Product'}
            </h2>
            {selectedCategorySlug && categoryConfig && (
              <span className="text-xs text-theme-primary font-medium">{categoryConfig.label} Form</span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Content */}
        <form id="product-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-3">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-3 text-sm font-medium border border-red-100">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* ========= BASIC INFO ========= */}
          <SectionHeader section={SECTIONS[0]} />
          {openSections.includes('basic') && (
            <div className="p-4 border border-gray-100 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Product Name <span className="text-red-400">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputCls} placeholder="e.g. Samsung 55 inch 4K Smart TV" />
                </div>
                <div>
                  <label className={labelCls}>Slug</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleChange} required className={`${inputCls} bg-gray-50`} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Category <span className="text-red-400">*</span></label>
                  <select name="category" value={formData.category} onChange={handleChange} required className={inputCls}>
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                  </select>
                </div>
                <div className="relative" ref={brandDropdownRef}>
                  <label className={labelCls}>Brand <span className="text-red-400">*</span></label>
                  <div className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={14} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className={`${inputCls} pl-9`}
                      placeholder="Search brand..."
                      value={isBrandDropdownOpen ? brandSearch : (brands.find(b => b._id === formData.brand)?.name || '')}
                      onChange={(e) => {
                        setBrandSearch(e.target.value);
                        setIsBrandDropdownOpen(true);
                        if (e.target.value === '') {
                          setFormData(prev => ({ ...prev, brand: '' }));
                        }
                      }}
                      onFocus={() => {
                        setIsBrandDropdownOpen(true);
                        setBrandSearch('');
                      }}
                      required={!formData.brand}
                    />
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                      <ChevronDown size={16} className="text-gray-400" />
                    </div>
                  </div>
                  
                  {isBrandDropdownOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredBrands.length > 0 ? (
                        filteredBrands.map(b => (
                          <div
                            key={b._id}
                            className={`px-4 py-2 cursor-pointer hover:bg-theme-light hover:text-theme-primary transition-colors text-sm ${formData.brand === b._id ? 'bg-theme-light text-theme-primary font-medium' : 'text-gray-700'}`}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, brand: b._id }));
                              setBrandSearch('');
                              setIsBrandDropdownOpen(false);
                            }}
                          >
                            {b.name}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center bg-gray-50">
                          No brands found.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className={labelCls}>Model Number</label>
                  <input type="text" name="modelNumber" value={formData.modelNumber} onChange={handleChange} className={inputCls} placeholder="e.g. UA55AU7700" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Color</label>
                  <input type="text" name="color" value={formData.color} onChange={handleChange} className={inputCls} placeholder="e.g. Black, Silver" />
                </div>
                {selectedCategoryObj?.subCategories?.length > 0 && (
                  <div>
                    <label className={labelCls}>
                      Child Category <span className="text-red-400">*</span>
                    </label>
                    <select 
                      name="childCategory" 
                      value={formData.childCategory || ''} 
                      onChange={handleChange} 
                      required={true}
                      className={inputCls}
                    >
                      <option value="">Select Child Category</option>
                      {selectedCategoryObj?.subCategories?.map(sub => {
                        const subName = typeof sub === 'string' ? sub : sub.name;
                        return <option key={`str-${subName}`} value={subName}>{subName}</option>;
                      })}
                    </select>
                  </div>
                )}
                <div>
                  <label className={labelCls}>
                    Sub-Category {subcategories.some(s => {
                      const matchesCat = (s.category?._id === formData.category || s.category === formData.category);
                      if (!matchesCat) return false;
                      if (selectedCategoryObj?.subCategories?.length > 0) {
                        return s.childCategory === formData.childCategory;
                      }
                      return true;
                    }) && <span className="text-red-400">*</span>}
                  </label>
                  {subcategories.some(s => {
                      const matchesCat = (s.category?._id === formData.category || s.category === formData.category);
                      if (!matchesCat) return false;
                      if (selectedCategoryObj?.subCategories?.length > 0) {
                        return s.childCategory === formData.childCategory;
                      }
                      return true;
                  }) ? (
                    <select 
                      name="subCategory" 
                      value={formData.subCategory || ''} 
                      onChange={handleChange} 
                      className={inputCls}
                    >
                      <option value="">Select Subcategory</option>
                      {subcategories
                        .filter(s => {
                          const matchesCat = (s.category?._id === formData.category || s.category === formData.category);
                          if (!matchesCat) return false;
                          if (selectedCategoryObj?.subCategories?.length > 0) {
                            return s.childCategory === formData.childCategory;
                          }
                          return true;
                        })
                        .map(sub => (
                          <option key={sub._id} value={sub.name}>{sub.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input type="text" name="subCategory" value={formData.subCategory || ''} onChange={handleChange} className={inputCls} placeholder="Optional sub-category" disabled={!!formData.category} />
                  )}
                </div>
                <div className="flex items-end gap-4 pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} className="w-4 h-4 text-theme-primary rounded" />
                    <span className="text-sm font-medium text-gray-700">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} className="w-4 h-4 text-green-500 rounded" />
                    <span className="text-sm font-medium text-gray-700">Bestseller</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isVisible" checked={formData.isVisible} onChange={handleChange} className="w-4 h-4 text-blue-500 rounded" />
                    <span className="text-sm font-medium text-gray-700">Visible</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ========= PRICING ========= */}
          <SectionHeader section={SECTIONS[1]} />
          {openSections.includes('pricing') && (
            <div className="p-4 border border-gray-100 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelCls}>Selling Price (₹) <span className="text-red-400">*</span></label>
                  <input type="number" name="sellingPrice" value={formData.sellingPrice} onChange={handleChange} required min="0" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>MRP (₹)</label>
                  <input type="number" name="mrp" value={formData.mrp} onChange={handleChange} min="0" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Discount %</label>
                  <input type="number" name="discountPercentage" value={formData.discountPercentage} readOnly className={`${inputCls} bg-gray-50`} />
                </div>
                <div>
                  <label className={labelCls}>Offer Price (₹)</label>
                  <input type="number" name="offerPrice" value={formData.offerPrice} onChange={handleChange} min="0" className={inputCls} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={labelCls}>Warranty Details</label>
                  <input type="text" name="warrantyDetails" value={formData.warrantyDetails} onChange={handleChange} className={inputCls} placeholder="e.g. 1 Year Comprehensive" />
                </div>
              </div>
            </div>
          )}

          {/* ========= IMAGES ========= */}
          <SectionHeader section={SECTIONS[2]} />
          {openSections.includes('images') && (
            <div className="p-4 border border-gray-100 rounded-lg space-y-4">
              <div>
                <label className={labelCls}>Main Product Image URL</label>
                <input type="text" name="mainImage" value={formData.mainImage} onChange={handleChange} className={inputCls} placeholder="https://example.com/image.jpg" />
                {formData.mainImage && (
                  <img src={formData.mainImage} alt="Preview" referrerPolicy="no-referrer" className="w-20 h-20 object-contain border rounded-lg mt-2" />
                )}
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={labelCls}>Gallery Images (URLs)</label>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ''] }))} className="text-xs text-theme-primary font-bold hover:underline">+ Add Image</button>
                </div>
                <div className="space-y-2">
                  {(formData.galleryImages || []).map((img, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input type="text" value={img} onChange={(e) => { const g = [...formData.galleryImages]; g[idx] = e.target.value; setFormData(prev => ({ ...prev, galleryImages: g })); }} className={inputCls} placeholder="Image URL" />
                      {img && <img src={img} alt="" referrerPolicy="no-referrer" className="w-10 h-10 object-contain border rounded shrink-0" />}
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, galleryImages: prev.galleryImages.filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========= CONTENT ========= */}
          <SectionHeader section={SECTIONS[3]} />
          {openSections.includes('content') && (
            <div className="p-4 border border-gray-100 rounded-lg space-y-4">
              <div>
                <label className={labelCls}>Short Description</label>
                <textarea name="shortDescription" value={formData.shortDescription} onChange={handleChange} rows="2" className={inputCls} placeholder="Brief product summary..." />
              </div>
              <div>
                <label className={labelCls}>Full Description</label>
                <textarea name="fullDescription" value={formData.fullDescription} onChange={handleChange} rows="4" className={inputCls} placeholder="Detailed product description..." />
              </div>
              <div>
                <label className={labelCls}>Product YouTube Video</label>
                <input type="text" name="youtubeUrl" value={formData.youtubeUrl} onChange={handleChange} className={inputCls} placeholder="https://www.youtube.com/watch?v=XXXXXXXX" />
              </div>
              <div>
                <label className={labelCls}>NLC (Real Price / Code)</label>
                <input 
                  type="text" 
                  name="additionalContent" 
                  value={formData.additionalContent} 
                  onChange={handleChange} 
                  className={inputCls} 
                  placeholder="e.g. 12345" 
                />
                {formData.additionalContent && (
                  <p className="mt-1.5 text-xs text-gray-500 font-mono bg-gray-50 p-1.5 rounded inline-block border border-gray-100">
                    Preview: <span className="font-bold text-gray-800">{convertToNLC(formData.additionalContent)}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ========= HIGHLIGHTS & BOX ========= */}
          <SectionHeader section={SECTIONS[4]} />
          {openSections.includes('highlights') && (
            <div className="p-4 border border-gray-100 rounded-lg space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={labelCls}>Key Highlights</label>
                  <button type="button" onClick={() => addArrayItem('highlights')} className="text-xs text-theme-primary font-bold hover:underline">+ Add</button>
                </div>
                {(formData.highlights || []).map((h, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" value={h} onChange={(e) => handleArrayChange(idx, e.target.value, 'highlights')} className={inputCls} placeholder="e.g. 4K Ultra HD Display" />
                    <button type="button" onClick={() => removeArrayItem(idx, 'highlights')} className="text-red-400 hover:text-red-600 shrink-0"><X size={14} /></button>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={labelCls}>Box Contents</label>
                  <button type="button" onClick={() => addArrayItem('boxContents')} className="text-xs text-theme-primary font-bold hover:underline">+ Add</button>
                </div>
                {(formData.boxContents || []).map((b, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input type="text" value={b} onChange={(e) => handleArrayChange(idx, e.target.value, 'boxContents')} className={inputCls} placeholder="e.g. Remote Control" />
                    <button type="button" onClick={() => removeArrayItem(idx, 'boxContents')} className="text-red-400 hover:text-red-600 shrink-0"><X size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========= CATEGORY-SPECIFIC FIELDS ========= */}
          <SectionHeader section={SECTIONS[5]} />
          {openSections.includes('category') && (
            <div className="p-4 border border-gray-100 rounded-lg">
              {renderCategoryFields()}
            </div>
          )}

          {/* ========= SPECIFICATION GROUPS ========= */}
          <SectionHeader section={SECTIONS[6]} />
          {openSections.includes('specs') && (
            <div className="p-4 border border-gray-100 rounded-lg space-y-4">
              {(formData.specGroups || []).map((group, gIdx) => (
                <div key={gIdx} className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-100">
                  <div className="flex gap-2 items-center">
                    <input type="text" value={group.groupName} onChange={(e) => handleSpecGroupChange(gIdx, 'groupName', e.target.value)} className={inputCls} placeholder="Group Name (e.g. Display, Power)" />
                    <button type="button" onClick={() => removeSpecGroup(gIdx)} className="text-red-400 hover:text-red-600 shrink-0 p-1"><Trash2 size={14} /></button>
                  </div>
                  {group.fields.map((field, fIdx) => (
                    <div key={fIdx} className="flex gap-2 ml-4">
                      <input type="text" value={field.fieldName} onChange={(e) => handleSpecFieldChange(gIdx, fIdx, 'fieldName', e.target.value)} className={`${inputCls} flex-1`} placeholder="Field (e.g. Screen Size)" />
                      <input type="text" value={field.fieldValue} onChange={(e) => handleSpecFieldChange(gIdx, fIdx, 'fieldValue', e.target.value)} className={`${inputCls} flex-1`} placeholder="Value (e.g. 55 inch)" />
                      <button type="button" onClick={() => removeSpecField(gIdx, fIdx)} className="text-red-400 hover:text-red-600 shrink-0"><X size={14} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addSpecField(gIdx)} className="text-xs text-blue-600 font-bold hover:underline ml-4">+ Add Field</button>
                </div>
              ))}
              <button type="button" onClick={addSpecGroup} className="flex items-center gap-1 text-sm text-theme-primary font-bold hover:underline">
                <Plus size={14} /> Add Specification Group
              </button>
            </div>
          )}

          {/* ========= VARIANTS ========= */}
          <SectionHeader section={SECTIONS[7]} />
          {openSections.includes('variants') && (
            <div className="p-4 border border-gray-100 rounded-lg space-y-3">
              {formData.variants.map((v, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
                    <div>
                      <label className={labelCls}>Variant Name</label>
                      <input type="text" value={v.variantName} onChange={(e) => handleVariantChange(idx, 'variantName', e.target.value)} className={inputCls} placeholder="e.g. 256GB" />
                    </div>
                    <div>
                      <label className={labelCls}>Color</label>
                      <input type="text" value={v.color} onChange={(e) => handleVariantChange(idx, 'color', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Price (₹)</label>
                      <input type="number" value={v.sellingPrice} onChange={(e) => handleVariantChange(idx, 'sellingPrice', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>MRP (₹)</label>
                      <input type="number" value={v.mrp} onChange={(e) => handleVariantChange(idx, 'mrp', e.target.value)} className={inputCls} />
                    </div>
                    <div className="absolute right-0 top-0">
                      <button type="button" onClick={() => removeVariant(idx)} className="text-red-400 hover:text-red-600 p-2 bg-white rounded-bl-lg shadow-sm"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addVariant} className="flex items-center gap-1 text-sm text-theme-primary font-bold hover:underline">
                <Plus size={14} /> Add Variant
              </button>
            </div>
          )}

          {/* ========= TAGS ========= */}
          <SectionHeader section={SECTIONS[8]} />
          {openSections.includes('tags') && (
            <div className="p-4 border border-gray-100 rounded-lg">
              <label className={labelCls}>Tags / Keywords (comma-separated)</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} className={inputCls} placeholder="e.g. samsung, smart tv, 4k, electronics" />
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
          <span className="text-xs text-gray-400">
            {selectedCategorySlug ? `Category: ${categoryConfig?.label || selectedCategorySlug}` : 'No category selected'}
          </span>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium text-sm">
              Cancel
            </button>
            <button form="product-form" type="submit" disabled={loading} className="px-6 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-hover transition-colors flex items-center gap-2 font-bold text-sm shadow-lg shadow-theme-primary/20 disabled:opacity-50">
              {loading ? 'Saving...' : <><Save size={16} /> {product ? 'Update' : 'Add Product'}</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
