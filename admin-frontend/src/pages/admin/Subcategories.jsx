import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Eye, EyeOff, X, Tag } from 'lucide-react';

const AdminSubcategories = ({ categories = [] }) => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [childCategory, setChildCategory] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');

  const token = localStorage.getItem('adminToken');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchSubcategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/subcategories?all=true', authHeader);
      setSubcategories(res.data || []);
    } catch (error) {
      console.error('Failed to fetch subcategories', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const handleOpenModal = (sub = null) => {
    setSelectedSub(sub);
    if (sub) {
      setName(sub.name);
      setSlug(sub.slug);
      setCategoryId(sub.category?._id || '');
      setChildCategory(sub.childCategory || '');
      setDisplayOrder(sub.displayOrder || 1);
    } else {
      setName('');
      setSlug('');
      setCategoryId(categories.length > 0 ? categories[0]._id : '');
      setChildCategory('');
      setDisplayOrder(subcategories.length > 0 ? Math.max(...subcategories.map(s => s.displayOrder || 0)) + 1 : 1);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      alert('Please select a parent category.');
      return;
    }
    try {
      const payload = {
        name,
        slug,
        category: categoryId,
        childCategory,
        displayOrder: Number(displayOrder)
      };

      if (selectedSub) {
        await axios.put(`/api/admin/subcategories/${selectedSub._id}`, payload, authHeader);
      } else {
        await axios.post('/api/admin/subcategories', payload, authHeader);
      }
      setIsModalOpen(false);
      fetchSubcategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving subcategory');
    }
  };

  const handleToggleActive = async (sub) => {
    if (!window.confirm(`Are you sure you want to ${sub.isActive ? 'disable' : 'enable'} this subcategory?`)) return;

    try {
      await axios.patch(`/api/admin/subcategories/${sub._id}/toggle`, {}, authHeader);
      fetchSubcategories();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to toggle status');
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-900">Subcategories ({subcategories.length})</h3>
        <button onClick={() => handleOpenModal()} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          <Plus size={16} /> Add Subcategory
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Subcategory</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Parent Category</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading subcategories...</td></tr>
            ) : subcategories.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No subcategories found</td></tr>
            ) : subcategories.map(sub => (
              <tr key={sub._id} className={`hover:bg-gray-50 transition-colors ${!sub.isActive ? 'opacity-60 bg-gray-50/50' : ''}`}>
                <td className="p-4 font-mono text-sm text-gray-600">{sub.displayOrder}</td>
                <td className="p-4">
                  <p className="font-semibold text-gray-900 text-sm">{sub.name}</p>
                  <p className="text-xs text-gray-500">/{sub.slug}</p>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    <Tag size={10} /> {sub.category?.name || 'Unknown'} {sub.childCategory ? `> ${sub.childCategory}` : ''}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${sub.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {sub.isActive ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleOpenModal(sub)} className="text-gray-400 hover:text-blue-500 mr-3 transition-colors" title="Edit"><Edit size={18} /></button>
                  <button 
                    onClick={() => handleToggleActive(sub)} 
                    className={`transition-colors ${sub.isActive ? 'text-gray-400 hover:text-theme-primary' : 'text-green-500 hover:text-green-600'}`} 
                    title={sub.isActive ? 'Disable' : 'Enable'}
                  >
                    {sub.isActive ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{selectedSub ? 'Edit Subcategory' : 'Add New Subcategory'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => {
                      setName(e.target.value);
                      if (!selectedSub) {
                        setSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
                      }
                    }} 
                    required 
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-focus" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input 
                    type="text" 
                    value={slug} 
                    onChange={e => setSlug(e.target.value)} 
                    disabled={!!selectedSub} 
                    className={`w-full px-3 py-2 border border-gray-200 rounded-lg ${selectedSub ? 'bg-gray-100 text-gray-500' : 'focus:ring-2 focus:ring-theme-focus'}`} 
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select 
                  value={categoryId} 
                  onChange={e => setCategoryId(e.target.value)} 
                  required 
                  disabled={!!selectedSub}
                  className={`w-full px-3 py-2 border border-gray-200 rounded-lg ${selectedSub ? 'bg-gray-100 text-gray-500' : 'focus:ring-2 focus:ring-theme-focus'}`}
                >
                  <option value="" disabled>Select a Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {(() => {
                const selectedCat = categories.find(c => c._id === categoryId);
                if (selectedCat && selectedCat.subCategories && selectedCat.subCategories.length > 0) {
                  return (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Child Category <span className="text-red-400">*</span></label>
                      <select 
                        value={childCategory} 
                        onChange={e => setChildCategory(e.target.value)} 
                        required 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-focus"
                      >
                        <option value="" disabled>Select a Child Category</option>
                        {selectedCat.subCategories.map(sub => {
                          const subName = typeof sub === 'string' ? sub : sub.name;
                          return <option key={`child-${subName}`} value={subName}>{subName}</option>;
                        })}
                      </select>
                    </div>
                  );
                }
                return null;
              })()}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input type="number" value={displayOrder} onChange={e => setDisplayOrder(e.target.value)} required min="1" className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-focus" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="btn-primary py-2 px-4 text-sm">{selectedSub ? 'Save Changes' : 'Create Subcategory'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubcategories;
