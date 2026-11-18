import { ApiError } from './validate.js';

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err, req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Handle Multer upload errors cleanly
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: 'Uploaded image must be smaller than 5 MB.',
    });
  }

  console.error('[QuickBite API Error]', err);
  return res.status(500).json({
    success: false,
    error: err?.message || 'An unexpected server error occurred.',
  });
}
