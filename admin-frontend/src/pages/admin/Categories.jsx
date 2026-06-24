import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Eye, EyeOff, AlertTriangle, X } from 'lucide-react';

const AdminCategories = ({ products = [] }) => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');

  const token = localStorage.getItem('adminToken');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/categories?all=true');
      setCategories(res.data || []);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await axios.get('/api/brands');
      setBrands(res.data || []);
    } catch (error) {
      console.error('Failed to fetch brands', error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const handleOpenModal = (category = null) => {
    setSelectedCategory(category);
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDisplayOrder(category.displayOrder);
    } else {
      setName('');
      setSlug('');
      setDisplayOrder(categories.length > 0 ? categories[categories.length - 1].displayOrder + 1 : 1);
    }
    setIsModalOpen(true);
  };



  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name,
        slug,
        displayOrder: Number(displayOrder)
      };

      if (selectedCategory) {
        await axios.put(`/api/admin/categories/${selectedCategory._id}`, payload, authHeader);
      } else {
        await axios.post('/api/admin/categories', payload, authHeader);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving category');
    }
  };

  const handleToggleActive = async (category) => {
    if (category.isActive) {
      const productsCount = products.filter(p => p.category?._id === category._id).length;
      // Brands can have categories as objects or strings depending on population, check both
      const brandsCount = brands.filter(b => b.categories?.some(c => c === category._id || c._id === category._id)).length;
      
      const confirmMessage = `Category: ${category.name}\n\nProducts: ${productsCount}\nBrands: ${brandsCount}\n\nAre you sure you want to disable this category?`;
      
      if (!window.confirm(confirmMessage)) return;
    } else {
      if (!window.confirm('Enable this category? It will be visible on the customer frontend again.')) return;
    }

    try {
      await axios.patch(`/api/admin/categories/${category._id}/toggle`, {}, authHeader);
      fetchCategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to toggle category status');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-900">Categories ({categories.length})</h3>
        <button onClick={() => handleOpenModal()} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          <Plus size={16} /> Add Category
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Products</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading categories...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No categories found</td></tr>
            ) : categories.map(cat => {
              const productCount = products.filter(p => p.category?._id === cat._id).length;
              return (
                <tr key={cat._id} className={`hover:bg-gray-50 transition-colors ${!cat.isActive ? 'opacity-60 bg-gray-50/50' : ''}`}>
                  <td className="p-4 font-mono text-sm text-gray-600">{cat.displayOrder}</td>
                  <td className="p-4">
                    <p className="font-semibold text-gray-900 text-sm">{cat.name}</p>
                    <p className="text-xs text-gray-500">/{cat.slug}</p>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-700">{productCount}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {cat.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleOpenModal(cat)} className="text-gray-400 hover:text-blue-500 mr-3 transition-colors" title="Edit"><Edit size={18} /></button>
                    <button 
                      onClick={() => handleToggleActive(cat)} 
                      className={`transition-colors ${cat.isActive ? 'text-gray-400 hover:text-theme-primary' : 'text-green-500 hover:text-green-600'}`} 
                      title={cat.isActive ? 'Disable Category' : 'Enable Category'}
                    >
                      {cat.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
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
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{selectedCategory ? 'Edit Category' : 'Add New Category'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Note: iconKey is explicitly hidden from the UI as per safeguards */}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-focus" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required disabled={!!selectedCategory} className={`w-full px-3 py-2 border border-gray-200 rounded-lg ${selectedCategory ? 'bg-gray-100 text-gray-500' : 'focus:ring-2 focus:ring-theme-focus'}`} />
                  {selectedCategory && <p className="text-[10px] text-gray-500 mt-1">Slug cannot be changed to prevent broken links.</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} required min="1" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-focus" />
                <p className="text-[10px] text-gray-500 mt-1">If this number is already taken, existing categories will automatically shift down.</p>
              </div>


              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="btn-primary py-2 px-4 text-sm">{selectedCategory ? 'Save Changes' : 'Create Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
