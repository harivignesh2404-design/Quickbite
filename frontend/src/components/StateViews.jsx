import { AlertTriangle, RefreshCw, SearchX } from 'lucide-react';

export function LoadingGrid({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl overflow-hidden border border-orange-100 shadow-card animate-pulse"
        >
          <div className="h-48 bg-orange-100/70" />
          <div className="p-4 space-y-3">
            <div className="h-5 bg-orange-100 rounded w-3/4" />
            <div className="h-3.5 bg-orange-50 rounded w-full" />
            <div className="h-3.5 bg-orange-50 rounded w-2/3" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 bg-orange-100 rounded w-16" />
              <div className="h-9 bg-orange-100 rounded-xl w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto shadow-card">
      <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-charcoal-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-5">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon = SearchX, title, description, action }) {
  return (
    <div className="bg-white border border-orange-100 rounded-2xl p-10 text-center max-w-lg mx-auto shadow-card">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-charcoal-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-6">{description}</p>
      {action}
    </div>
  );
}
