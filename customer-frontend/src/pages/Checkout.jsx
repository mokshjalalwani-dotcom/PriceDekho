import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, CheckCircle, QrCode } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const generateUUID = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8); return v.toString(16); });

const Checkout = () => {
  const { cart, cartTotal, dispatch } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [settings, setSettings] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  const [idempotencyKey] = useState(generateUUID());
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [savedAddresses, setSavedAddresses] = useState(() => JSON.parse(sessionStorage.getItem('guest_addresses')) || []);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(savedAddresses.length > 0 ? 0 : -1);
  const [showAddressForm, setShowAddressForm] = useState(savedAddresses.length === 0);
  const [addressForm, setAddressForm] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '' });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [paymentSession, setPaymentSession] = useState(null);
  const [generatingSession, setGeneratingSession] = useState(false);
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [advancePaid, setAdvancePaid] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await axios.get('/api/settings');
        setSettings(res.data);
        if (res.data.isCodEnabled) setPaymentMethod('cod');
        else if (res.data.isUpiEnabled) setPaymentMethod('upi');
      } catch (err) {} finally { setLoadingConfig(false); }
    };
    init();
  }, []);

  useEffect(() => { sessionStorage.setItem('guest_addresses', JSON.stringify(savedAddresses)); }, [savedAddresses]);

  if (cart.length === 0) { navigate('/cart'); return null; }
  if (loadingConfig) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-theme-primary border-t-transparent rounded-full"></div></div>;

  const shipping = settings?.shippingEnabled ? (cartTotal >= (settings.freeShippingThreshold || 999) ? 0 : (settings.shippingCharge || 60)) : 0;
  const grandTotal = cartTotal + shipping;
  const isAdvanceApplicable = settings?.advancePaymentEnabled && settings?.applicableAdvanceMethods?.includes(paymentMethod);
  const advanceRequired = isAdvanceApplicable ? (cartTotal * (settings.advancePaymentPercentage || 0)) / 100 : 0;

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setSavedAddresses([...savedAddresses, addressForm]);
    setSelectedAddressIndex(savedAddresses.length);
    setShowAddressForm(false);
    setAddressForm({ name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '' });
  };

  const generatePaymentSession = async () => {
    if (selectedAddressIndex < 0) return addToast('Please select an address first', 'error');
    setGeneratingSession(true);
    try {
      const address = savedAddresses[selectedAddressIndex];
      const orderItems = cart.map(item => ({ product: item._id, qty: item.qty, name: item.name }));
      const res = await axios.post('/api/payments/session', { 
        orderItems, 
        paymentMethod,
        customerName: address.name,
        customerPhone: address.phone
      });
      setPaymentSession(res.data);
      setStep(3); // Payment Session step
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to generate payment session', 'error');
    } finally {
      setGeneratingSession(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (selectedAddressIndex < 0) return addToast('Please select an address', 'error');
    
    if (paymentMethod === 'upi' || isAdvanceApplicable) {
      if (!upiTransactionId) return addToast('Please enter the Transaction ID', 'error');
      if (upiTransactionId.length < 12) return addToast('Please enter a valid 12-digit UTR number', 'error');
    }

    setLoading(true);
    try {
      const address = savedAddresses[selectedAddressIndex];
      const orderData = {
        name: address.name, email: address.email, phone: address.phone,
        shippingAddress: { address: address.address, city: address.city, state: address.state, pincode: address.pincode, country: 'India' },
        orderItems: cart.map(item => ({ product: item._id, qty: item.qty, name: item.name })),
        paymentMethod,
        advancePaid,
        upiTransactionId,
        paymentSessionId: paymentSession?._id,
        idempotencyKey
      };

      const res = await axios.post('/api/orders', orderData);
      dispatch({ type: 'CLEAR_CART' });
      navigate(`/order/${res.data._id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/cart')} className="p-2 hover:bg-gray-200 rounded-full"><ArrowLeft size={24} /></button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                {savedAddresses.map((addr, idx) => (
                  <label key={idx} className={`block p-4 border rounded-xl mb-3 cursor-pointer ${selectedAddressIndex === idx ? 'border-theme-primary bg-theme-light/10 ring-1 ring-theme-primary' : 'border-gray-200'}`}>
                    <input type="radio" name="address" className="hidden" checked={selectedAddressIndex === idx} onChange={() => setSelectedAddressIndex(idx)} />
                    <div className="font-bold">{addr.name}</div>
                    <div className="text-sm text-gray-600">{addr.address}, {addr.city} - {addr.pincode}</div>
                  </label>
                ))}
                {!showAddressForm && <button onClick={() => setShowAddressForm(true)} className="text-theme-primary font-semibold text-sm">+ Add New Address</button>}
                {showAddressForm && (
                  <form onSubmit={handleAddressSubmit} className="space-y-4 mt-4">
                    <input required placeholder="Full Name" value={addressForm.name} onChange={e => setAddressForm({...addressForm, name: e.target.value})} className="w-full border p-3 rounded" />
                    <div className="flex gap-4">
                      <input required type="email" placeholder="Email" value={addressForm.email} onChange={e => setAddressForm({...addressForm, email: e.target.value})} className="w-1/2 border p-3 rounded" />
                      <input required placeholder="Phone" value={addressForm.phone} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} className="w-1/2 border p-3 rounded" />
                    </div>
                    <input required placeholder="Full Address" value={addressForm.address} onChange={e => setAddressForm({...addressForm, address: e.target.value})} className="w-full border p-3 rounded" />
                    <div className="flex gap-4">
                      <input required placeholder="City" value={addressForm.city} onChange={e => setAddressForm({...addressForm, city: e.target.value})} className="w-1/3 border p-3 rounded" />
                      <input required placeholder="State" value={addressForm.state} onChange={e => setAddressForm({...addressForm, state: e.target.value})} className="w-1/3 border p-3 rounded" />
                      <input required placeholder="Pincode" value={addressForm.pincode} onChange={e => setAddressForm({...addressForm, pincode: e.target.value})} className="w-1/3 border p-3 rounded" />
                    </div>
                    <button type="submit" className="btn-primary px-6 py-2 rounded">Save Address</button>
                  </form>
                )}
                <button onClick={() => setStep(2)} disabled={selectedAddressIndex < 0} className="w-full mt-6 btn-primary py-3 rounded-lg font-bold disabled:opacity-50">Continue to Payment</button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Select Payment Method</h2>
                <div className="space-y-3">
                  {settings.isCodEnabled && (
                    <label className={`block p-4 border rounded-xl cursor-pointer ${paymentMethod === 'cod' ? 'border-theme-primary bg-theme-light/10 ring-1 ring-theme-primary' : 'border-gray-200'}`}>
                      <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                      <div className="font-bold">Cash on Delivery (COD)</div>
                    </label>
                  )}
                  {settings.isUpiEnabled && (
                    <label className={`block p-4 border rounded-xl cursor-pointer ${paymentMethod === 'upi' ? 'border-theme-primary bg-theme-light/10 ring-1 ring-theme-primary' : 'border-gray-200'}`}>
                      <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                      <div className="font-bold">Pay via UPI App (GPay, PhonePe, Paytm)</div>
                    </label>
                  )}
                </div>
                <div className="flex gap-4 mt-6">
                  <button onClick={() => setStep(1)} className="flex-1 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50">Back</button>
                  {(paymentMethod === 'upi' || isAdvanceApplicable) ? (
                    <button onClick={generatePaymentSession} disabled={generatingSession} className="flex-1 btn-primary py-3 rounded-lg font-bold disabled:opacity-50">
                      {generatingSession ? 'Generating...' : 'Generate Payment Session'}
                    </button>
                  ) : (
                    <button onClick={handlePlaceOrder} disabled={loading} className="flex-1 btn-primary py-3 rounded-lg font-bold disabled:opacity-50">
                      {loading ? 'Processing...' : 'Place Order'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {step === 3 && paymentSession && (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete your Payment</h2>
                <p className="text-gray-600 mb-6">Scan the QR code or tap the button below to pay using any UPI app.</p>

                <div className="flex justify-center mb-6">
                  {paymentSession.qrCode ? (
                    <img src={paymentSession.qrCode} alt="Payment QR" className="w-64 h-64 object-contain p-4 border border-gray-200 rounded-xl bg-gray-50" />
                  ) : (
                    <QrCode size={120} className="text-gray-300" />
                  )}
                </div>

                <div className="mb-8">
                  <a href={paymentSession.upiUri} className="inline-block w-full max-w-sm btn-primary py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 mb-4">
                    Pay ₹{paymentSession.amount.toLocaleString()} via UPI App
                  </a>
                  
                  <div className="max-w-sm mx-auto bg-amber-50 border border-amber-200 rounded-lg p-4 text-left shadow-sm">
                    <p className="text-xs text-amber-800 font-semibold mb-2">If the button above fails in PhonePe for security reasons, please copy the UPI ID below and pay manually:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-white px-3 py-2 border border-amber-100 rounded font-mono text-sm text-gray-800 break-all select-all">{paymentSession.upiId}</code>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(paymentSession.upiId);
                          addToast('UPI ID copied to clipboard!', 'success');
                        }}
                        className="px-4 py-2 bg-theme-primary text-white text-sm font-bold rounded shadow hover:bg-theme-secondary transition-colors whitespace-nowrap"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mt-4">Payment Reference: <span className="font-mono font-medium text-gray-700">{paymentSession.reference}</span></p>
                </div>

                <div className="max-w-md mx-auto text-left bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Waiting for customer...</h3>
                  <p className="text-sm text-gray-600 mb-4">After completing the payment in your UPI app, enter the 12-digit UTR / Transaction ID below to verify your order.</p>
                  
                  <input 
                    type="text" 
                    required 
                    placeholder="Enter 12-digit UPI Transaction ID" 
                    value={upiTransactionId} 
                    onChange={(e) => setUpiTransactionId(e.target.value.toUpperCase())} 
                    maxLength={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-center tracking-widest outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20 mb-4" 
                  />
                  
                  <label className="flex items-center gap-3 cursor-pointer mb-6">
                    <input type="checkbox" required checked={advancePaid} onChange={(e) => setAdvancePaid(e.target.checked)} className="w-5 h-5 accent-theme-primary" />
                    <span className="text-sm font-medium text-gray-700">I have completed the payment</span>
                  </label>

                  <button onClick={handlePlaceOrder} disabled={loading || !upiTransactionId || !advancePaid} className="w-full btn-primary py-3.5 rounded-lg font-bold disabled:opacity-50">
                    {loading ? 'Submitting...' : 'Submit Transaction & Complete Order'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
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
                <div className="flex justify-between"><span>Subtotal</span><span className="font-medium text-gray-800">₹{cartTotal.toLocaleString()}</span></div>
                {settings?.shippingEnabled && <div className="flex justify-between"><span>Shipping</span><span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-gray-800'}`}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>}
                <div className="flex justify-between font-bold text-lg text-gray-900 pt-3 border-t border-gray-100 mt-2"><span>Total Payable</span><span>₹{grandTotal.toLocaleString()}</span></div>
                {isAdvanceApplicable && <div className="flex justify-between text-theme-primary font-semibold text-sm pt-2 bg-theme-light/30 p-2 rounded mt-2"><span>Advance Required</span><span>₹{advanceRequired.toLocaleString()}</span></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
