import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, MapPin, User, Phone, Mail, CreditCard, CheckCircle } from 'lucide-react';
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
        paymentMethod: 'COD',
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
                <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-[var(--color-primary)] bg-orange-50 rounded-xl">
                  <input type="radio" checked readOnly className="accent-[var(--color-primary)]" />
                  <div>
                    <p className="font-semibold text-gray-900">Cash on Delivery (COD)</p>
                    <p className="text-sm text-gray-500">Pay when your order arrives</p>
                  </div>
                </label>
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
                    <span className="flex items-center gap-2"><CheckCircle size={18} /> Place Order (COD)</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
