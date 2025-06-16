"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const errorHandler = (err, _req, res, _next) => {
    let error = { ...err };
    error.message = err.message;
    console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        code: err.code,
        errors: err.errors
    });
    if (err instanceof errors_1.ValidationError) {
        error.statusCode = err.message.includes('authorized') ? 403 : 400;
        return res.status(error.statusCode).json({
            success: false,
            error: error.message
        });
    }
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new Error(message);
        error.statusCode = 404;
    }
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new Error(message);
        error.statusCode = 400;
    }
    if (err.name === 'ValidationError') {
        const message = err.errors ? Object.values(err.errors).map((val) => val.message).join(', ') : 'Validation error';
        error = new Error(message);
        error.statusCode = 400;
    }
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error',
        details: process.env.NODE_ENV === 'development' ? err : undefined
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.js.map