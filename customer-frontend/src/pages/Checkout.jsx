import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, User, Phone, CreditCard, CheckCircle, QrCode, Plus, Edit, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

// Simple UUID generator for idempotency
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const Checkout = () => {
  const { cart, cartTotal, dispatch } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Settings & Configuration
  const [settings, setSettings] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Flow State
  const [idempotencyKey] = useState(generateUUID());
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Address, 2: Payment & Review

  // Addresses
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('guest_addresses')) || [];
    } catch {
      return [];
    }
  });
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(savedAddresses.length > 0 ? 0 : -1);
  const [showAddressForm, setShowAddressForm] = useState(savedAddresses.length === 0);
  const [addressForm, setAddressForm] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '' });

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('');
  const [advancePaid, setAdvancePaid] = useState(false);
  const [upiTransactionId, setUpiTransactionId] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const res = await axios.get('/api/settings');
        setSettings(res.data);
        const pms = res.data.paymentMethods || [];
        const enabledPms = pms.filter(p => p.enabled);
        if (enabledPms.length > 0) {
          setPaymentMethod(enabledPms[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingConfig(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    sessionStorage.setItem('guest_addresses', JSON.stringify(savedAddresses));
  }, [savedAddresses]);

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  if (loadingConfig) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-4 border-theme-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  // Frontend Calculations (for display only - backend is single source of truth)
  const discount = 0; // Stub for coupons
  let shipping = 0;
  if (settings?.shippingEnabled) {
    shipping = cartTotal >= (settings.freeShippingThreshold || 999) ? 0 : (settings.shippingCharge || 60);
  }
  let tax = 0; // GST removed as per request
  const grandTotal = cartTotal + shipping + tax - discount;

  // Advance Calculation
  let advanceRequired = 0;
  let isAdvanceApplicable = false;
  if (settings?.advancePaymentEnabled && settings?.applicableAdvanceMethods?.includes(paymentMethod)) {
    isAdvanceApplicable = true;
    advanceRequired = (cartTotal * (settings.advancePaymentPercentage || 0)) / 100;
  }

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setSavedAddresses([...savedAddresses, addressForm]);
    setSelectedAddressIndex(savedAddresses.length);
    setShowAddressForm(false);
    setAddressForm({ name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '' });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (selectedAddressIndex === -1 || !savedAddresses[selectedAddressIndex]) {
      addToast('Please select a delivery address', 'error');
      return;
    }
    if (!paymentMethod) {
      addToast('Please select a payment method', 'error');
      return;
    }

    setLoading(true);
    try {
      const selectedAddr = savedAddresses[selectedAddressIndex];
      const orderItems = cart.map(item => ({
        product: item._id,
        name: item.name,
        qty: item.qty,
      }));

      const res = await axios.post('/api/orders', {
        name: selectedAddr.name,
        email: selectedAddr.email,
        phone: selectedAddr.phone,
        shippingAddress: {
          address: selectedAddr.address,
          city: selectedAddr.city,
          state: selectedAddr.state,
          pincode: selectedAddr.pincode,
        },
        orderItems,
        paymentMethod,
        advancePaid: isAdvanceApplicable ? advancePaid : false,
        upiTransactionId: isAdvanceApplicable || paymentMethod === 'upi' ? upiTransactionId : '',
        idempotencyKey,
      });

      dispatch({ type: 'CLEAR_CART' });
      addToast('Order placed successfully!', 'success');
      setTimeout(() => {
        navigate(`/order/${res.data._id}`);
      }, 1500);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to place order. Try again.', 'error');
      setLoading(false); // only reset loading on failure, success will redirect
    }
  };

  const inputCls = "w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-theme-focus text-sm outline-none";

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft size={18} /> Back to Cart
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Flow */}
          <div className="flex-1 space-y-6">
            
            {/* Step 1: Address */}
            <div className={`bg-white rounded-xl border ${step === 1 ? 'border-theme-primary shadow-md' : 'border-gray-200 shadow-sm'} p-6 transition-all`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step === 1 ? 'bg-theme-primary text-white' : 'bg-gray-200 text-gray-700'}`}>1</span>
                  <h2 className="text-lg font-bold text-gray-900">Delivery Address</h2>
                </div>
                {step === 2 && (
                  <button onClick={() => setStep(1)} className="text-sm font-medium text-theme-primary hover:underline">Change</button>
                )}
              </div>

              {step === 1 && (
                <div>
                  {!showAddressForm && savedAddresses.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {savedAddresses.map((addr, idx) => (
                        <label key={idx} className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${selectedAddressIndex === idx ? 'border-theme-primary bg-theme-light/30' : 'border-gray-200 hover:border-gray-300'}`}>
                          <input type="radio" name="address" checked={selectedAddressIndex === idx} onChange={() => setSelectedAddressIndex(idx)} className="mt-1 accent-theme-primary" />
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">{addr.name} <span className="font-normal text-gray-500">- {addr.phone}</span></p>
                            <p className="text-sm text-gray-600 mt-1">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                          </div>
                        </label>
                      ))}
                      <button onClick={() => setShowAddressForm(true)} className="flex items-center gap-2 text-sm font-medium text-theme-primary py-2 px-4 border border-theme-primary/30 rounded-lg bg-theme-light/10 hover:bg-theme-light/30 transition-colors">
                        <Plus size={16} /> Add New Address
                      </button>
                    </div>
                  )}

                  {showAddressForm && (
                    <form onSubmit={handleAddressSubmit} className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name *</label>
                          <input required value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
                          <input type="email" required value={addressForm.email} onChange={e => setAddressForm({...addressForm, email: e.target.value})} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Phone *</label>
                          <input required value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} maxLength={10} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode *</label>
                          <input required value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} maxLength={6} className={inputCls} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-gray-700 mb-1">Address (House No, Street, Area) *</label>
                          <input required value={addressForm.address} onChange={e => setAddressForm({...addressForm, address: e.target.value})} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">City *</label>
                          <input required value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className={inputCls} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">State *</label>
                          <input required value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className={inputCls} />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        {savedAddresses.length > 0 && (
                          <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        )}
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-theme-primary rounded-lg hover:bg-theme-hover shadow-sm">Save Address</button>
                      </div>
                    </form>
                  )}

                  {!showAddressForm && savedAddresses.length > 0 && (
                    <button onClick={() => setStep(2)} className="mt-4 btn-primary px-8 py-2.5 rounded-lg font-semibold w-full sm:w-auto">Deliver Here</button>
                  )}
                </div>
              )}
            </div>

            {/* Step 2: Payment */}
            <div className={`bg-white rounded-xl border ${step === 2 ? 'border-theme-primary shadow-md' : 'border-gray-200 shadow-sm opacity-60'} p-6 transition-all`}>
              <div className="flex items-center gap-2 mb-4">
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step === 2 ? 'bg-theme-primary text-white' : 'bg-gray-200 text-gray-700'}`}>2</span>
                <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
              </div>
              
              {step === 2 && (
                <div className="space-y-4">
                  {(settings?.paymentMethods || []).filter(p => p.enabled).map(pm => (
                    <label key={pm.id} className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === pm.id ? 'border-theme-primary bg-theme-light/20' : 'border-gray-200 hover:border-theme-light'}`}>
                      <input type="radio" name="paymentMethod" value={pm.id} checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} className="mt-1 accent-theme-primary" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 uppercase">{pm.id}</p>
                        
                        {/* Dynamic Advance UI */}
                        {paymentMethod === pm.id && isAdvanceApplicable && (
                          <div className="mt-4 p-4 bg-white rounded-lg border border-theme-light shadow-sm">
                            <h4 className="font-semibold text-theme-dark mb-2">⚠️ Advance Payment Required</h4>
                            <p className="text-sm text-gray-600 mb-4">
                              Please pay a <strong>{settings.advancePaymentPercentage}% advance (₹{advanceRequired.toLocaleString()})</strong> to confirm your order.
                            </p>
                            {settings?.upiId && (
                              <div className="flex flex-col items-center gap-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                                {settings.upiQrImage ? (
                                  <img src={settings.upiQrImage} alt="Payment QR" className="w-32 h-32 object-contain" />
                                ) : (
                                  <QrCode size={40} className="text-gray-400" />
                                )}
                                <p className="text-sm font-medium text-gray-900 text-center w-full">UPI ID / Bank Details:<br/> <span className="font-bold whitespace-pre-wrap">{settings.upiId}</span></p>
                              </div>
                            )}
                            <div className="space-y-3">
                              <input type="text" required placeholder="Enter UPI Transaction ID" value={upiTransactionId} onChange={(e) => setUpiTransactionId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded text-sm outline-none focus:border-theme-primary" />
                              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                                <input type="checkbox" required checked={advancePaid} onChange={(e) => setAdvancePaid(e.target.checked)} className="accent-theme-primary w-4 h-4" />
                                I have paid the advance amount
                              </label>
                            </div>
                          </div>
                        )}
                        
                        {/* Normal UPI without advance but full amount */}
                        {paymentMethod === pm.id && pm.id === 'upi' && !isAdvanceApplicable && (
                          <div className="mt-4 p-4 bg-white rounded-lg border border-theme-light shadow-sm">
                            <div className="flex flex-col items-center gap-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                              {settings?.upiQrImage ? (
                                <img src={settings.upiQrImage} alt="Payment QR" className="w-32 h-32 object-contain" />
                              ) : (
                                <QrCode size={40} className="text-gray-400" />
                              )}
                              <p className="text-sm font-medium text-gray-900 text-center w-full">UPI ID / Bank Details:<br/> <span className="font-bold whitespace-pre-wrap">{settings?.upiId}</span></p>
                              <p className="text-sm text-gray-500 mt-2">Amount to pay: <strong>₹{grandTotal.toLocaleString()}</strong></p>
                            </div>
                            <input type="text" required placeholder="Enter UPI Transaction ID" value={upiTransactionId} onChange={(e) => setUpiTransactionId(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded text-sm outline-none focus:border-theme-primary" />
                          </div>
                        )}

                      </div>
                    </label>
                  ))}
                  {(!settings?.paymentMethods || settings.paymentMethods.filter(p=>p.enabled).length === 0) && (
                    <div className="text-sm text-red-500 font-medium">No payment methods are currently available.</div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* Sidebar / Order Summary */}
          <div className="lg:w-80">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>
              
              <div className="space-y-4 mb-5 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map(item => (
                  <div key={item._id} className="flex gap-3">
                    <img src={item.images?.[0]} alt={item.name} className="w-14 h-14 object-contain rounded border border-gray-100 p-1 shrink-0 bg-gray-50" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight mb-1">{item.name}</p>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Qty: {item.qty}</span>
                        <span className="font-semibold text-gray-900">₹{(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-5">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-800">₹{cartTotal.toLocaleString()}</span>
                </div>

                {settings?.shippingEnabled && (
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-3 border-t border-gray-100 mt-2">
                  <span>Total Payable</span>
                  <span>₹{grandTotal.toLocaleString()}</span>
                </div>
                {isAdvanceApplicable && (
                  <div className="flex justify-between text-theme-primary font-semibold text-sm pt-2 bg-theme-light/30 p-2 rounded mt-2">
                    <span>Advance Required</span>
                    <span>₹{advanceRequired.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || step !== 2}
                className="w-full btn-primary py-3.5 rounded-lg flex items-center justify-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-theme-primary/20 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                {loading ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</span>
                ) : (
                  <span className="flex items-center gap-2"><CheckCircle size={18} /> Place Order</span>
                )}
              </button>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[11px] text-center text-gray-400 leading-relaxed">
                  By placing this order, you agree to our Terms & Conditions. All transactions are securely processed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
