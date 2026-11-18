import { supabaseAdmin } from '../config/supabase.js';
import { ApiError, isUuid, requireNonEmptyString, validatePhone } from '../middleware/validate.js';

const ALLOWED_ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Preparing',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
];

const ALLOWED_PAYMENT_METHODS = ['cod', 'demo_card', 'demo_upi'];

function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `QB-${y}${m}${d}-${rand}`;
}

/**
 * Places a customer order.
 * CRITICAL SECURITY INVARIANT:
 * - Never trusts product names, unit prices, or order totals from the client.
 * - Fetches current product rows from PostgreSQL, rejects unavailable items,
 *   computes subtotal, delivery fee, GST, and grand total strictly on the server.
 */
export async function createOrder(req, res, next) {
  try {
    const customer_name = requireNonEmptyString(req.body.customer_name, 'Customer name', 2, 100);
    const customer_phone = validatePhone(req.body.customer_phone);
    const delivery_address = requireNonEmptyString(
      req.body.delivery_address,
      'Delivery address',
      8,
      400
    );
    const payment_method = req.body.payment_method;
    if (!ALLOWED_PAYMENT_METHODS.includes(payment_method)) {
      throw new ApiError(400, 'Invalid payment method. Choose Cash on Delivery or Demo Payment.');
    }

    const notes = typeof req.body.notes === 'string' ? req.body.notes.trim().slice(0, 300) : '';
    const rawItems = req.body.items;

    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new ApiError(400, 'Your cart is empty. Add at least one dish before placing an order.');
    }

    // Aggregate quantities per product_id
    const qtyByProductId = new Map();
    for (const item of rawItems) {
      if (!item || !isUuid(item.product_id)) {
        throw new ApiError(400, 'Each order item must reference a valid product ID.');
      }
      const qty = parseInt(item.quantity, 10);
      if (!Number.isFinite(qty) || qty <= 0 || qty > 50) {
        throw new ApiError(400, 'Item quantity must be between 1 and 50.');
      }
      qtyByProductId.set(item.product_id, (qtyByProductId.get(item.product_id) || 0) + qty);
    }

    const productIds = Array.from(qtyByProductId.keys());
    const { data: dbProducts, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name, price_inr, image_url, is_available')
      .in('id', productIds);

    if (productsError) {
      throw new ApiError(500, 'Failed to verify menu items.', productsError.message);
    }

    const productMap = new Map((dbProducts || []).map((p) => [p.id, p]));

    let subtotal_inr = 0;
    const orderItemsToInsert = [];

    for (const [productId, quantity] of qtyByProductId.entries()) {
      const product = productMap.get(productId);
      if (!product) {
        throw new ApiError(404, 'One or more dishes in your cart no longer exist.');
      }
      if (!product.is_available) {
        throw new ApiError(
          400,
          `"${product.name}" is currently unavailable. Please remove it from your cart to proceed.`
        );
      }

      const unitPrice = Number(product.price_inr);
      const lineTotal = Math.round(unitPrice * quantity * 100) / 100;
      subtotal_inr = Math.round((subtotal_inr + lineTotal) * 100) / 100;

      orderItemsToInsert.push({
        product_id: product.id,
        product_name_snapshot: product.name,
        product_image_snapshot: product.image_url || '',
        unit_price_inr_snapshot: unitPrice,
        quantity,
        line_total_inr: lineTotal,
      });
    }

    // Server-side fee calculation: ₹40 delivery fee (Free on orders ₹499+) + 5% GST
    const delivery_fee_inr = subtotal_inr >= 499 ? 0 : 40;
    const tax_inr = Math.round(subtotal_inr * 0.05 * 100) / 100;
    const total_inr = Math.round((subtotal_inr + delivery_fee_inr + tax_inr) * 100) / 100;

    const is_demo_payment = payment_method !== 'cod';
    const payment_status = is_demo_payment ? 'demo_paid' : 'pending';
    const order_number = generateOrderNumber();

    const { data: createdOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        order_number,
        user_id: req.user.id,
        customer_name,
        customer_phone,
        delivery_address,
        payment_method,
        payment_status,
        is_demo_payment,
        subtotal_inr,
        delivery_fee_inr,
        tax_inr,
        total_inr,
        status: 'Pending',
        notes,
      })
      .select()
      .single();

    if (orderError) {
      throw new ApiError(500, 'Failed to create order.', orderError.message);
    }

    const itemsWithOrderId = orderItemsToInsert.map((item) => ({
      ...item,
      order_id: createdOrder.id,
    }));

    const { data: insertedItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemsWithOrderId)
      .select();

    if (itemsError) {
      await supabaseAdmin.from('orders').delete().eq('id', createdOrder.id);
      throw new ApiError(500, 'Failed to record order items.', itemsError.message);
    }

    res.status(201).json({
      success: true,
      data: {
        ...createdOrder,
        order_items: insertedItems || [],
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listMyOrders(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items (*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, 'Failed to fetch your orders.', error.message);

    res.json({ success: true, data: data || [] });
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) throw new ApiError(400, 'Invalid order ID.');

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, order_items (*)')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new ApiError(500, 'Failed to fetch order.', error.message);
    if (!data) throw new ApiError(404, 'Order not found.');

    if (data.user_id !== req.user.id && req.profile?.role !== 'admin') {
      throw new ApiError(403, 'You do not have permission to view this order.');
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getAdminDashboardStats(req, res, next) {
  try {
    const [{ data: orders, error: ordersErr }, { data: products, error: productsErr }] =
      await Promise.all([
        supabaseAdmin
          .from('orders')
          .select('id, status, total_inr, created_at, order_number, customer_name'),
        supabaseAdmin.from('products').select('id, is_available'),
      ]);

    if (ordersErr) throw new ApiError(500, 'Failed to load order stats.', ordersErr.message);
    if (productsErr) throw new ApiError(500, 'Failed to load product stats.', productsErr.message);

    const allOrders = orders || [];
    const allProducts = products || [];

    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter((o) => o.status === 'Pending').length;
    const activeOrders = allOrders.filter(
      (o) => !['Delivered', 'Cancelled'].includes(o.status)
    ).length;
    const totalRevenueInr = allOrders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + Number(o.total_inr || 0), 0);

    const statusBreakdown = ALLOWED_ORDER_STATUSES.reduce((acc, status) => {
      acc[status] = allOrders.filter((o) => o.status === status).length;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        activeOrders,
        totalProducts: allProducts.length,
        availableProducts: allProducts.filter((p) => p.is_available).length,
        totalRevenueInr: Math.round(totalRevenueInr * 100) / 100,
        statusBreakdown,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listAllOrdersAdmin(req, res, next) {
  try {
    const { status, search } = req.query;

    let query = supabaseAdmin
      .from('orders')
      .select('*, order_items (*)')
      .order('created_at', { ascending: false });

    if (status && status !== 'All') {
      if (!ALLOWED_ORDER_STATUSES.includes(status)) {
        throw new ApiError(400, 'Invalid order status filter.');
      }
      query = query.eq('status', status);
    }

    if (search && String(search).trim()) {
      const term = String(search).trim().replace(/[%_]/g, '');
      query = query.or(`order_number.ilike.%${term}%,customer_name.ilike.%${term}%`);
    }

    const { data, error } = await query;
    if (error) throw new ApiError(500, 'Failed to fetch customer orders.', error.message);

    res.json({ success: true, data: data || [] });
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatusAdmin(req, res, next) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) throw new ApiError(400, 'Invalid order ID.');

    const { status } = req.body;
    if (!ALLOWED_ORDER_STATUSES.includes(status)) {
      throw new ApiError(
        400,
        `Invalid status. Must be one of: ${ALLOWED_ORDER_STATUSES.join(', ')}.`
      );
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select('*, order_items (*)')
      .maybeSingle();

    if (error) throw new ApiError(500, 'Failed to update order status.', error.message);
    if (!data) throw new ApiError(404, 'Order not found.');

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}
