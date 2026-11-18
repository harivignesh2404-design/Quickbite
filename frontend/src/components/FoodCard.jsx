import { Link } from 'react-router-dom';
import { Clock, Minus, Plus, Star } from 'lucide-react';
import { formatINR } from '../lib/format';
import { useCart } from '../contexts/CartContext';
import ImageWithFallback from './ImageWithFallback';
import VegBadge from './VegBadge';

export default function FoodCard({ product }) {
  const { items, addToCart, updateQuantity } = useCart();
  const cartItem = items.find((item) => item.id === product.id);
  const unavailable = !product.is_available;

  return (
    <div className="group bg-white rounded-2xl border border-orange-100/80 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col">
      <Link to={`/food/${product.id}`} className="relative block h-48 overflow-hidden bg-cream-100">
        <ImageWithFallback
          src={product.image_url}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            unavailable ? 'grayscale opacity-70' : ''
          }`}
        />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {product.categories?.name && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-charcoal-900 shadow-sm backdrop-blur-sm">
              {product.categories.name}
            </span>
          )}
          {product.is_featured && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-brand-600 text-white shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Rating pill */}
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-charcoal-900/85 text-white text-xs font-semibold backdrop-blur-sm">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{Number(product.rating || 4.5).toFixed(1)}</span>
        </div>

        <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/95 text-charcoal-800 text-xs font-medium shadow-sm">
          <Clock className="w-3.5 h-3.5 text-brand-600" />
          <span>{product.prep_time_mins || 25} mins</span>
        </div>

        {unavailable && (
          <div className="absolute inset-0 bg-charcoal-900/55 flex items-center justify-center">
            <span className="px-3.5 py-1.5 rounded-full bg-white text-charcoal-900 text-xs font-bold uppercase tracking-wide shadow">
              Currently Unavailable
            </span>
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <Link
            to={`/food/${product.id}`}
            className="font-display font-bold text-base text-charcoal-900 hover:text-brand-600 transition line-clamp-1"
          >
            {product.name}
          </Link>
          <div className="pt-1 shrink-0">
            <VegBadge isVeg={product.is_veg} />
          </div>
        </div>

        <p className="text-xs text-gray-600 line-clamp-2 mb-4 flex-1 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-orange-50">
          <div>
            <span className="font-display font-bold text-lg text-charcoal-900">
              {formatINR(product.price_inr)}
            </span>
          </div>

          {unavailable ? (
            <button
              type="button"
              disabled
              className="px-4 py-2 rounded-xl bg-gray-100 text-gray-400 text-xs font-semibold cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : cartItem ? (
            <div className="inline-flex items-center rounded-xl bg-brand-600 text-white shadow-sm overflow-hidden">
              <button
                type="button"
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                className="p-2 hover:bg-brand-700 transition"
                aria-label={`Decrease quantity of ${product.name}`}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-3 text-sm font-bold min-w-[2rem] text-center">
                {cartItem.quantity}
              </span>
              <button
                type="button"
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                className="p-2 hover:bg-brand-700 transition"
                aria-label={`Increase quantity of ${product.name}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => addToCart(product, 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-50 hover:bg-brand-600 text-brand-700 hover:text-white border border-brand-200 hover:border-brand-600 text-sm font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
