"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const errors_1 = require("../utils/errors");
const validateRequest = (schema) => {
    return async (req, _res, next) => {
        try {
            console.log('Request body:', req.body);
            const result = await schema.parseAsync(req.body);
            console.log('Validation result:', result);
            req.body = result;
            next();
        }
        catch (error) {
            console.error('Validation error:', error);
            if (error.errors) {
                next(new errors_1.ValidationError(error.errors[0].message));
                return;
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validate.js.map