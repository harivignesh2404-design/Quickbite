import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShoppingBag,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const { isAuthenticated, isAdmin, profile, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors ${
      isActive ? 'text-brand-600' : 'text-charcoal-800 hover:text-brand-600'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition">
              <Flame className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <span className="font-display font-extrabold text-xl tracking-tight text-charcoal-900">
                Quick<span className="text-brand-600">Bite</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase tracking-wider text-gray-500 font-semibold -mt-1">
                Fresh &amp; Fast Delivery
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/menu" className={navLinkClass}>
              Menu
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/orders" className={navLinkClass}>
                My Orders
              </NavLink>
            )}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
                    isActive
                      ? 'bg-charcoal-900 text-white'
                      : 'bg-orange-50 text-brand-700 hover:bg-orange-100'
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </NavLink>
            )}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/cart"
              className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cream-100 hover:bg-brand-50 border border-orange-200/70 text-charcoal-900 font-semibold text-sm transition"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="w-4 h-4 text-brand-600" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-brand-600 text-white text-xs font-bold">
                  {itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-cream-100 text-sm font-semibold text-charcoal-800 transition"
                >
                  <User className="w-4 h-4 text-brand-600" />
                  <span className="max-w-[120px] truncate">
                    {profile?.full_name || 'Account'}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="hidden md:inline-flex items-center px-4 py-2 rounded-xl bg-charcoal-900 hover:bg-brand-600 text-white text-sm font-semibold transition"
              >
                Sign In
              </Link>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-xl text-charcoal-800 hover:bg-cream-100"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-orange-100 bg-white px-4 py-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 rounded-xl font-semibold text-charcoal-800 hover:bg-cream-100"
          >
            Home
          </Link>
          <Link
            to="/menu"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 rounded-xl font-semibold text-charcoal-800 hover:bg-cream-100"
          >
            Browse Menu
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/orders"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-semibold text-charcoal-800 hover:bg-cream-100"
              >
                <Package className="w-4 h-4 text-brand-600" />
                My Orders
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-semibold text-charcoal-800 hover:bg-cream-100"
              >
                <User className="w-4 h-4 text-brand-600" />
                Profile &amp; Addresses
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-semibold bg-orange-50 text-brand-700"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl font-semibold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="block text-center px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold"
            >
              Sign In / Register
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
