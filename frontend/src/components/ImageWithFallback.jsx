import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

export default function ImageWithFallback({
  src,
  alt,
  className = '',
  fallbackClassName = '',
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-brand-50 to-cream-200 text-brand-500 ${fallbackClassName || className}`}
        role="img"
        aria-label={alt || 'Dish photo'}
      >
        <UtensilsCrossed className="w-8 h-8 opacity-75" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
