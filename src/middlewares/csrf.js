import crypto from 'crypto';

const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';

// Issue a CSRF token via cookie and response body (double-submit cookie pattern)
export const issueCsrfToken = (req, res) => {
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie('csrf_token', token, {
    httpOnly: false, // must be readable by frontend to set header
    sameSite: 'none',
    secure: isProd,
    path: '/',
  });
  res.json({ csrfToken: token });
};

// Require x-csrf-token header to match csrf_token cookie for non-GET methods
export const csrfProtection = (req, res, next) => {
  const method = req.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) return next();

  const hasSessionCookie = Boolean(req.cookies?.access_token);
  if (!hasSessionCookie) return next();

  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.headers['x-csrf-token'];
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({ message: 'CSRF token invalide ou manquant' });
  }
  next();
};