import { useCallback, useEffect, useState } from 'react';
import {
  Check,
  Clock,
  Edit3,
  FolderKanban,
  ImagePlus,
  IndianRupee,
  LayoutDashboard,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  Trash2,
  Utensils,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import {
  ORDER_STATUSES,
  formatDateTime,
  formatINR,
  formatPaymentLabel,
} from '../lib/format';
import { useToast } from '../contexts/ToastContext';
import ImageWithFallback from '../components/ImageWithFallback';
import StatusBadge from '../components/StatusBadge';
import VegBadge from '../components/VegBadge';
import { ErrorState } from '../components/StateViews';

const INITIAL_PRODUCT_FORM = {
  name: '',
  category_id: '',
  description: '',
  price_inr: '',
  image_url: '',
  prep_time_mins: '25',
  rating: '4.5',
  is_veg: true,
  is_available: true,
  is_featured: false,
  is_popular: false,
};

const INITIAL_CATEGORY_FORM = {
  name: '',
  description: '',
  image_url: '',
  sort_order: '0',
  is_active: true,
};

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Product modal state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM);
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Category modal state
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryForm, setCategoryForm] = useState(INITIAL_CATEGORY_FORM);
  const [savingCategory, setSavingCategory] = useState(false);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsData, catsData, prodsData, ordersData] = await Promise.all([
        api.getAdminStats(),
        api.getCategories(true),
        api.getProducts({ sort: 'newest' }),
        api.getAllOrdersAdmin({ status: orderStatusFilter }),
      ]);
      setStats(statsData);
      setCategories(catsData);
      setProducts(prodsData);
      setOrders(ordersData);
    } catch (err) {
      setError(err.message || 'Failed to load admin dashboard.');
    } finally {
      setLoading(false);
    }
  }, [orderStatusFilter]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // --- Product Handlers ---
  const openCreateProduct = () => {
    setEditingProductId(null);
    setProductForm({
      ...INITIAL_PRODUCT_FORM,
      category_id: categories[0]?.id || '',
    });
    setProductModalOpen(true);
  };

  const openEditProduct = (product) => {
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      category_id: product.category_id,
      description: product.description || '',
      price_inr: String(product.price_inr),
      image_url: product.image_url || '',
      prep_time_mins: String(product.prep_time_mins || 25),
      rating: String(product.rating || 4.5),
      is_veg: Boolean(product.is_veg),
      is_available: Boolean(product.is_available),
      is_featured: Boolean(product.is_featured),
      is_popular: Boolean(product.is_popular),
    });
    setProductModalOpen(true);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const uploaded = await api.uploadProductImage(file);
      setProductForm((prev) => ({ ...prev, image_url: uploaded.url }));
      showToast('Food image uploaded');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.category_id) {
      showToast('Please select a category.', 'error');
      return;
    }
    setSavingProduct(true);
    try {
      const payload = {
        ...productForm,
        price_inr: Number(productForm.price_inr),
        prep_time_mins: parseInt(productForm.prep_time_mins, 10) || 25,
        rating: Number(productForm.rating) || 4.5,
      };
      if (editingProductId) {
        await api.updateProduct(editingProductId, payload);
        showToast('Product updated');
      } else {
        await api.createProduct(payload);
        showToast('New food product added');
      }
      setProductModalOpen(false);
      await loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleToggleAvailability = async (product) => {
    try {
      const updated = await api.toggleProductAvailability(product.id, !product.is_available);
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      showToast(
        `${updated.name} marked as ${updated.is_available ? 'Available' : 'Unavailable'}`
      );
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? Past orders retain snapshots.`)) return;
    try {
      await api.deleteProduct(product.id);
      showToast('Product deleted');
      await loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // --- Category Handlers ---
  const openCreateCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm(INITIAL_CATEGORY_FORM);
    setCategoryModalOpen(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({
      name: cat.name,
      description: cat.description || '',
      image_url: cat.image_url || '',
      sort_order: String(cat.sort_order ?? 0),
      is_active: Boolean(cat.is_active),
    });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    setSavingCategory(true);
    try {
      const payload = {
        ...categoryForm,
        sort_order: parseInt(categoryForm.sort_order, 10) || 0,
      };
      if (editingCategoryId) {
        await api.updateCategory(editingCategoryId, payload);
        showToast('Category updated');
      } else {
        await api.createCategory(payload);
        showToast('Category created');
      }
      setCategoryModalOpen(false);
      await loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await api.deleteCategory(cat.id);
      showToast('Category deleted');
      await loadDashboard();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // --- Order Status Handler ---
  const handleStatusChange = async (orderId, nextStatus) => {
    try {
      const updated = await api.updateOrderStatus(orderId, nextStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) setSelectedOrder(updated);
      showToast(`Order status updated to ${nextStatus}`);
      api.getAdminStats().then(setStats).catch(() => null);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Admin Console
          </span>
          <h1 className="font-display font-extrabold text-3xl text-charcoal-900">
            QuickBite Operations
          </h1>
        </div>
        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-orange-200 text-sm font-semibold text-charcoal-800 hover:bg-cream-100"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-1.5 rounded-2xl border border-orange-100 shadow-sm w-fit">
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'orders', label: `Orders (${orders.length})`, icon: Package },
          { id: 'products', label: `Products (${products.length})`, icon: Utensils },
          { id: 'categories', label: `Categories (${categories.length})`, icon: FolderKanban },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition ${
                active
                  ? 'bg-charcoal-900 text-white shadow-sm'
                  : 'text-gray-600 hover:text-charcoal-900 hover:bg-cream-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <ErrorState title="Admin data unavailable" message={error} onRetry={loadDashboard} />
      ) : loading && !stats ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white border border-orange-100 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-8">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  {
                    label: 'Total Revenue',
                    value: formatINR(stats.totalRevenueInr),
                    sub: 'Excludes cancelled orders',
                    icon: IndianRupee,
                    color: 'bg-emerald-50 text-emerald-700',
                  },
                  {
                    label: 'Total Orders',
                    value: stats.totalOrders,
                    sub: `${stats.activeOrders} currently active`,
                    icon: ShoppingBag,
                    color: 'bg-brand-50 text-brand-700',
                  },
                  {
                    label: 'Pending Orders',
                    value: stats.pendingOrders,
                    sub: 'Awaiting kitchen confirmation',
                    icon: Clock,
                    color: 'bg-amber-50 text-amber-700',
                  },
                  {
                    label: 'Total Products',
                    value: stats.totalProducts,
                    sub: `${stats.availableProducts} available on menu`,
                    icon: Utensils,
                    color: 'bg-indigo-50 text-indigo-700',
                  },
                ].map((kpi) => {
                  const Icon = kpi.icon;
                  return (
                    <div
                      key={kpi.label}
                      className="bg-white rounded-2xl p-5 border border-orange-100 shadow-card"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          {kpi.label}
                        </span>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="font-display font-extrabold text-2xl text-charcoal-900">
                        {kpi.value}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{kpi.sub}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-card">
                <h2 className="font-display font-bold text-lg text-charcoal-900 mb-4">
                  Order Pipeline Breakdown
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {ORDER_STATUSES.map((status) => (
                    <div
                      key={status}
                      className="p-4 rounded-xl bg-cream-50 border border-orange-100 text-center"
                    >
                      <p className="font-display font-extrabold text-2xl text-charcoal-900">
                        {stats.statusBreakdown?.[status] || 0}
                      </p>
                      <p className="text-xs font-semibold text-gray-600 mt-1">{status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {['All', ...ORDER_STATUSES].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setOrderStatusFilter(status)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                      orderStatusFilter === status
                        ? 'bg-brand-600 text-white'
                        : 'bg-white border border-orange-100 text-charcoal-800 hover:bg-cream-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <div className="bg-white rounded-2xl border border-orange-100 shadow-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-cream-50 border-b border-orange-100 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-5 py-3.5">Order ID</th>
                        <th className="px-5 py-3.5">Customer</th>
                        <th className="px-5 py-3.5">Items</th>
                        <th className="px-5 py-3.5">Total</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-50">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-10 text-center text-gray-500">
                            No orders match this filter.
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order.id} className="hover:bg-cream-50/50">
                            <td className="px-5 py-4">
                              <p className="font-bold text-charcoal-900">{order.order_number}</p>
                              <p className="text-xs text-gray-500">
                                {formatDateTime(order.created_at)}
                              </p>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-charcoal-900">
                                {order.customer_name}
                              </p>
                              <p className="text-xs text-gray-500">{order.customer_phone}</p>
                            </td>
                            <td className="px-5 py-4 text-xs text-gray-700">
                              {(order.order_items || []).reduce((s, i) => s + i.quantity, 0)} items
                              <div className="text-[11px] text-gray-500">
                                {formatPaymentLabel(order.payment_method, order.is_demo_payment)}
                              </div>
                            </td>
                            <td className="px-5 py-4 font-bold text-charcoal-900">
                              {formatINR(order.total_inr)}
                            </td>
                            <td className="px-5 py-4">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                              >
                                {ORDER_STATUSES.map((st) => (
                                  <option key={st} value={st}>
                                    {st}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-5 py-4">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                className="text-xs font-bold text-brand-600 hover:underline"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={openCreateProduct}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Food Product
                </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl border border-orange-100 shadow-card overflow-hidden flex flex-col"
                  >
                    <div className="relative h-40 bg-cream-100">
                      <ImageWithFallback
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          product.is_available
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {product.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-brand-600">
                            {product.categories?.name}
                          </span>
                          <VegBadge isVeg={product.is_veg} />
                        </div>
                        <h3 className="font-display font-bold text-base text-charcoal-900 mt-1">
                          {product.name}
                        </h3>
                        <p className="font-bold text-sm text-charcoal-800 mt-1">
                          {formatINR(product.price_inr)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-orange-50 gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(product)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                            product.is_available
                              ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {product.is_available ? 'Mark Sold Out' : 'Mark Available'}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditProduct(product)}
                            className="p-2 rounded-lg text-gray-600 hover:bg-cream-100"
                            aria-label="Edit product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product)}
                            className="p-2 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                            aria-label="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CATEGORIES TAB */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={openCreateCategory}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  Add Category
                </button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white rounded-2xl p-4 border border-orange-100 shadow-card flex items-center gap-4"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-cream-100">
                      <ImageWithFallback
                        src={cat.image_url}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-base text-charcoal-900 truncate">
                          {cat.name}
                        </h3>
                        {!cat.is_active && (
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-bold text-gray-500">
                            Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => openEditCategory(cat)}
                        className="p-2 rounded-lg text-gray-600 hover:bg-cream-100"
                        aria-label="Edit category"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-2 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50"
                        aria-label="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-orange-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-xl text-charcoal-900">
                  {selectedOrder.order_number}
                </h3>
                <p className="text-xs text-gray-500">{formatDateTime(selectedOrder.created_at)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <StatusBadge status={selectedOrder.status} />
              <span className="text-xs font-semibold text-gray-600">
                {formatPaymentLabel(selectedOrder.payment_method, selectedOrder.is_demo_payment)}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-cream-50 text-sm space-y-1">
              <p className="font-bold text-charcoal-900">{selectedOrder.customer_name}</p>
              <p className="text-xs text-gray-600">{selectedOrder.customer_phone}</p>
              <p className="text-xs text-gray-700">{selectedOrder.delivery_address}</p>
              {selectedOrder.notes && (
                <p className="text-xs text-brand-700 font-medium pt-1">
                  Note: {selectedOrder.notes}
                </p>
              )}
            </div>

            <div className="space-y-2 text-sm">
              {(selectedOrder.order_items || []).map((item) => (
                <div key={item.id} className="flex justify-between py-1.5 border-b border-orange-50">
                  <span>
                    <strong>{item.quantity}&times;</strong> {item.product_name_snapshot}
                  </span>
                  <span className="font-semibold">{formatINR(item.line_total_inr)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-base pt-2">
                <span>Grand Total</span>
                <span className="text-brand-600">{formatINR(selectedOrder.total_inr)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT MODAL */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveProduct}
            className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-orange-100 pb-3">
              <h3 className="font-display font-bold text-xl text-charcoal-900">
                {editingProductId ? 'Edit Food Product' : 'Add New Food Product'}
              </h3>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="p-2 rounded-xl hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Category *</label>
                <select
                  required
                  value={productForm.category_id}
                  onChange={(e) =>
                    setProductForm({ ...productForm, category_id: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Description</label>
              <textarea
                rows={2}
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">Price (INR) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={productForm.price_inr}
                  onChange={(e) => setProductForm({ ...productForm, price_inr: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Prep Mins</label>
                <input
                  type="number"
                  min="5"
                  value={productForm.prep_time_mins}
                  onChange={(e) =>
                    setProductForm({ ...productForm, prep_time_mins: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Rating (0-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={productForm.rating}
                  onChange={(e) => setProductForm({ ...productForm, rating: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold">Food Image URL or Upload</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                />
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cream-100 hover:bg-orange-100 text-xs font-bold text-charcoal-900 cursor-pointer shrink-0">
                  <ImagePlus className="w-4 h-4 text-brand-600" />
                  {uploadingImage ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs font-semibold">
              {[
                { key: 'is_veg', label: 'Vegetarian' },
                { key: 'is_available', label: 'Available' },
                { key: 'is_featured', label: 'Featured' },
                { key: 'is_popular', label: 'Popular' },
              ].map((flag) => (
                <label key={flag.key} className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productForm[flag.key]}
                    onChange={(e) =>
                      setProductForm({ ...productForm, [flag.key]: e.target.checked })
                    }
                  />
                  {flag.label}
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-orange-100">
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingProduct}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-600 text-white text-sm font-bold"
              >
                <Check className="w-4 h-4" />
                {savingProduct ? 'Saving...' : 'Save Dish'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveCategory}
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-orange-100 pb-3">
              <h3 className="font-display font-bold text-xl text-charcoal-900">
                {editingCategoryId ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="p-2 rounded-xl hover:bg-cream-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Category Name *</label>
              <input
                type="text"
                required
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1">Description</label>
              <textarea
                rows={2}
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, description: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-bold mb-1">Image URL</label>
                <input
                  type="url"
                  value={categoryForm.image_url}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, image_url: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Sort Order</label>
                <input
                  type="number"
                  value={categoryForm.sort_order}
                  onChange={(e) =>
                    setCategoryForm({ ...categoryForm, sort_order: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-xs font-semibold">
              <input
                type="checkbox"
                checked={categoryForm.is_active}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, is_active: e.target.checked })
                }
              />
              Visible to customers
            </label>

            <div className="flex justify-end gap-2 pt-3 border-t border-orange-100">
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingCategory}
                className="px-5 py-2 rounded-xl bg-brand-600 text-white text-sm font-bold"
              >
                {savingCategory ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
