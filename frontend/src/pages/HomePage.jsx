import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, Search, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { api } from '../services/api';
import FoodCard from '../components/FoodCard';
import ImageWithFallback from '../components/ImageWithFallback';
import { ErrorState, LoadingGrid } from '../components/StateViews';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadHomeData = async () => {
    setLoading(true);
    setError('');
    try {
      const [cats, featuredDishes, popularDishes] = await Promise.all([
        api.getCategories(),
        api.getProducts({ featured: 'true', availableOnly: 'true' }),
        api.getProducts({ popular: 'true', availableOnly: 'true' }),
      ]);
      setCategories(cats);
      setFeatured(featuredDishes.slice(0, 6));
      setPopular(popularDishes.slice(0, 6));
    } catch (err) {
      setError(err.message || 'Unable to load menu highlights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchTerm.trim();
    navigate(q ? `/menu?search=${encodeURIComponent(q)}` : '/menu');
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-charcoal-900 via-charcoal-900 to-brand-700 text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_#fb923c,_transparent_55%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-orange-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                <span>Freshly cooked to order • Free delivery above &#8377;499</span>
              </div>

              <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight">
                Cravings delivered{' '}
                <span className="text-brand-400">hot &amp; fresh</span> in minutes.
              </h1>

              <p className="text-base sm:text-lg text-gray-300 max-w-xl leading-relaxed">
                From aromatic Hyderabadi dum biriyani and stone-baked pizzas to crispy ghee roast
                dosas—explore curated dishes crafted for every mood.
              </p>

              {/* Hero Search */}
              <form
                onSubmit={handleSearchSubmit}
                className="flex flex-col sm:flex-row gap-3 max-w-xl pt-2"
              >
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search biriyani, masala dosa, tandoori pizza..."
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white text-charcoal-900 placeholder:text-gray-400 font-medium text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/30 shadow-lg"
                  />
                </div>
                <button
                  type="submit"
                  className="px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 shrink-0"
                >
                  Find Food
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="flex flex-wrap gap-6 pt-2 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-400" />
                  <span>Avg. 25 min prep</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-400" />
                  <span>Live order status tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  <span>Verified COD &amp; Demo Pay</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1000&q=85"
                  alt="Signature Hyderabadi Biriyani feast"
                  className="w-full h-[380px] object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-charcoal-900 via-charcoal-900/70 to-transparent">
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">
                    Chef&apos;s Spotlight
                  </p>
                  <p className="font-display font-bold text-lg text-white">
                    Slow-Cooked Saffron Dum Biriyani &amp; Artisan Classics
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {error ? (
          <ErrorState
            title="Could not connect to QuickBite API"
            message={error}
            onRetry={loadHomeData}
          />
        ) : (
          <>
            {/* Categories Strip */}
            <section>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900">
                    What&apos;s on your mind?
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Browse freshly prepared dishes across your favorite cuisines
                  </p>
                </div>
                <Link
                  to="/menu"
                  className="text-sm font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                >
                  Full Menu
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-32 rounded-2xl bg-orange-100/70 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/menu?category=${encodeURIComponent(cat.slug)}`}
                      className="group bg-white rounded-2xl p-3 border border-orange-100 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all text-center"
                    >
                      <div className="w-16 h-16 mx-auto rounded-full overflow-hidden mb-2.5 ring-2 ring-orange-100 group-hover:ring-brand-500 transition">
                        <ImageWithFallback
                          src={cat.image_url}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-display font-bold text-sm text-charcoal-900 group-hover:text-brand-600 transition">
                        {cat.name}
                      </h3>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Featured Dishes */}
            <section>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                    Curated Picks
                  </span>
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900">
                    Featured Dishes
                  </h2>
                </div>
                <Link
                  to="/menu"
                  className="text-sm font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                >
                  Explore All
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {loading ? (
                <LoadingGrid count={3} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featured.map((product) => (
                    <FoodCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>

            {/* Popular Dishes */}
            <section>
              <div className="flex items-end justify-between mb-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                    Customer Favorites
                  </span>
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900">
                    Popular Right Now
                  </h2>
                </div>
                <Link
                  to="/menu"
                  className="text-sm font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                >
                  View Menu
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {loading ? (
                <LoadingGrid count={6} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {popular.map((product) => (
                    <FoodCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
