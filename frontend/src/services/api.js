import { supabase } from '../lib/supabase';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

async function getAccessToken() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token || null;
}

async function request(path, options = {}) {
  const { method = 'GET', body, auth = false, isFormData = false } = options;

  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (auth) {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Please log in to continue.');
    }
    headers.Authorization = `Bearer ${token}`;
  } else {
    const token = await getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      `Unable to reach the QuickBite API server at ${API_BASE_URL}. Make sure the backend server is running.`
    );
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }

  return payload.data;
}

export const api = {
  // Public Health
  health: () => request('/health'),

  // Categories
  getCategories: (includeInactive = false) =>
    request(`/categories${includeInactive ? '?includeInactive=true' : ''}`),
  createCategory: (data) => request('/categories', { method: 'POST', body: data, auth: true }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: data, auth: true }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE', auth: true }),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') {
        query.set(k, String(v));
      }
    });
    const qs = query.toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },
  getProductById: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', body: data, auth: true }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data, auth: true }),
  toggleProductAvailability: (id, is_available) =>
    request(`/products/${id}/availability`, {
      method: 'PATCH',
      body: is_available !== undefined ? { is_available } : {},
      auth: true,
    }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE', auth: true }),

  // Profile & Addresses
  getProfile: () => request('/profile', { auth: true }),
  updateProfile: (data) => request('/profile', { method: 'PUT', body: data, auth: true }),
  getAddresses: () => request('/profile/addresses', { auth: true }),
  createAddress: (data) => request('/profile/addresses', { method: 'POST', body: data, auth: true }),
  updateAddress: (id, data) =>
    request(`/profile/addresses/${id}`, { method: 'PUT', body: data, auth: true }),
  deleteAddress: (id) => request(`/profile/addresses/${id}`, { method: 'DELETE', auth: true }),

  // Customer Orders
  placeOrder: (data) => request('/orders', { method: 'POST', body: data, auth: true }),
  getMyOrders: () => request('/orders/my', { auth: true }),
  getOrderById: (id) => request(`/orders/${id}`, { auth: true }),

  // Admin Operations
  getAdminStats: () => request('/admin/stats', { auth: true }),
  getAllOrdersAdmin: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    const qs = query.toString();
    return request(`/admin/orders${qs ? `?${qs}` : ''}`, { auth: true });
  },
  updateOrderStatus: (id, status) =>
    request(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status }, auth: true }),
  uploadProductImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return request('/admin/upload-image', {
      method: 'POST',
      body: formData,
      auth: true,
      isFormData: true,
    });
  },
};
