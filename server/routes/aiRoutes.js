const express = require('express');
const { classifyComplaint } = require('../controllers/aiController');

const router = express.Router();
const requestCounts = new Map();
const rateLimitWindowMs = 60 * 1000;
const maxRequestsPerWindow = 30;

router.post('/classify-complaint', (req, res, next) => {
  const now = Date.now();
  const key = req.ip;
  const current = requestCounts.get(key);

  if (!current || current.expiresAt <= now) {
    requestCounts.set(key, { count: 1, expiresAt: now + rateLimitWindowMs });
  } else if (current.count >= maxRequestsPerWindow) {
    res.set('Retry-After', String(Math.ceil((current.expiresAt - now) / 1000)));
    return res.status(429).json({
      success: false,
      message: 'Too many AI analysis requests. Please wait a minute and try again.',
    });
  } else {
    current.count += 1;
  }

  if (requestCounts.size > 10000) {
    for (const [ip, entry] of requestCounts) {
      if (entry.expiresAt <= now) requestCounts.delete(ip);
    }
  }

  return next();
}, classifyComplaint);

module.exports = router;
