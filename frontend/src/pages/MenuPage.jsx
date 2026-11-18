import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Leaf, Search, SlidersHorizontal, X } from 'lucide-react';
import { api } from '../services/api';
import FoodCard from '../components/FoodCard';
import { EmptyState, ErrorState, LoadingGrid } from '../components/StateViews';

export default function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectedCategory = searchParams.get('category') || 'all';
  const vegOnly = searchParams.get('veg') === 'true';
  const sort = searchParams.get('sort') || 'popular';
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === 'false') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [catData, prodData] = await Promise.all([
        api.getCategories(),
        api.getProducts({
          category: selectedCategory,
          search: searchParams.get('search') || '',
          veg: vegOnly ? 'true' : undefined,
          sort,
        }),
      ]);
      setCategories(catData);
      setProducts(prodData);
    } catch (err) {
      setError(err.message || 'Failed to load menu items.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchParams, vegOnly, sort]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  // Debounce search input into URL query param
  useEffect(() => {
    const timer = setTimeout(() => {
      const current = searchParams.get('search') || '';
      if (searchInput.trim() !== current) {
        updateParam('search', searchInput.trim());
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const clearFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-charcoal-900">
          Explore the Menu
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Filter by cuisine, pure-veg preferences, or search your favorite dish
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-orange-100 shadow-card mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search dishes by name or description..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-cream-50 border border-orange-200/80 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => updateParam('veg', vegOnly ? 'false' : 'true')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${
                vegOnly
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-charcoal-800 border-gray-200 hover:border-emerald-500'
              }`}
            >
              <Leaf className="w-4 h-4" />
              Pure Veg Only
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white">
              <SlidersHorizontal className="w-4 h-4 text-gray-500" />
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="text-sm font-semibold text-charcoal-800 bg-transparent focus:outline-none"
                aria-label="Sort dishes"
              >
                <option value="popular">Popular First</option>
                <option value="rating">Top Rated</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => updateParam('category', 'all')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === 'all'
                ? 'bg-charcoal-900 text-white'
                : 'bg-cream-100 text-charcoal-800 hover:bg-orange-100'
            }`}
          >
            All Cuisines
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => updateParam('category', cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.slug
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-cream-100 text-charcoal-800 hover:bg-orange-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {error ? (
        <ErrorState title="Could not load menu" message={error} onRetry={fetchMenu} />
      ) : loading ? (
        <LoadingGrid count={9} />
      ) : products.length === 0 ? (
        <EmptyState
          title="No dishes match your filters"
          description="Try clearing your search or switching to another cuisine category."
          action={
            <button
              type="button"
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition"
            >
              Reset Filters
            </button>
          }
        />
      ) : (
        <>
          <p className="text-xs font-semibold text-gray-500 mb-4">
            Showing {products.length} {products.length === 1 ? 'dish' : 'dishes'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <FoodCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
