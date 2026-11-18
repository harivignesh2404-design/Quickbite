import { supabaseAdmin } from '../config/supabase.js';
import {
  ApiError,
  isUuid,
  requireNonEmptyString,
  slugify,
  validatePrice,
} from '../middleware/validate.js';

export async function listProducts(req, res, next) {
  try {
    const {
      category,
      search,
      veg,
      featured,
      popular,
      availableOnly,
      sort = 'popular',
    } = req.query;

    let query = supabaseAdmin
      .from('products')
      .select(
        `
        id,
        category_id,
        name,
        slug,
        description,
        price_inr,
        image_url,
        is_veg,
        is_available,
        is_featured,
        is_popular,
        prep_time_mins,
        rating,
        created_at,
        updated_at,
        categories (
          id,
          name,
          slug
        )
      `
      );

    if (category && category !== 'all') {
      if (isUuid(category)) {
        query = query.eq('category_id', category);
      } else {
        const { data: catRow } = await supabaseAdmin
          .from('categories')
          .select('id')
          .eq('slug', String(category).trim().toLowerCase())
          .maybeSingle();

        if (!catRow) {
          return res.json({ success: true, data: [] });
        }
        query = query.eq('category_id', catRow.id);
      }
    }

    if (veg === 'true') query = query.eq('is_veg', true);
    if (veg === 'false') query = query.eq('is_veg', false);
    if (featured === 'true') query = query.eq('is_featured', true);
    if (popular === 'true') query = query.eq('is_popular', true);
    if (availableOnly === 'true') query = query.eq('is_available', true);

    if (search && String(search).trim()) {
      const term = String(search).trim().replace(/[%_]/g, '');
      query = query.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
    }

    switch (sort) {
      case 'price_asc':
        query = query.order('price_inr', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price_inr', { ascending: false });
        break;
      case 'rating':
        query = query.order('rating', { ascending: false });
        break;
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query
          .order('is_popular', { ascending: false })
          .order('rating', { ascending: false })
          .order('created_at', { ascending: false });
        break;
    }

    const { data, error } = await query;
    if (error) throw new ApiError(500, 'Failed to fetch food items.', error.message);

    res.json({ success: true, data: data || [] });
  } catch (err) {
    next(err);
  }
}

export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const column = isUuid(id) ? 'id' : 'slug';

    const { data, error } = await supabaseAdmin
      .from('products')
      .select(
        `
        id,
        category_id,
        name,
        slug,
        description,
        price_inr,
        image_url,
        is_veg,
        is_available,
        is_featured,
        is_popular,
        prep_time_mins,
        rating,
        created_at,
        updated_at,
        categories (
          id,
          name,
          slug
        )
      `
      )
      .eq(column, id)
      .maybeSingle();

    if (error) throw new ApiError(500, 'Failed to fetch food item.', error.message);
    if (!data) throw new ApiError(404, 'Food item not found.');

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const name = requireNonEmptyString(req.body.name, 'Product name', 2, 120);
    const category_id = req.body.category_id;
    if (!isUuid(category_id)) throw new ApiError(400, 'A valid category is required.');

    const price_inr = validatePrice(req.body.price_inr, 'Price (INR)');
    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const image_url = typeof req.body.image_url === 'string' ? req.body.image_url.trim() : '';
    const prep_time_mins = Math.max(5, parseInt(req.body.prep_time_mins, 10) || 25);
    const ratingRaw = Number(req.body.rating);
    const rating = Number.isFinite(ratingRaw) ? Math.min(5, Math.max(0, ratingRaw)) : 4.5;

    const baseSlug = slugify(req.body.slug || name) || 'dish';
    const uniqueSlug = `${baseSlug}-${Date.now().toString(36).slice(-4)}`;

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        category_id,
        name,
        slug: uniqueSlug,
        description,
        price_inr,
        image_url,
        is_veg: req.body.is_veg !== undefined ? Boolean(req.body.is_veg) : true,
        is_available: req.body.is_available !== undefined ? Boolean(req.body.is_available) : true,
        is_featured: Boolean(req.body.is_featured),
        is_popular: Boolean(req.body.is_popular),
        prep_time_mins,
        rating,
      })
      .select('*, categories (id, name, slug)')
      .single();

    if (error) {
      if (error.code === '23503') throw new ApiError(400, 'Selected category does not exist.');
      throw new ApiError(500, 'Failed to create food product.', error.message);
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) throw new ApiError(400, 'Invalid product ID.');

    const updates = {};
    if (req.body.name !== undefined) {
      updates.name = requireNonEmptyString(req.body.name, 'Product name', 2, 120);
    }
    if (req.body.category_id !== undefined) {
      if (!isUuid(req.body.category_id)) throw new ApiError(400, 'Invalid category ID.');
      updates.category_id = req.body.category_id;
    }
    if (req.body.description !== undefined) {
      updates.description = String(req.body.description || '').trim();
    }
    if (req.body.price_inr !== undefined) {
      updates.price_inr = validatePrice(req.body.price_inr, 'Price (INR)');
    }
    if (req.body.image_url !== undefined) {
      updates.image_url = String(req.body.image_url || '').trim();
    }
    if (req.body.is_veg !== undefined) updates.is_veg = Boolean(req.body.is_veg);
    if (req.body.is_available !== undefined) updates.is_available = Boolean(req.body.is_available);
    if (req.body.is_featured !== undefined) updates.is_featured = Boolean(req.body.is_featured);
    if (req.body.is_popular !== undefined) updates.is_popular = Boolean(req.body.is_popular);
    if (req.body.prep_time_mins !== undefined) {
      const mins = parseInt(req.body.prep_time_mins, 10);
      if (!Number.isFinite(mins) || mins <= 0) {
        throw new ApiError(400, 'Preparation time must be a positive number of minutes.');
      }
      updates.prep_time_mins = mins;
    }
    if (req.body.rating !== undefined) {
      const r = Number(req.body.rating);
      if (!Number.isFinite(r) || r < 0 || r > 5) {
        throw new ApiError(400, 'Rating must be between 0 and 5.');
      }
      updates.rating = Math.round(r * 10) / 10;
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, 'No fields provided to update.');
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select('*, categories (id, name, slug)')
      .maybeSingle();

    if (error) throw new ApiError(500, 'Failed to update product.', error.message);
    if (!data) throw new ApiError(404, 'Product not found.');

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function toggleProductAvailability(req, res, next) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) throw new ApiError(400, 'Invalid product ID.');

    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('products')
      .select('id, is_available')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) throw new ApiError(500, 'Failed to fetch product.', fetchErr.message);
    if (!existing) throw new ApiError(404, 'Product not found.');

    const nextAvailable =
      req.body.is_available !== undefined ? Boolean(req.body.is_available) : !existing.is_available;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update({ is_available: nextAvailable })
      .eq('id', id)
      .select('*, categories (id, name, slug)')
      .single();

    if (error) throw new ApiError(500, 'Failed to update product availability.', error.message);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) throw new ApiError(400, 'Invalid product ID.');

    const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
    if (error) throw new ApiError(500, 'Failed to delete product.', error.message);

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function uploadProductImage(req, res, next) {
  try {
    if (!req.file) {
      throw new ApiError(400, 'Please choose an image file to upload.');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      throw new ApiError(400, 'Only JPG, PNG, WebP, or AVIF images are supported.');
    }

    const ext = req.file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `dishes/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      throw new ApiError(
        500,
        'Failed to upload image to Supabase Storage. Ensure the "product-images" bucket exists.',
        uploadError.message
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filePath);

    res.status(201).json({
      success: true,
      data: {
        path: filePath,
        url: publicUrlData.publicUrl,
      },
    });
  } catch (err) {
    next(err);
  }
}
