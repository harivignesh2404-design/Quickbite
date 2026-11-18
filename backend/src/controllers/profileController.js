import { supabaseAdmin } from '../config/supabase.js';
import { ApiError, isUuid, requireNonEmptyString, validatePhone } from '../middleware/validate.js';

export async function getMyProfile(req, res) {
  res.json({ success: true, data: req.profile });
}

export async function updateMyProfile(req, res, next) {
  try {
    const full_name = requireNonEmptyString(req.body.full_name, 'Full name', 2, 100);
    const phone = req.body.phone ? validatePhone(req.body.phone) : '';

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ full_name, phone })
      .eq('id', req.user.id)
      .select('id, full_name, email, phone, role, created_at, updated_at')
      .single();

    if (error) throw new ApiError(500, 'Failed to update profile.', error.message);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function listMyAddresses(req, res, next) {
  try {
    const { data, error } = await supabaseAdmin
      .from('addresses')
      .select('*')
      .eq('user_id', req.user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw new ApiError(500, 'Failed to fetch saved addresses.', error.message);
    res.json({ success: true, data: data || [] });
  } catch (err) {
    next(err);
  }
}

export async function createMyAddress(req, res, next) {
  try {
    const label = requireNonEmptyString(req.body.label || 'Home', 'Address label', 2, 30);
    const recipient_name = requireNonEmptyString(req.body.recipient_name, 'Recipient name', 2, 100);
    const phone = validatePhone(req.body.phone);
    const street_address = requireNonEmptyString(req.body.street_address, 'Street address', 5, 250);
    const landmark = typeof req.body.landmark === 'string' ? req.body.landmark.trim() : '';
    const city = requireNonEmptyString(req.body.city, 'City', 2, 80);
    const pincode = requireNonEmptyString(req.body.pincode, 'Pincode', 4, 12);
    const is_default = Boolean(req.body.is_default);

    if (is_default) {
      await supabaseAdmin
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', req.user.id);
    }

    const { data, error } = await supabaseAdmin
      .from('addresses')
      .insert({
        user_id: req.user.id,
        label,
        recipient_name,
        phone,
        street_address,
        landmark,
        city,
        pincode,
        is_default,
      })
      .select()
      .single();

    if (error) throw new ApiError(500, 'Failed to save address.', error.message);

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function updateMyAddress(req, res, next) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) throw new ApiError(400, 'Invalid address ID.');

    const updates = {};
    if (req.body.label !== undefined) {
      updates.label = requireNonEmptyString(req.body.label, 'Address label', 2, 30);
    }
    if (req.body.recipient_name !== undefined) {
      updates.recipient_name = requireNonEmptyString(req.body.recipient_name, 'Recipient name', 2, 100);
    }
    if (req.body.phone !== undefined) updates.phone = validatePhone(req.body.phone);
    if (req.body.street_address !== undefined) {
      updates.street_address = requireNonEmptyString(req.body.street_address, 'Street address', 5, 250);
    }
    if (req.body.landmark !== undefined) updates.landmark = String(req.body.landmark || '').trim();
    if (req.body.city !== undefined) updates.city = requireNonEmptyString(req.body.city, 'City', 2, 80);
    if (req.body.pincode !== undefined) {
      updates.pincode = requireNonEmptyString(req.body.pincode, 'Pincode', 4, 12);
    }
    if (req.body.is_default !== undefined) {
      updates.is_default = Boolean(req.body.is_default);
      if (updates.is_default) {
        await supabaseAdmin
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', req.user.id);
      }
    }

    const { data, error } = await supabaseAdmin
      .from('addresses')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .maybeSingle();

    if (error) throw new ApiError(500, 'Failed to update address.', error.message);
    if (!data) throw new ApiError(404, 'Address not found.');

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function deleteMyAddress(req, res, next) {
  try {
    const { id } = req.params;
    if (!isUuid(id)) throw new ApiError(400, 'Invalid address ID.');

    const { error } = await supabaseAdmin
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) throw new ApiError(500, 'Failed to delete address.', error.message);

    res.json({ success: true, message: 'Address removed.' });
  } catch (err) {
    next(err);
  }
}
