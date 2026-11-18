import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, MapPin, Package, Receipt } from 'lucide-react';
import { api } from '../services/api';
import { formatDateTime, formatINR, formatPaymentLabel } from '../lib/format';
import StatusBadge from '../components/StatusBadge';
import { ErrorState } from '../components/StateViews';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!order && id) {
      setLoading(true);
      api
        .getOrderById(id)
        .then((data) => setOrder(data))
        .catch((err) => setError(err.message || 'Unable to load order confirmation.'))
        .finally(() => setLoading(false));
    }
  }, [id, order]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <ErrorState title="Order not found" message={error} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="bg-white rounded-3xl border border-orange-100 shadow-card p-6 sm:p-10">
        <div className="text-center border-b border-orange-100 pb-8 mb-8">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-600">
            Order Confirmed
          </span>
          <h1 className="font-display font-extrabold text-3xl text-charcoal-900 mt-1">
            Thank you, {order.customer_name}!
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Your order has been received by the kitchen and assigned order ID{' '}
            <span className="font-bold text-charcoal-900">{order.order_number}</span>.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <StatusBadge status={order.status} />
            <span className="text-xs text-gray-500">{formatDateTime(order.created_at)}</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-8 text-sm">
          <div className="p-4 rounded-2xl bg-cream-50 border border-orange-100 space-y-1.5">
            <p className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              Delivering To
            </p>
            <p className="font-bold text-charcoal-900">{order.customer_name}</p>
            <p className="text-gray-600">{order.delivery_address}</p>
            <p className="text-gray-500">{order.customer_phone}</p>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 border border-orange-100 space-y-1.5">
            <p className="text-xs font-bold uppercase text-gray-500 flex items-center gap-1.5">
              <Receipt className="w-3.5 h-3.5 text-brand-600" />
              Payment &amp; Reference
            </p>
            <p className="font-bold text-charcoal-900">
              {formatPaymentLabel(order.payment_method, order.is_demo_payment)}
            </p>
            <p className="text-xs text-gray-600">
              Status: {order.is_demo_payment ? 'Demo Paid (Simulated)' : 'Pay on Delivery'}
            </p>
            <p className="text-[11px] text-gray-400 break-all">UUID: {order.id}</p>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <h2 className="font-display font-bold text-lg text-charcoal-900">Ordered Dishes</h2>
          {(order.order_items || []).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2.5 border-b border-orange-50 text-sm"
            >
              <div>
                <p className="font-semibold text-charcoal-900">{item.product_name_snapshot}</p>
                <p className="text-xs text-gray-500">
                  {item.quantity} &times; {formatINR(item.unit_price_inr_snapshot)}
                </p>
              </div>
              <span className="font-bold text-charcoal-900">
                {formatINR(item.line_total_inr)}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-cream-50 rounded-2xl p-4 space-y-2 text-sm mb-8">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatINR(order.subtotal_inr)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Delivery Fee</span>
            <span>
              {Number(order.delivery_fee_inr) === 0
                ? 'FREE'
                : formatINR(order.delivery_fee_inr)}
            </span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Taxes (5% GST)</span>
            <span>{formatINR(order.tax_inr)}</span>
          </div>
          <div className="flex justify-between font-display font-extrabold text-base text-charcoal-900 pt-2 border-t border-orange-200/70">
            <span>Total Paid / Payable</span>
            <span className="text-brand-600">{formatINR(order.total_inr)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/orders"
            className="flex-1 py-3 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm text-center transition inline-flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            Track in My Orders
          </Link>
          <Link
            to="/menu"
            className="flex-1 py-3 px-5 rounded-xl bg-cream-100 hover:bg-orange-100 text-charcoal-900 font-bold text-sm text-center transition"
          >
            Order More Food
          </Link>
        </div>
      </div>
    </div>
  );
}
