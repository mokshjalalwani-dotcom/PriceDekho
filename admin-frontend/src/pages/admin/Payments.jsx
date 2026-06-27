import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, XCircle, Search, Eye } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { addToast } = useToast();

  const token = localStorage.getItem('adminToken');
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchPayments = async (page = 1) => {
    try {
      const res = await axios.get(`/api/payments/admin?pageNumber=${page}`, authHeader);
      setPayments(res.data.payments || []);
      setCurrentPage(res.data.page || 1);
      setTotalPages(res.data.pages || 1);
    } catch (err) {
      addToast('Failed to fetch payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPayments(currentPage); }, [currentPage]);

  const handleAction = async (paymentId, action) => {
    try {
      await axios.patch(`/api/payments/admin/${paymentId}/verify`, { action, notes: actionNotes }, authHeader);
      addToast(`Payment ${action} successfully`, 'success');
      setSelectedPayment(null);
      setActionNotes('');
      fetchPayments();
    } catch (err) {
      addToast(err.response?.data?.message || 'Action failed', 'error');
    }
  };
  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment record? This action cannot be undone.')) return;
    try {
      await axios.delete(`/api/payments/admin/${paymentId}`, authHeader);
      addToast('Payment record deleted successfully', 'success');
      fetchPayments();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete payment', 'error');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'CREATED': return 'bg-gray-100 text-gray-800';
      case 'PENDING_USER': return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_VERIFICATION': return 'bg-blue-100 text-blue-800';
      case 'VERIFIED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'EXPIRED': return 'bg-gray-200 text-gray-600';
      case 'CANCELLED': return 'bg-red-50 text-red-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Payment Verifications</h1>
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map(payment => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{new Date(payment.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{payment.customerName || '-'}</div>
                    <div className="text-xs text-gray-500">{payment.customerPhone || ''}</div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{payment.reference}</td>
                  <td className="px-6 py-4 font-bold">₹{payment.amount}</td>
                  <td className="px-6 py-4 font-mono">{payment.transactionId || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setSelectedPayment(payment)} className="text-theme-primary hover:underline flex items-center gap-1">
                        <Eye size={16} /> View
                      </button>
                      <button onClick={() => handleDeletePayment(payment._id)} className="text-red-500 hover:text-red-700 flex items-center gap-1" title="Delete Record">
                        <XCircle size={16} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-gray-500">Page {currentPage} of {totalPages}</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-200 rounded text-gray-600 disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-200 rounded text-gray-600 disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">Verify Payment</h2>
              <button onClick={() => setSelectedPayment(null)} className="text-gray-400 hover:text-gray-600"><XCircle /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div><p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{selectedPayment.customerName || 'N/A'}</p>
                  <p className="text-xs text-gray-500">{selectedPayment.customerPhone}</p>
                </div>
                <div><p className="text-sm text-gray-500">Reference</p><p className="font-mono font-medium">{selectedPayment.reference}</p></div>
                <div><p className="text-sm text-gray-500">Amount to Verify</p><p className="text-lg font-bold text-theme-primary">₹{selectedPayment.amount}</p></div>
                <div><p className="text-sm text-gray-500">Customer UTR</p><p className="font-mono font-bold">{selectedPayment.transactionId || 'Not submitted'}</p></div>
                <div><p className="text-sm text-gray-500">Status</p><p className="font-medium">{selectedPayment.status}</p></div>
              </div>
              
              {selectedPayment.status === 'UNDER_VERIFICATION' && (
                <div className="space-y-4 mt-6">
                  <textarea 
                    placeholder="Notes (optional)" 
                    value={actionNotes} 
                    onChange={(e) => setActionNotes(e.target.value)}
                    className="w-full border border-gray-300 rounded p-3"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleAction(selectedPayment._id, 'Approve')} className="bg-green-500 text-white font-bold py-3 rounded hover:bg-green-600">Approve Payment</button>
                    <button onClick={() => handleAction(selectedPayment._id, 'Reject')} className="bg-red-500 text-white font-bold py-3 rounded hover:bg-red-600">Reject</button>
                    <button onClick={() => handleAction(selectedPayment._id, 'Refund Required')} className="bg-yellow-500 text-white font-bold py-3 rounded hover:bg-yellow-600">Refund Required</button>
                    <button onClick={() => handleAction(selectedPayment._id, 'Duplicate Payment')} className="bg-gray-500 text-white font-bold py-3 rounded hover:bg-gray-600">Duplicate Payment</button>
                    <button onClick={() => handleAction(selectedPayment._id, 'Wrong Amount')} className="bg-orange-500 text-white font-bold py-3 rounded hover:bg-orange-600">Wrong Amount</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
