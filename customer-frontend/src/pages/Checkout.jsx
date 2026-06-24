import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, User, Phone, Mail, CreditCard, CheckCircle, QrCode } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
const Checkout = () => {
  const { cart, cartTotal, dispatch } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const shippingPrice = cartTotal > 999 ? 0 : 60;
  const total = cartTotal + shippingPrice;

  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', city: '', state: '', pincode: '',
  });
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [advancePaid, setAdvancePaid] = useState(false);
  const [upiTransactionId, setUpiTransactionId] = useState('');
  

  React.useEffect(() => {
    const init = async () => {
      try {
        const res = await axios.get('/api/settings');
        setSettings(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderItems = cart.map(item => ({
        name: item.name,
        qty: item.qty,
        image: item.images?.[0] || '',
        price: item.price,
        product: item._id,
      }));

      const res = await axios.post('/api/orders', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        shippingAddress: {
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        orderItems,
        itemsPrice: cartTotal,
        shippingPrice,
        totalPrice: total,
        paymentMethod: paymentMethod,
        advancePaid: paymentMethod === 'COD' && settings?.codAdvanceEnabled ? advancePaid : false,
        advanceAmount: paymentMethod === 'COD' && settings?.codAdvanceEnabled ? (total * settings.codAdvancePercent) / 100 : 0,
        upiTransactionId: paymentMethod === 'UPI' || (paymentMethod === 'COD' && settings?.codAdvanceEnabled) ? upiTransactionId : '',
        user: user?._id || null,
      });

      dispatch({ type: 'CLEAR_CART' });
      addToast('Order placed successfully!', 'success');
      setTimeout(() => {
        navigate(`/order/${res.data._id}`);
      }, 1500);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to place order. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate('/cart')} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-8 transition-colors">
          <ArrowLeft size={18} /> Back to Cart
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Form */}
            <div className="flex-1 space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <User size={18} className="text-[var(--color-primary)]" />
                  <h2 className="text-lg font-bold text-gray-900">Contact Information</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input name="name" required value={form.name} onChange={handleChange}
                      className="input-field" placeholder="Ravi Kumar" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input name="email" type="email" required value={form.email} onChange={handleChange}
                      className="input-field" placeholder="ravi@example.com" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input name="phone" required value={form.phone} onChange={handleChange}
                      className="input-field" placeholder="9876543210" maxLength={10} />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <MapPin size={18} className="text-[var(--color-primary)]" />
                  <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <input name="address" required value={form.address} onChange={handleChange}
                      className="input-field" placeholder="Street, Area, Landmark" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input name="city" required value={form.city} onChange={handleChange}
                      className="input-field" placeholder="Mumbai" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input name="state" required value={form.state} onChange={handleChange}
                      className="input-field" placeholder="Maharashtra" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input name="pincode" required value={form.pincode} onChange={handleChange}
                      className="input-field" placeholder="400001" maxLength={6} />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <CreditCard size={18} className="text-[var(--color-primary)]" />
                  <h2 className="text-lg font-bold text-gray-900">Payment Method</h2>
                </div>
                
                <div className="space-y-4">
                  {/* COD Option */}
                  <label className={`flex items-start gap-3 cursor-pointer p-4 border-2 rounded-xl transition-colors ${paymentMethod === 'COD' ? 'border-[var(--color-primary)] bg-theme-light' : 'border-gray-200 hover:border-theme-light'}`}>
                    <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="accent-[var(--color-primary)] mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">Cash on Delivery (COD)</p>
                      <p className="text-sm text-gray-500">Pay when your order arrives</p>
                      
                      {paymentMethod === 'COD' && settings?.codAdvanceEnabled && (
                        <div className="mt-4 p-4 bg-white rounded-lg border border-theme-light shadow-sm">
                          <h4 className="font-semibold text-theme-dark mb-2">⚠️ Advance Payment Required</h4>
                          <p className="text-sm text-gray-600 mb-4">
                            Please pay a <strong>{settings.codAdvancePercent}% advance (₹{((total * settings.codAdvancePercent) / 100).toLocaleString()})</strong> via UPI to confirm your COD order. The remaining amount will be collected on delivery.
                          </p>
                          {settings?.upiId && (
                            <div className="flex flex-col items-center gap-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                              {settings.upiQrImage ? (
                                <img src={settings.upiQrImage} alt="UPI QR" className="w-32 h-32 object-contain" />
                              ) : (
                                <QrCode size={40} className="text-gray-400" />
                              )}
                              <p className="text-sm font-medium text-gray-900">UPI ID: <span className="font-bold">{settings.upiId}</span></p>
                            </div>
                          )}
                          <div className="space-y-3">
                            <input
                              type="text"
                              required
                              placeholder="Enter UPI Transaction ID"
                              value={upiTransactionId}
                              onChange={(e) => setUpiTransactionId(e.target.value)}
                              className="input-field text-sm"
                            />
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
                              <input type="checkbox" required checked={advancePaid} onChange={(e) => setAdvancePaid(e.target.checked)} className="accent-[var(--color-primary)] w-4 h-4" />
                              I have paid the advance amount
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>

                  {/* UPI Option */}
                  {settings?.upiEnabled && (
                    <label className={`flex items-start gap-3 cursor-pointer p-4 border-2 rounded-xl transition-colors ${paymentMethod === 'UPI' ? 'border-[var(--color-primary)] bg-theme-light' : 'border-gray-200 hover:border-theme-light'}`}>
                      <input type="radio" name="paymentMethod" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} className="accent-[var(--color-primary)] mt-1" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">Pay via UPI</p>
                        <p className="text-sm text-gray-500">Pay instantly using any UPI app</p>
                        
                        {paymentMethod === 'UPI' && (
                          <div className="mt-4 p-4 bg-white rounded-lg border border-theme-light shadow-sm">
                            <div className="flex flex-col items-center gap-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100 text-center">
                              {settings.upiQrImage ? (
                                <img src={settings.upiQrImage} alt="UPI QR" className="w-32 h-32 object-contain" />
                              ) : (
                                <QrCode size={40} className="text-gray-400" />
                              )}
                              <p className="text-sm font-medium text-gray-900">UPI ID: <span className="font-bold">{settings.upiId}</span></p>
                              <p className="text-sm text-gray-500">Amount to pay: <strong>₹{total.toLocaleString()}</strong></p>
                            </div>
                            <input
                              type="text"
                              required
                              placeholder="Enter UPI Transaction ID"
                              value={upiTransactionId}
                              onChange={(e) => setUpiTransactionId(e.target.value)}
                              className="input-field text-sm"
                            />
                          </div>
                        )}
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-80">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>
                <div className="space-y-3 mb-5">
                  {cart.map(item => (
                    <div key={item._id} className="flex gap-3 items-center">
                      <img src={item.images?.[0]} alt={item.name} className="w-12 h-12 object-contain rounded border border-gray-100 p-1 bg-gray-50 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 shrink-0">₹{(item.price * item.qty).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shippingPrice === 0 ? 'text-green-600' : ''}>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary mt-6 py-3 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Placing Order...</span>
                  ) : (
                    <span className="flex items-center gap-2"><CheckCircle size={18} /> Place Order</span>
                  )}
                </button>
                {!user && (
                  <p className="text-xs text-center text-gray-500 mt-4">
                    By placing this order, you agree to our Terms & Conditions. You can sign in via the menu to track your orders.
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
