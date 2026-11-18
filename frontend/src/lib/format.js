export function formatINR(amount) {
  const num = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num);
}

export function formatDateTime(isoString) {
  if (!isoString) return '';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoString));
}

export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

export const ORDER_STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
  Confirmed: 'bg-sky-100 text-sky-800 border-sky-200',
  Preparing: 'bg-orange-100 text-orange-800 border-orange-200',
  'Out for Delivery': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
};

export function formatPaymentLabel(method, isDemo) {
  if (method === 'cod') return 'Cash on Delivery';
  if (method === 'demo_card') return isDemo ? 'Demo Card (Simulated)' : 'Demo Card';
  if (method === 'demo_upi') return isDemo ? 'Demo UPI (Simulated)' : 'Demo UPI';
  return method;
}
