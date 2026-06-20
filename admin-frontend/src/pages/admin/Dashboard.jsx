import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Package, ShoppingBag, IndianRupee, Plus, Edit, Trash2, LogOut,
  ArrowUpRight, Search, X, ChevronDown, Tag, Eye, EyeOff, AlertTriangle,
  BarChart3, Filter, Menu, ChevronRight, ChevronLeft, Settings
} from 'lucide-react';
import ProductModal from './ProductModal';
import AdminSettings from './AdminSettings';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const token = localStorage.getItem('adminToken');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchProducts = async () => {
    try {
      const res = await axios.get('/api/admin/products', authHeader);
      setProducts(res.data.products || []);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await axios.get('/api/orders', authHeader);
      setOrders(res.data || []);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data || []);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  useEffect(() => {
    if (!token) { navigate('/admin/login'); return; }
    fetchProducts();
    fetchOrders();
    fetchCategories();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    navigate('/admin/login');
  };

  const handleAddProduct = () => { setSelectedProduct(null); setIsModalOpen(true); };
  const handleEditProduct = (product) => { setSelectedProduct(product); setIsModalOpen(true); };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`/api/admin/products/${id}`, authHeader);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting product');
    }
  };

  const handleSaveProduct = async (formData) => {
    if (selectedProduct) {
      await axios.put(`/api/admin/products/${selectedProduct._id}`, formData, authHeader);
    } else {
      await axios.post('/api/admin/products', formData, authHeader);
    }
    fetchProducts();
  };

  const handleToggleVisibility = async (id) => {
    try {
      await axios.patch(`/api/admin/products/${id}/visibility`, {}, authHeader);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to toggle visibility');
    }
  };

  const handleQuickStockUpdate = async (id, newStock) => {
    try {
      await axios.patch(`/api/admin/products/${id}/stock`, { countInStock: Number(newStock) }, authHeader);
      fetchProducts();
    } catch (error) {
      alert('Failed to update stock');
    }
  };

  const handleOpenStatusModal = (order, newStatus) => {
    if (order.status === newStatus) return;
    setOrderToUpdate({ ...order, newStatus });
    setStatusMessage(order.adminMessage || '');
  };

  const submitOrderStatus = async () => {
    if (!orderToUpdate) return;
    try {
      await axios.put(`/api/orders/${orderToUpdate._id}/status`, { 
        status: orderToUpdate.newStatus, 
        adminMessage: statusMessage 
      }, authHeader);
      fetchOrders();
      setOrderToUpdate(null);
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  // --- Filtering ---
  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.brand?.name || '').toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.modelNumber || '').toLowerCase().includes(productSearch.toLowerCase());
    const matchCategory = !categoryFilter || (p.category?._id === categoryFilter || p.category?.slug === categoryFilter);
    return matchSearch && matchCategory;
  });

  const totalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalPrice, 0);

  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const hiddenCount = products.filter(p => !p.isVisible).length;

  const sidebarItems = [
    { key: 'products', label: 'Products', icon: Package },
    { key: 'orders', label: 'Orders', icon: ShoppingBag },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <div className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out bg-white border-r border-gray-200 shadow-sm flex-col hidden md:flex shrink-0`}>
        <div className="h-20 flex items-center justify-center border-b border-gray-100 gap-2 overflow-hidden px-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shadow-sm shrink-0">
            <img src="https://scontent.fstv8-3.fna.fbcdn.net/v/t39.30808-6/300021862_402490028652945_4472372223676585025_n.png?stp=dst-png&cstp=mx1988x1988&ctp=s1988x1988&_nc_cat=104&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=a27DF4JTHrkQ7kNvwGa_95R&_nc_oc=AdpCpnZHRWUOA8J7g3cIN0eD0qnWflCUg2iCAfvHIJGMpIGO4zAdMFJhKHxRXoFWVcdYxjNQdziCGF8Xo4f1QDFG&_nc_zt=23&_nc_ht=scontent.fstv8-3.fna&_nc_gid=OgBEbQELv3IGsxePTgMJ9Q&_nc_ss=7b289&oh=00_Af8ktO_MTN191pgTqic1Z6LL--6lBrJkGujJa2OFNoJuZQ&oe=6A2F99E0" alt="Logo" className="w-full h-full object-cover" />
          </div>
          {!isSidebarCollapsed && <span className="font-bold text-xl text-[var(--color-secondary)] whitespace-nowrap">Satguru<span className="text-[var(--color-primary)]">Admin</span></span>}
        </div>
        <div className="flex-1 py-6 px-3 space-y-2 overflow-y-auto overflow-x-hidden">
          {sidebarItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              title={isSidebarCollapsed ? label : ''}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'px-4'} py-3 font-medium rounded-lg transition-colors ${
                activeTab === key
                  ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={22} className="shrink-0" />
              {!isSidebarCollapsed && <span className="ml-3">{label}</span>}
              {!isSidebarCollapsed && key === 'orders' && pendingOrders > 0 && (
                <span className="ml-auto bg-orange-500 text-white text-xs font-bold rounded-full px-2 py-0.5">{pendingOrders}</span>
              )}
              {isSidebarCollapsed && key === 'orders' && pendingOrders > 0 && (
                <span className="absolute ml-8 mb-4 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{pendingOrders}</span>
              )}
            </button>
          ))}
        </div>
        <div className="p-3 border-t border-gray-100 flex flex-col gap-2">
          <button onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} title="Toggle Sidebar" className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start px-4'} py-2.5 text-gray-500 hover:bg-gray-50 font-medium rounded-lg transition-colors`}>
            {isSidebarCollapsed ? <ChevronRight size={20} className="shrink-0" /> : <><ChevronLeft size={20} className="shrink-0" /> <span className="ml-3">Collapse</span></>}
          </button>
          <button onClick={handleLogout} title="Logout" className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-start px-4'} py-2.5 text-red-500 hover:bg-red-50 font-medium rounded-lg transition-colors`}>
            <LogOut size={20} className="shrink-0" /> {!isSidebarCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {activeTab === 'products' ? 'Product Management' : activeTab === 'orders' ? 'Order Management' : 'Store Settings'}
          </h2>
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-[var(--color-primary)] font-bold">A</div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg"><Package size={22} /></div>
                <span className="flex items-center text-sm font-medium text-green-600"><ArrowUpRight size={16} /> Live</span>
              </div>
              <h3 className="text-gray-500 text-xs font-medium tracking-wide uppercase">Total Products</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '...' : products.length}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 bg-orange-50 text-orange-500 rounded-lg"><ShoppingBag size={22} /></div>
                {pendingOrders > 0 && <span className="text-xs bg-yellow-100 text-yellow-700 font-semibold px-2 py-1 rounded-full">{pendingOrders} Pending</span>}
              </div>
              <h3 className="text-gray-500 text-xs font-medium tracking-wide uppercase">Total Orders</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{ordersLoading ? '...' : orders.length}</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2.5 bg-green-50 text-green-600 rounded-lg"><IndianRupee size={22} /></div>
              </div>
              <h3 className="text-gray-500 text-xs font-medium tracking-wide uppercase">Total Revenue</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-200 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900">Inventory ({filteredProducts.length})</h3>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Search */}
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text" placeholder="Search..."
                      value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-8 pr-7 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 w-44"
                    />
                    {productSearch && <button onClick={() => setProductSearch('')} className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"><X size={12} /></button>}
                  </div>
                  {/* Category Filter */}
                  <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="py-2 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200">
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  {/* Add Button */}
                  <button onClick={handleAddProduct} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                    <Plus size={16} /> Add Product
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Visible</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading inventory...</td></tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr><td colSpan="5" className="p-8 text-center text-gray-500">No products found</td></tr>
                    ) : filteredProducts.map(product => (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.mainImage || product.images?.[0] || 'https://placehold.co/40x40?text=NA'}
                              alt="" referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-md border border-gray-200 p-0.5 object-contain bg-white shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-sm truncate max-w-[200px]">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.brand?.name} {product.modelNumber && `• ${product.modelNumber}`}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-gray-900">₹{(product.sellingPrice || product.price || 0).toLocaleString()}</p>
                          {product.mrp > (product.sellingPrice || product.price) && (
                            <p className="text-xs text-gray-400 line-through">₹{product.mrp.toLocaleString()}</p>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                            <Tag size={10} /> {product.category?.name || '-'}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleVisibility(product._id)}
                            className={`p-1.5 rounded-lg transition-colors ${product.isVisible !== false ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}
                            title={product.isVisible !== false ? 'Visible (click to hide)' : 'Hidden (click to show)'}
                          >
                            {product.isVisible !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleEditProduct(product)} className="text-gray-400 hover:text-blue-500 mr-3 transition-colors" title="Edit"><Edit size={18} /></button>
                          <button onClick={() => handleDeleteProduct(product._id)} className="text-gray-400 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900">All Orders</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {ordersLoading ? (
                      <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading orders...</td></tr>
                    ) : orders.length === 0 ? (
                      <tr><td colSpan="6" className="p-8 text-center text-gray-500">No orders yet</td></tr>
                    ) : orders.map(order => (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            #{order._id.slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-gray-900 text-sm">{order.name}</p>
                          <p className="text-xs text-gray-500">{order.phone}</p>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {order.orderItems.length} item{order.orderItems.length !== 1 ? 's' : ''}
                        </td>
                        <td className="p-4 font-semibold text-gray-900">₹{order.totalPrice.toLocaleString()}</td>
                        <td className="p-4 text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-4">
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) => handleOpenStatusModal(order, e.target.value)}
                              className={`text-xs font-semibold rounded-full px-3 py-1.5 border-0 cursor-pointer outline-none appearance-none pr-6 ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}
                            >
                              {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <ChevronDown size={12} className="absolute right-1.5 top-2 pointer-events-none text-current opacity-70" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <AdminSettings />
          )}

        </main>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        product={selectedProduct}
      />

      {/* Order Status Modal */}
      {orderToUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Update Order Status</h3>
              <button onClick={() => setOrderToUpdate(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${statusColors[orderToUpdate.newStatus] || 'bg-gray-100 text-gray-700'}`}>
                  {orderToUpdate.newStatus}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message to Customer (Optional)</label>
                <textarea
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  placeholder="e.g. We have confirmed your order and will ship it tomorrow!"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none h-24 text-sm"
                />
              </div>
            </div>
            <div className="p-5 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button onClick={() => setOrderToUpdate(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={submitOrderStatus} className="btn-primary py-2 px-4 text-sm">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
