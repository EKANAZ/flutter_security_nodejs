const rateLimit = require('express-rate-limit');

const highSecurityRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

const mediumSecurityRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
});


module.exports = { highSecurityRateLimiter, mediumSecurityRateLimiter };