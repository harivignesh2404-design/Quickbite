import { supabaseAdmin } from '../config/supabase.js';
import { ApiError, isUuid, requireNonEmptyString, slugify } from '../middleware/validate.js';

export async function listCategories(req, res, next) {
  try {
    const includeInactive = req.query.includeInactive === 'true' && req.profile?.role === 'admin';

    let query = supabaseAdmin
      .from('categories')
      .select('id, name, slug, description, image_url, sort_order, is_active, created_at, updated_at')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw new ApiError(500, 'Failed to fetch categories.', error.message);

    res.json({ success: true, data: data || [] });
  } catch (err) {
    next(err);
  }
}

export async function createCategory(req, res, next) {
  try {
    const name = requireNonEmptyString(req.body.name, 'Category name', 2, 80);
    const slug = slugify(req.body.slug || name);
    if (!slug) throw new ApiError(400, 'Category slug could not be generated.');

    const description = typeof req.body.description === 'string' ? req.body.description.trim() : '';
    const image_url = typeof req.body.image_url === 'string' ? req.body.image_url.trim() : '';
    const sort_order = Number.isInteger(Number(req.body.sort_order)) ? Number(req.body.sort_order) : 0;
    const is_active = req.body.is_active !== undefined ? Boolean(req.body.is_active) : true;

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({ name, slug, description, image_url, sort_order, is_active })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new ApiError(409, 'A category with this name or slug already exists.');
      }
      throw new ApiError(500, 'Failed to create category.', error.message);
    }

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) throw new ApiError(400, 'Invalid category ID.');

    const updates = {};
    if (req.body.name !== undefined) {
      updates.name = requireNonEmptyString(req.body.name, 'Category name', 2, 80);
      if (req.body.slug === undefined) {
        updates.slug = slugify(updates.name);
      }
    }
    if (req.body.slug !== undefined) {
      updates.slug = slugify(req.body.slug);
    }
    if (req.body.description !== undefined) {
      updates.description = String(req.body.description || '').trim();
    }
    if (req.body.image_url !== undefined) {
      updates.image_url = String(req.body.image_url || '').trim();
    }
    if (req.body.sort_order !== undefined) {
      updates.sort_order = Number(req.body.sort_order) || 0;
    }
    if (req.body.is_active !== undefined) {
      updates.is_active = Boolean(req.body.is_active);
    }

    if (Object.keys(updates).length === 0) {
      throw new ApiError(400, 'No category fields provided to update.');
    }

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      if (error.code === '23505') {
        throw new ApiError(409, 'Another category already uses that name or slug.');
      }
      throw new ApiError(500, 'Failed to update category.', error.message);
    }
    if (!data) throw new ApiError(404, 'Category not found.');

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) throw new ApiError(400, 'Invalid category ID.');

    const { error } = await supabaseAdmin.from('categories').delete().eq('id', id);

    if (error) {
      if (error.code === '23503') {
        throw new ApiError(
          409,
          'Cannot delete category because food items are still assigned to it. Move or delete those items first.'
        );
      }
      throw new ApiError(500, 'Failed to delete category.', error.message);
    }

    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    next(err);
  }
}
