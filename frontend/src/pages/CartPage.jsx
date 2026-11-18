import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { formatINR } from '../lib/format';
import ImageWithFallback from '../components/ImageWithFallback';
import VegBadge from '../components/VegBadge';
import { EmptyState } from '../components/StateViews';

export default function CartPage() {
  const {
    items,
    subtotal,
    deliveryFee,
    tax,
    grandTotal,
    amountForFreeDelivery,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your QuickBite cart is empty"
          description="Looks like you haven't added any dishes yet. Browse our menu to start building your meal."
          action={
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition"
            >
              Browse Menu
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-charcoal-900">Your Cart</h1>
          <p className="text-sm text-gray-600 mt-1">
            Review your dishes before proceeding to checkout
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-sm font-semibold text-rose-600 hover:text-rose-700"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Items */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 border border-orange-100 shadow-card flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <Link
                to={`/food/${item.id}`}
                className="w-full sm:w-24 h-36 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-cream-100"
              >
                <ImageWithFallback
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <VegBadge isVeg={item.is_veg} />
                  {item.category_name && (
                    <span className="text-xs font-medium text-gray-500">
                      {item.category_name}
                    </span>
                  )}
                </div>
                <Link
                  to={`/food/${item.id}`}
                  className="font-display font-bold text-base text-charcoal-900 hover:text-brand-600 transition block truncate"
                >
                  {item.name}
                </Link>
                <p className="text-sm font-semibold text-gray-600 mt-1">
                  {formatINR(item.price_inr)} each
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4">
                <div className="inline-flex items-center rounded-xl border border-orange-200 bg-cream-50">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 text-charcoal-800 hover:text-brand-600"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-sm font-bold min-w-[2rem] text-center">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 text-charcoal-800 hover:text-brand-600"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-right min-w-[80px]">
                  <p className="font-display font-bold text-base text-charcoal-900">
                    {formatINR(item.price_inr * item.quantity)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-orange-100 shadow-card space-y-5 sticky top-24">
          <h2 className="font-display font-bold text-xl text-charcoal-900">Bill Summary</h2>

          {amountForFreeDelivery > 0 ? (
            <div className="px-3.5 py-2.5 rounded-xl bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-800">
              Add {formatINR(amountForFreeDelivery)} more to unlock{' '}
              <span className="font-bold">FREE delivery</span>!
            </div>
          ) : (
            <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              You unlocked <span className="font-bold">FREE delivery</span> on this order!
            </div>
          )}

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Item Subtotal</span>
              <span className="font-semibold text-charcoal-900">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className="font-semibold text-charcoal-900">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-600">FREE</span>
                ) : (
                  formatINR(deliveryFee)
                )}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Taxes (5% GST)</span>
              <span className="font-semibold text-charcoal-900">{formatINR(tax)}</span>
            </div>
            <div className="border-t border-orange-100 pt-3 flex justify-between items-center">
              <span className="font-display font-bold text-base text-charcoal-900">
                Grand Total
              </span>
              <span className="font-display font-extrabold text-xl text-brand-600">
                {formatINR(grandTotal)}
              </span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="w-full py-3.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/20 transition flex items-center justify-center gap-2"
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
