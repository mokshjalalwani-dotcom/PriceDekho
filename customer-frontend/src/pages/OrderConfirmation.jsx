import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Package, MapPin, Clock, ArrowRight, MessageSquareText } from 'lucide-react';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`/api/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-theme-light border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
          <Link to="/shop" className="btn-primary mt-4 inline-block">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-14">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Banner */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={42} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-500">Thank you, <strong>{order.name}</strong>. Your order has been placed successfully.</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full text-sm text-gray-600 font-mono">
            Order ID: <span className="font-bold text-gray-900">#{order._id.slice(-8).toUpperCase()}</span>
          </div>
        </div>

        {order.adminMessage && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-full shrink-0">
              <MessageSquareText size={20} />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 text-sm mb-1">Message from Satguru Electricals</h3>
              <p className="text-blue-800 text-sm">{order.adminMessage}</p>
            </div>
          </div>
        )}

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Status */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600">Order Status</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
              {order.status}
            </span>
          </div>

          {/* Items */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Package size={18} className="text-[var(--color-primary)]" />
              <h2 className="font-bold text-gray-900">Items Ordered</h2>
            </div>
            <div className="space-y-4">
              {order.orderItems.map((item, i) => (
                <div key={i} className="flex gap-4 items-center">
                  <img src={item.image} alt={item.name} className="w-14 h-14 object-contain border border-gray-100 rounded-lg p-1 bg-gray-50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 line-clamp-1">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                  </div>
                  <p className="font-semibold text-gray-900">₹{(item.price * item.qty).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={18} className="text-[var(--color-primary)]" />
              <h2 className="font-bold text-gray-900">Deliver To</h2>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.state} — {order.shippingAddress.pincode}
            </p>
          </div>

          {/* Total */}
          <div className="p-6 bg-gray-50">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Items Total</span>
              <span>₹{order.itemsPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Shipping</span>
              <span className={order.shippingPrice === 0 ? 'text-green-600' : ''}>{order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice}`}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-200 pt-3 mt-2">
              <span>Total Paid (COD)</span>
              <span>₹{order.totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mt-8">
          <Link to="/shop" className="flex-1 btn-primary text-center flex items-center justify-center gap-2 py-3">
            Continue Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
