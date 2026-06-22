import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Eye, EyeOff, X, Image as ImageIcon } from 'lucide-react';

const AdminBrands = ({ products = [], categories = [] }) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

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

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenModal = (brand = null) => {
    setSelectedBrand(brand);
    if (brand) {
      setName(brand.name);
      setSlug(brand.slug);
      setSelectedCategories(brand.categories || []);
    } else {
      setName('');
      setSlug('');
      setSelectedCategories([]);
    }
    setIsModalOpen(true);
  };

  const handleCategoryToggle = (catId) => {
    setSelectedCategories(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        slug,
        categories: selectedCategories
      };

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
    if (brand.isActive) {
      const activeProductsCount = products.filter(p => p.brand?._id === brand._id && p.isVisible !== false).length;
      if (activeProductsCount > 0) {
        const confirm = window.confirm(`Warning: ${activeProductsCount} active products are associated with this brand.\n\nDisabling it may affect filters and product display.\n\nAre you sure?`);
        if (!confirm) return;
      } else {
         if (!window.confirm('Disable this brand?')) return;
      }
    } else {
      if (!window.confirm('Enable this brand?')) return;
    }

    try {
      await axios.patch(`/api/admin/brands/${brand._id}/toggle`, {}, authHeader);
      fetchBrands();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to toggle brand status');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-900">Brands ({brands.length})</h3>
        <button onClick={() => handleOpenModal()} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          <Plus size={16} /> Add Brand
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Brand</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mapped Categories</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading brands...</td></tr>
            ) : brands.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No brands found</td></tr>
            ) : brands.map(brand => {
              const productCount = products.filter(p => p.brand?._id === brand._id).length;
              return (
                <tr key={brand._id} className={`hover:bg-gray-50 transition-colors ${!brand.isActive ? 'opacity-60 bg-gray-50/50' : ''}`}>
                  <td className="p-4">
                    <p className="font-semibold text-gray-900 text-sm">{brand.name}</p>
                    <p className="text-xs text-gray-500">/{brand.slug}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-[300px]">
                      {brand.categories?.length > 0 ? (
                        brand.categories.map(catId => {
                          const cat = categories.find(c => c._id === catId);
                          return cat ? (
                            <span key={catId} className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 rounded text-xs">{cat.name}</span>
                          ) : null;
                        })
                      ) : (
                        <span className="text-xs text-gray-400 italic">No specific categories</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-700">{productCount}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${brand.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {brand.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleOpenModal(brand)} className="text-gray-400 hover:text-blue-500 mr-3 transition-colors" title="Edit"><Edit size={18} /></button>
                    <button 
                      onClick={() => handleToggleActive(brand)} 
                      className={`transition-colors ${brand.isActive ? 'text-gray-400 hover:text-orange-500' : 'text-green-500 hover:text-green-600'}`} 
                      title={brand.isActive ? 'Disable Brand' : 'Enable Brand'}
                    >
                      {brand.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto pt-20">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl my-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{selectedBrand ? 'Edit Brand' : 'Add New Brand'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-200" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required disabled={!!selectedBrand} className={`w-full px-3 py-2 border border-gray-200 rounded-lg ${selectedBrand ? 'bg-gray-100 text-gray-500' : 'focus:ring-2 focus:ring-orange-200'}`} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Mapping (Optional)</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 border border-gray-200 rounded-lg bg-gray-50/50">
                  {categories.filter(c => c.isActive).map(cat => (
                    <label key={cat._id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100 p-1.5 rounded">
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(cat._id)}
                        onChange={() => handleCategoryToggle(cat._id)}
                        className="rounded text-orange-500 focus:ring-orange-500"
                      />
                      <span className="text-gray-700 truncate" title={cat.name}>{cat.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-gray-500 mt-1.5">When categories are selected, this brand will only appear when adding products to those specific categories.</p>
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
