import { useEffect, useState } from 'react';
import { MapPin, Plus, Star, Trash2, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrForm, setAddrForm] = useState({
    label: 'Home',
    recipient_name: '',
    phone: '',
    street_address: '',
    landmark: '',
    city: '',
    pincode: '',
    is_default: false,
  });
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setAddrForm((prev) => ({
        ...prev,
        recipient_name: prev.recipient_name || profile.full_name || '',
        phone: prev.phone || profile.phone || '',
      }));
    }
  }, [profile]);

  const loadAddresses = async () => {
    try {
      const list = await api.getAddresses();
      setAddresses(list);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  useEffect(() => {
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (fullName.trim().length < 2) {
      showToast('Full name must be at least 2 characters.', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      await api.updateProfile({ full_name: fullName.trim(), phone: phone.trim() });
      await refreshProfile();
      showToast('Profile updated successfully');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      await api.createAddress(addrForm);
      showToast('Address saved');
      setShowAddressForm(false);
      setAddrForm({
        label: 'Home',
        recipient_name: profile?.full_name || '',
        phone: profile?.phone || '',
        street_address: '',
        landmark: '',
        city: '',
        pincode: '',
        is_default: false,
      });
      await loadAddresses();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingAddr(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.updateAddress(id, { is_default: true });
      await loadAddresses();
      showToast('Default delivery address updated');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await api.deleteAddress(id);
      await loadAddresses();
      showToast('Address deleted');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-display font-extrabold text-3xl text-charcoal-900">
          Profile &amp; Saved Addresses
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Manage your account details and delivery locations
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Profile Card */}
        <form
          onSubmit={handleSaveProfile}
          className="lg:col-span-5 bg-white rounded-2xl p-6 border border-orange-100 shadow-card space-y-4"
        >
          <div className="flex items-center gap-3 pb-3 border-b border-orange-50">
            <div className="w-11 h-11 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-charcoal-900">Account Details</h2>
              <p className="text-xs text-gray-500 uppercase font-semibold">
                Role: {profile?.role || 'customer'}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-800 mb-1">Email</label>
            <input
              type="email"
              disabled
              value={profile?.email || ''}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-800 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-800 mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition"
          >
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        {/* Saved Addresses */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-orange-100 shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-charcoal-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-600" />
              Saved Addresses
            </h2>
            <button
              type="button"
              onClick={() => setShowAddressForm((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold transition"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </button>
          </div>

          {showAddressForm && (
            <form
              onSubmit={handleCreateAddress}
              className="p-4 rounded-2xl bg-cream-50 border border-orange-200 space-y-3"
            >
              <div className="grid sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={addrForm.label}
                  onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                  placeholder="Label (Home / Work)"
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
                />
                <input
                  type="text"
                  required
                  value={addrForm.recipient_name}
                  onChange={(e) => setAddrForm({ ...addrForm, recipient_name: e.target.value })}
                  placeholder="Recipient Name"
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
                />
                <input
                  type="tel"
                  required
                  value={addrForm.phone}
                  onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                  placeholder="Phone"
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>

              <input
                type="text"
                required
                value={addrForm.street_address}
                onChange={(e) => setAddrForm({ ...addrForm, street_address: e.target.value })}
                placeholder="Flat / House No., Building, Street"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
              />

              <div className="grid sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={addrForm.landmark}
                  onChange={(e) => setAddrForm({ ...addrForm, landmark: e.target.value })}
                  placeholder="Landmark (optional)"
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
                />
                <input
                  type="text"
                  required
                  value={addrForm.city}
                  onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                  placeholder="City"
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
                />
                <input
                  type="text"
                  required
                  value={addrForm.pincode}
                  onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })}
                  placeholder="Pincode"
                  className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-charcoal-800">
                  <input
                    type="checkbox"
                    checked={addrForm.is_default}
                    onChange={(e) => setAddrForm({ ...addrForm, is_default: e.target.checked })}
                  />
                  Set as default address
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingAddr}
                    className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold"
                  >
                    {savingAddr ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {addresses.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">
              No saved addresses yet. Add your home or office address for faster checkout.
            </p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="p-4 rounded-xl border border-orange-100 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-cream-100 text-xs font-bold text-charcoal-900">
                        {addr.label}
                      </span>
                      {addr.is_default && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                          <Star className="w-3 h-3 fill-emerald-600" />
                          Default
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-sm text-charcoal-900">{addr.recipient_name}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {addr.street_address}
                      {addr.landmark ? `, ${addr.landmark}` : ''}, {addr.city} - {addr.pincode}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{addr.phone}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!addr.is_default && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(addr.id)}
                        className="text-xs font-bold text-brand-600 hover:underline"
                      >
                        Make Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50"
                      aria-label="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
