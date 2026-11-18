import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Banknote,
  CheckCircle2,
  CreditCard,
  MapPin,
  ShieldAlert,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { formatINR } from '../lib/format';

export default function CheckoutPage() {
  const { profile } = useAuth();
  const { items, subtotal, deliveryFee, tax, grandTotal, clearCart } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('custom');
  const [customerName, setCustomerName] = useState(profile?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState(profile?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [saveAddress, setSaveAddress] = useState(false);
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setCustomerName((prev) => prev || profile.full_name || '');
      setCustomerPhone((prev) => prev || profile.phone || '');
    }
  }, [profile]);

  useEffect(() => {
    api
      .getAddresses()
      .then((list) => {
        setAddresses(list);
        const def = list.find((a) => a.is_default) || list[0];
        if (def) {
          setSelectedAddressId(def.id);
          setCustomerName(def.recipient_name);
          setCustomerPhone(def.phone);
          setDeliveryAddress(
            [def.street_address, def.landmark, `${def.city} - ${def.pincode}`]
              .filter(Boolean)
              .join(', ')
          );
        }
      })
      .catch(() => {
        // Non-fatal if user has no addresses yet
      });
  }, []);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setCustomerName(addr.recipient_name);
    setCustomerPhone(addr.phone);
    setDeliveryAddress(
      [addr.street_address, addr.landmark, `${addr.city} - ${addr.pincode}`]
        .filter(Boolean)
        .join(', ')
    );
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display font-bold text-2xl text-charcoal-900 mb-2">
          Your cart is empty
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Add dishes from the menu before checking out.
        </p>
        <Link
          to="/menu"
          className="inline-flex px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm"
        >
          Go to Menu
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (customerName.trim().length < 2) {
      setError('Please enter the recipient name.');
      return;
    }
    const cleanedPhone = customerPhone.replace(/[\s\-()]/g, '');
    if (!/^\+?[0-9]{10,15}$/.test(cleanedPhone)) {
      setError('Please enter a valid 10 to 15 digit phone number.');
      return;
    }
    if (deliveryAddress.trim().length < 8) {
      setError('Please enter a complete delivery address (street, area, city/pincode).');
      return;
    }

    setSubmitting(true);
    try {
      if (selectedAddressId === 'custom' && saveAddress && city.trim() && pincode.trim()) {
        await api
          .createAddress({
            label: 'Delivery',
            recipient_name: customerName.trim(),
            phone: cleanedPhone,
            street_address: deliveryAddress.trim(),
            city: city.trim(),
            pincode: pincode.trim(),
            is_default: addresses.length === 0,
          })
          .catch(() => null);
      }

      const order = await api.placeOrder({
        customer_name: customerName.trim(),
        customer_phone: cleanedPhone,
        delivery_address: deliveryAddress.trim(),
        payment_method: paymentMethod,
        notes: notes.trim(),
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      });

      clearCart();
      showToast(`Order ${order.order_number} placed!`);
      navigate(`/order-confirmation/${order.id}`, { state: { order } });
    } catch (err) {
      setError(err.message || 'Could not place order. Please review your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display font-extrabold text-3xl text-charcoal-900 mb-2">Checkout</h1>
      <p className="text-sm text-gray-600 mb-8">
        Confirm your delivery address and choose your payment method
      </p>

      <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Saved Addresses */}
          {addresses.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-600" />
                  Saved Delivery Addresses
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAddressId('custom');
                    setDeliveryAddress('');
                  }}
                  className="text-xs font-bold text-brand-600 hover:underline"
                >
                  + Use Different Address
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {addresses.map((addr) => {
                  const active = selectedAddressId === addr.id;
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => handleSelectAddress(addr)}
                      className={`text-left p-4 rounded-xl border-2 transition ${
                        active
                          ? 'border-brand-600 bg-brand-50/50'
                          : 'border-gray-100 hover:border-orange-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-700">
                          {addr.label}
                        </span>
                        {active && <CheckCircle2 className="w-4 h-4 text-brand-600" />}
                      </div>
                      <p className="font-bold text-sm text-charcoal-900">{addr.recipient_name}</p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {addr.street_address}, {addr.city} - {addr.pincode}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{addr.phone}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customer & Address Form */}
          <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-card space-y-4">
            <h2 className="font-display font-bold text-lg text-charcoal-900">
              Delivery Details
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
                Full Delivery Address *
              </label>
              <textarea
                rows={3}
                required
                value={deliveryAddress}
                onChange={(e) => {
                  setSelectedAddressId('custom');
                  setDeliveryAddress(e.target.value);
                }}
                placeholder="Flat / House No., Building, Street, Landmark, City, Pincode"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {selectedAddressId === 'custom' && (
              <div className="space-y-3 pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  Save this address to my profile for future orders
                </label>
                {saveAddress && (
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City (e.g. Bengaluru)"
                      className="px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                    />
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Pincode (e.g. 560038)"
                      className="px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                    />
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-charcoal-800 mb-1.5">
                Cooking / Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Less spicy, ring bell twice"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-card space-y-4">
            <h2 className="font-display font-bold text-lg text-charcoal-900">Payment Method</h2>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <span>
                <strong>Demo Payment Notice:</strong> QuickBite does not process live credit card
                or UPI charges. Choose <strong>Cash on Delivery</strong> or a clearly labelled{' '}
                <strong>Demo Payment</strong> simulation option.
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'cod',
                  title: 'Cash on Delivery',
                  desc: 'Pay cash when order arrives',
                  icon: Banknote,
                  badge: null,
                },
                {
                  id: 'demo_upi',
                  title: 'Demo UPI',
                  desc: 'Simulated instant UPI flow',
                  icon: Smartphone,
                  badge: 'DEMO ONLY',
                },
                {
                  id: 'demo_card',
                  title: 'Demo Card',
                  desc: 'Simulated card checkout',
                  icon: CreditCard,
                  badge: 'DEMO ONLY',
                },
              ].map((opt) => {
                const Icon = opt.icon;
                const active = paymentMethod === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`p-4 rounded-xl border-2 text-left transition ${
                      active
                        ? 'border-brand-600 bg-brand-50/50'
                        : 'border-gray-100 hover:border-orange-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon
                        className={`w-5 h-5 ${active ? 'text-brand-600' : 'text-gray-500'}`}
                      />
                      {opt.badge && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-sm text-charcoal-900">{opt.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-orange-100 shadow-card space-y-5 sticky top-24">
          <h2 className="font-display font-bold text-xl text-charcoal-900">Order Summary</h2>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-charcoal-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    Qty {item.quantity} &times; {formatINR(item.price_inr)}
                  </p>
                </div>
                <span className="font-bold text-charcoal-900 shrink-0">
                  {formatINR(item.price_inr * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-orange-100 pt-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-charcoal-900">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className="font-semibold text-charcoal-900">
                {deliveryFee === 0 ? 'FREE' : formatINR(deliveryFee)}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Taxes (5% GST)</span>
              <span className="font-semibold text-charcoal-900">{formatINR(tax)}</span>
            </div>
            <div className="border-t border-orange-100 pt-3 flex justify-between items-center">
              <span className="font-display font-bold text-base text-charcoal-900">
                Payable Total
              </span>
              <span className="font-display font-extrabold text-xl text-brand-600">
                {formatINR(grandTotal)}
              </span>
            </div>
            <p className="text-[11px] text-gray-500">
              Final totals are verified and calculated on the server from current menu prices.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-brand-600/20 transition"
          >
            {submitting
              ? 'Confirming Order...'
              : paymentMethod === 'cod'
                ? `Place COD Order • ${formatINR(grandTotal)}`
                : `Confirm Demo Payment Order • ${formatINR(grandTotal)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
