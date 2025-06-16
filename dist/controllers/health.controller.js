"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkHealth = void 0;
const checkHealth = async (_req, res) => {
    try {
        return res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Health check failed'
        });
    }
};
exports.checkHealth = checkHealth;
//# sourceMappingURL=health.controller.js.map