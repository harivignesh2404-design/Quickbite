export default function VegBadge({ isVeg, showLabel = false }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center justify-center w-4 h-4 rounded-[3px] border-2 ${
          isVeg ? 'border-emerald-600' : 'border-rose-700'
        }`}
        title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
        aria-label={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
      >
        <span
          className={`w-2 h-2 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-rose-700'}`}
        />
      </span>
      {showLabel && (
        <span className="text-xs font-medium text-charcoal-800">
          {isVeg ? 'Pure Veg' : 'Non-Veg'}
        </span>
      )}
    </span>
  );
}
