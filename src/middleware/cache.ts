import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

// Create cache instance with 5 minutes TTL
const cache = new NodeCache({ stdTTL: 300 });

export const cacheMiddleware = (duration: number = 300) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    // Override res.json method to cache the response
    const originalJson = res.json;
    res.json = function(body: any) {
      cache.set(key, body, duration);
      return originalJson.call(this, body);
    };

    next();
  };
};

// Clear cache for specific key
export const clearCache = (key: string) => {
  cache.del(key);
};

// Clear all cache
export const clearAllCache = () => {
  cache.flushAll();
}; 