import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="max-w-lg mx-auto my-16 px-4">
        <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-xl text-charcoal-900 mb-2">
            Admin Access Required
          </h2>
          <p className="text-sm text-gray-600">
            This dashboard is restricted to authorized QuickBite administrators. All admin
            endpoints are also enforced server-side.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
