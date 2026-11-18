import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Package, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { formatDateTime, formatINR, formatPaymentLabel } from '../lib/format';
import StatusBadge from '../components/StatusBadge';
import { EmptyState, ErrorState } from '../components/StateViews';

const TRACK_STEPS = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMyOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Unable to load order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-charcoal-900">My Orders</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track live preparation and delivery updates for all your orders
          </p>
        </div>
        <button
          type="button"
          onClick={loadOrders}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-orange-200 text-sm font-semibold text-charcoal-800 hover:bg-cream-100 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {error ? (
        <ErrorState title="Could not load orders" message={error} onRetry={loadOrders} />
      ) : loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-44 rounded-2xl bg-white border border-orange-100 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders placed yet"
          description="Once you place your first QuickBite order, you can track its status and inspect receipts here."
          action={
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm"
            >
              Browse Menu
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const stepIndex = TRACK_STEPS.indexOf(order.status);
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-orange-100 shadow-card p-6 space-y-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-50 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-display font-extrabold text-lg text-charcoal-900">
                        {order.order_number}
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Placed on {formatDateTime(order.created_at)} &bull;{' '}
                      {formatPaymentLabel(order.payment_method, order.is_demo_payment)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Grand Total</p>
                    <p className="font-display font-extrabold text-xl text-brand-600">
                      {formatINR(order.total_inr)}
                    </p>
                  </div>
                </div>

                {/* Progress Timeline */}
                {order.status !== 'Cancelled' && (
                  <div className="grid grid-cols-5 gap-2">
                    {TRACK_STEPS.map((step, i) => {
                      const reached = stepIndex >= i;
                      return (
                        <div key={step} className="space-y-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              reached ? 'bg-brand-600' : 'bg-orange-100'
                            }`}
                          />
                          <p
                            className={`text-[11px] font-semibold truncate ${
                              reached ? 'text-charcoal-900' : 'text-gray-400'
                            }`}
                          >
                            {step}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Order Items */}
                <div className="space-y-2">
                  {(order.order_items || []).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-charcoal-800">
                        <strong className="font-bold">{item.quantity}&times;</strong>{' '}
                        {item.product_name_snapshot}
                      </span>
                      <span className="font-semibold text-charcoal-900">
                        {formatINR(item.line_total_inr)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-orange-50 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span className="line-clamp-1">{order.delivery_address}</span>
                  </div>
                  <Link
                    to={`/order-confirmation/${order.id}`}
                    className="font-bold text-brand-600 hover:underline"
                  >
                    View Receipt
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
