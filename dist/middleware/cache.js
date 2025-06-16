"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAllCache = exports.clearCache = exports.cacheMiddleware = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({ stdTTL: 300 });
const cacheMiddleware = (duration = 300) => {
    return (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }
        const key = `__express__${req.originalUrl || req.url}`;
        const cachedResponse = cache.get(key);
        if (cachedResponse) {
            return res.json(cachedResponse);
        }
        const originalJson = res.json;
        res.json = function (body) {
            cache.set(key, body, duration);
            return originalJson.call(this, body);
        };
        next();
    };
};
exports.cacheMiddleware = cacheMiddleware;
const clearCache = (key) => {
    cache.del(key);
};
exports.clearCache = clearCache;
const clearAllCache = () => {
    cache.flushAll();
};
exports.clearAllCache = clearAllCache;
//# sourceMappingURL=cache.js.map