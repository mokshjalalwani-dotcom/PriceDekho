import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Plus, Edit, Eye, EyeOff, X, Image as ImageIcon, Search, Trash2 } from 'lucide-react';

const AdminBrands = ({ products = [] }) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  
  // Search, Sort, Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc', 'desc'
  
  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');
  const [mappedCategories, setMappedCategories] = useState([]);
  
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const token = localStorage.getItem('adminToken');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/brands?all=true');
      setBrands(res.data || []);
    } catch (error) {
      console.error('Failed to fetch brands', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoriesAndSubcats = async () => {
    try {
      const [catsRes, subsRes] = await Promise.all([
         axios.get('/api/categories?all=true'),
         axios.get('/api/admin/subcategories?all=true', authHeader)
      ]);
      setCategories(catsRes.data || []);
      setSubcategories(subsRes.data || []);
    } catch(err) {
      console.error('Failed to fetch cats/subs', err);
    }
  };

  useEffect(() => {
    fetchBrands();
    fetchCategoriesAndSubcats();
  }, []);

  const handleOpenModal = (brand = null) => {
    setSelectedBrand(brand);
    if (brand) {
      setName(brand.name);
      setSlug(brand.slug);
      setLogo(brand.logo || '');
      // Mapped categories structure uses ObjectIds for categories, but populate might have transformed it.
      setMappedCategories(
        brand.mappedCategories?.map(m => ({
          category: m.category?._id || m.category,
          childCategories: m.childCategories || []
        })) || []
      );
    } else {
      setName('');
      setSlug('');
      setLogo('');
      setMappedCategories([]);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, slug, logo, mappedCategories };

      if (selectedBrand) {
        await axios.put(`/api/admin/brands/${selectedBrand._id}`, payload, authHeader);
      } else {
        await axios.post('/api/admin/brands', payload, authHeader);
      }
      setIsModalOpen(false);
      fetchBrands();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving brand');
    }
  };

  const handleToggleActive = async (brand) => {
    if (!window.confirm(`Are you sure you want to ${brand.isActive ? 'disable' : 'enable'} this brand?`)) return;

    try {
      await axios.patch(`/api/admin/brands/${brand._id}/toggle`, {}, authHeader);
      fetchBrands();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to toggle status');
    }
  };

  const handleDeleteBrand = async (brand) => {
    const userInput = window.prompt(`Type "confirm" to delete the brand: ${brand.name}`);
    if (userInput !== 'confirm') return;

    try {
      await axios.delete(`/api/admin/brands/${brand._id}`, authHeader);
      fetchBrands();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete brand');
    }
  };

  // Derived state for filtering, searching, and sorting
  const filteredAndSortedBrands = useMemo(() => {
    let result = [...brands];

    // Filter by search term
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(b => b.name.toLowerCase().includes(lowerSearch));
    }

    // Filter by status
    if (filterStatus === 'active') {
      result = result.filter(b => b.isActive);
    } else if (filterStatus === 'inactive') {
      result = result.filter(b => !b.isActive);
    }

    // Sort by name
    result.sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) return sortOrder === 'asc' ? -1 : 1;
      if (nameA > nameB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [brands, searchTerm, filterStatus, sortOrder]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-900">Brands ({brands.length})</h3>
        <button onClick={() => handleOpenModal()} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          <Plus size={16} /> Add Brand
        </button>
      </div>

      {/* Toolbar: Search, Filter, Sort */}
      <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center bg-white justify-between">
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-focus text-sm outline-none transition-all"
            placeholder="Search brands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)} 
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-theme-focus outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          <select 
            value={sortOrder} 
            onChange={(e) => setSortOrder(e.target.value)} 
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-theme-focus outline-none"
          >
            <option value="asc">Name (A-Z)</option>
            <option value="desc">Name (Z-A)</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Logo</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand Name</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created Date</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading brands...</td></tr>
            ) : filteredAndSortedBrands.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No brands found</td></tr>
            ) : filteredAndSortedBrands.map(brand => {
              const productCount = products.filter(p => p.brand?._id === brand._id || p.brand === brand._id).length;
              return (
                <tr key={brand._id} className={`hover:bg-gray-50 transition-colors ${!brand.isActive ? 'opacity-60 bg-gray-50/50' : ''}`}>
                  <td className="p-4">
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} className="w-10 h-10 object-contain rounded border border-gray-200 p-1 bg-white" />
                    ) : (
                      <div className="w-10 h-10 rounded border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400">
                        <ImageIcon size={16} />
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-900 text-sm">{brand.name}</p>
                    <p className="text-xs text-gray-500">/{brand.slug}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {brand.createdAt ? new Date(brand.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-700">
                    {productCount}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${brand.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {brand.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleOpenModal(brand)} className="text-gray-400 hover:text-blue-500 mr-3 transition-colors" title="Edit"><Edit size={18} /></button>
                    <button 
                      onClick={() => handleToggleActive(brand)} 
                      className={`transition-colors ${brand.isActive ? 'text-gray-400 hover:text-theme-primary mr-3' : 'text-green-500 hover:text-green-600 mr-3'}`} 
                      title={brand.isActive ? 'Disable' : 'Enable'}
                    >
                      {brand.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button 
                      onClick={() => handleDeleteBrand(brand)} 
                      className="text-gray-400 hover:text-red-500 transition-colors" 
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{selectedBrand ? 'Edit Brand' : 'Add New Brand'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => {
                    setName(e.target.value);
                    if (!selectedBrand) {
                      setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
                    }
                  }} 
                  required 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-focus outline-none" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                <input 
                  type="text" 
                  value={slug} 
                  onChange={e => setSlug(e.target.value)} 
                  disabled={!!selectedBrand} 
                  className={`w-full px-3 py-2 border border-gray-200 rounded-lg outline-none ${selectedBrand ? 'bg-gray-100 text-gray-500' : 'focus:ring-2 focus:ring-theme-focus'}`} 
                  placeholder="Auto-generated if empty"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (Optional)</label>
                <input 
                  type="text" 
                  value={logo} 
                  onChange={e => setLogo(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-focus outline-none" 
                  placeholder="https://example.com/logo.png" 
                />
              </div>

              <div className="mt-4 border-t border-gray-100 pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Mappings</label>
                <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded p-3 bg-white">
                  {categories.map(cat => {
                    const mapping = mappedCategories.find(m => m.category === cat._id);
                    const isSelected = !!mapping;
                    
                    const catSubcats = subcategories.filter(s => (s.category === cat._id || s.category?._id === cat._id) && s.childCategory);
                    const uniqueChildCats = [...new Set(catSubcats.map(s => s.childCategory))].filter(Boolean);
                    
                    const handleCatToggle = (checked) => {
                      if (checked) {
                        setMappedCategories([...mappedCategories, { category: cat._id, childCategories: [] }]);
                      } else {
                        setMappedCategories(mappedCategories.filter(m => m.category !== cat._id));
                      }
                    };

                    const handleChildToggle = (childCat, checked) => {
                      setMappedCategories(mappedCategories.map(m => {
                         if (m.category === cat._id) {
                            const currentChildren = m.childCategories || [];
                            if (checked) {
                               return { ...m, childCategories: [...currentChildren, childCat] };
                            } else {
                               return { ...m, childCategories: currentChildren.filter(c => c !== childCat) };
                            }
                         }
                         return m;
                      }));
                    };

                    return (
                       <div key={cat._id} className="border border-gray-100 rounded p-2 bg-gray-50/50">
                          <label className="flex items-center gap-2 font-medium text-sm text-gray-800 cursor-pointer">
                            <input 
                               type="checkbox" 
                               checked={isSelected} 
                               onChange={(e) => handleCatToggle(e.target.checked)} 
                               className="rounded text-theme-primary focus:ring-theme-focus w-4 h-4" 
                            />
                            {cat.name}
                          </label>
                          
                          {isSelected && uniqueChildCats.length > 0 && (
                             <div className="ml-6 mt-2 grid grid-cols-2 gap-2">
                               {uniqueChildCats.map(childCat => {
                                  const isChildSelected = mapping.childCategories?.includes(childCat);
                                  return (
                                    <label key={childCat} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                                      <input 
                                         type="checkbox" 
                                         checked={isChildSelected} 
                                         onChange={(e) => handleChildToggle(childCat, e.target.checked)} 
                                         className="rounded text-theme-primary focus:ring-theme-focus w-3.5 h-3.5" 
                                      />
                                      {childCat}
                                    </label>
                                  );
                               })}
                             </div>
                          )}
                       </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="btn-primary py-2 px-4 text-sm">{selectedBrand ? 'Save Changes' : 'Create Brand'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBrands;
