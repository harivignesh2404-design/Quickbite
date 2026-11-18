import { ORDER_STATUS_STYLES } from '../lib/format';

export default function StatusBadge({ status }) {
  const style = ORDER_STATUS_STYLES[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}
    >
      {status}
    </span>
  );
}
