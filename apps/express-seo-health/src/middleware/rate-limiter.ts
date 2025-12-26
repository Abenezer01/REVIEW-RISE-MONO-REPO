import { rateLimit } from 'express-rate-limit';

// Rate limiter for SEO analysis endpoint
// Free tier: 10 requests per hour per IP
export const seoAnalysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per window
  message: {
    success: false,
    message: 'Too many SEO analysis requests from this IP, please try again after an hour',
    retryAfter: '1 hour',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  
  // Skip rate limiting for authenticated users (can be extended later)
  skip: (req) => {
    // Check if user is authenticated (placeholder for future auth integration)
    const authHeader = req.headers.authorization;
    return authHeader?.startsWith('Bearer ') ?? false;
  },
});

// General API rate limiter
// 100 requests per 15 minutes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
