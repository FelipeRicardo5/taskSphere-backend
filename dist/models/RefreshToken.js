"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const refreshTokenSchema = new mongoose_1.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    user_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    expires_at: {
        type: Date,
        required: true,
    },
}, {
    timestamps: true,
});
refreshTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ user_id: 1 });
exports.default = (0, mongoose_1.model)('RefreshToken', refreshTokenSchema);
//# sourceMappingURL=RefreshToken.js.map