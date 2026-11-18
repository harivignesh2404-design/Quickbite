import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Minus, Plus, ShoppingBag, Star } from 'lucide-react';
import { api } from '../services/api';
import { formatINR } from '../lib/format';
import { useCart } from '../contexts/CartContext';
import ImageWithFallback from '../components/ImageWithFallback';
import VegBadge from '../components/VegBadge';
import { ErrorState } from '../components/StateViews';

export default function FoodDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getProductById(id);
      setProduct(data);
    } catch (err) {
      setError(err.message || 'Unable to load food details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl p-6 shadow-card grid md:grid-cols-2 gap-8 animate-pulse">
          <div className="h-80 rounded-2xl bg-orange-100" />
          <div className="space-y-4 py-4">
            <div className="h-7 bg-orange-100 rounded w-3/4" />
            <div className="h-4 bg-orange-50 rounded w-full" />
            <div className="h-4 bg-orange-50 rounded w-5/6" />
            <div className="h-10 bg-orange-100 rounded w-1/3 mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <ErrorState
          title="Dish not found"
          message={error || 'This dish may have been removed.'}
          onRetry={loadProduct}
        />
      </div>
    );
  }

  const unavailable = !product.is_available;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/menu"
        className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal-800 hover:text-brand-600 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Menu
      </Link>

      <div className="bg-white rounded-3xl border border-orange-100 shadow-card overflow-hidden grid md:grid-cols-2">
        <div className="relative h-72 md:h-full min-h-[320px] bg-cream-100">
          <ImageWithFallback
            src={product.image_url}
            alt={product.name}
            className={`w-full h-full object-cover ${unavailable ? 'grayscale opacity-70' : ''}`}
          />
          {unavailable && (
            <div className="absolute inset-0 bg-charcoal-900/55 flex items-center justify-center">
              <span className="px-4 py-2 rounded-full bg-white text-charcoal-900 text-xs font-bold uppercase tracking-wider">
                Currently Unavailable
              </span>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              {product.categories?.name && (
                <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold">
                  {product.categories.name}
                </span>
              )}
              <VegBadge isVeg={product.is_veg} showLabel />
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900">
              {product.name}
            </h1>

            <div className="flex items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {Number(product.rating || 4.5).toFixed(1)}
              </span>
              <span className="inline-flex items-center gap-1.5 text-gray-600 font-medium">
                <Clock className="w-4 h-4 text-brand-600" />
                Prepared in ~{product.prep_time_mins || 25} mins
              </span>
            </div>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed pt-2">
              {product.description}
            </p>
          </div>

          <div className="pt-6 border-t border-orange-100 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Price
                </span>
                <p className="font-display font-extrabold text-3xl text-charcoal-900">
                  {formatINR(product.price_inr)}
                </p>
              </div>

              {/* Quantity Stepper */}
              <div className="inline-flex items-center rounded-2xl border border-orange-200 bg-cream-50">
                <button
                  type="button"
                  disabled={unavailable || quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 text-charcoal-900 hover:text-brand-600 disabled:opacity-40"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-display font-bold text-lg min-w-[2.5rem] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  disabled={unavailable || quantity >= 50}
                  onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                  className="p-3 text-charcoal-900 hover:text-brand-600 disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={unavailable}
              onClick={() => addToCart(product, quantity)}
              className="w-full py-3.5 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 disabled:bg-gray-200 disabled:text-gray-500 text-white font-bold text-base shadow-lg shadow-brand-600/20 transition flex items-center justify-center gap-2.5"
            >
              <ShoppingBag className="w-5 h-5" />
              {unavailable
                ? 'Currently Unavailable'
                : `Add to Cart • ${formatINR(Number(product.price_inr) * quantity)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
