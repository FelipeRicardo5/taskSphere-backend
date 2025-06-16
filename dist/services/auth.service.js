"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const User_1 = __importDefault(require("../models/User"));
const RefreshToken_1 = __importDefault(require("../models/RefreshToken"));
const mongoose_1 = require("mongoose");
class AuthService {
    static generateToken(userId) {
        const payload = { id: userId.toString() };
        const options = { expiresIn: env_1.env.JWT_EXPIRES_IN };
        return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, options);
    }
    static async generateRefreshToken(userId) {
        const payload = { id: userId.toString() };
        const options = { expiresIn: env_1.env.JWT_REFRESH_EXPIRES_IN };
        const token = jsonwebtoken_1.default.sign(payload, env_1.env.JWT_REFRESH_SECRET, options);
        await RefreshToken_1.default.create({
            token,
            user_id: userId,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });
        return token;
    }
    static async register(userData) {
        const user = await User_1.default.create(userData);
        const token = this.generateToken(user._id);
        const refreshToken = await this.generateRefreshToken(user._id);
        return { user, token, refreshToken };
    }
    static async login(email, password) {
        const user = await User_1.default.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        const token = this.generateToken(user._id);
        const refreshToken = await this.generateRefreshToken(user._id);
        return { user, token, refreshToken };
    }
    static async refreshToken(refreshToken) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_REFRESH_SECRET);
            const tokenDoc = await RefreshToken_1.default.findOne({
                token: refreshToken,
                user_id: new mongoose_1.Types.ObjectId(decoded.id),
            });
            if (!tokenDoc) {
                throw new Error('Invalid refresh token');
            }
            const token = this.generateToken(new mongoose_1.Types.ObjectId(decoded.id));
            const newRefreshToken = await this.generateRefreshToken(new mongoose_1.Types.ObjectId(decoded.id));
            await tokenDoc.deleteOne();
            return { token, refreshToken: newRefreshToken };
        }
        catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
    static async logout(refreshToken) {
        await RefreshToken_1.default.findOneAndDelete({ token: refreshToken });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map