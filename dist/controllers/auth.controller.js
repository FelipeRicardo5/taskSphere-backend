"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthController {
    static async register(req, res, next) {
        try {
            const { name, email, password } = req.body;
            const { user, token, refreshToken } = await auth_service_1.AuthService.register({
                name,
                email,
                password,
            });
            return res.status(201).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                    },
                    token,
                    refreshToken,
                },
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const { user, token, refreshToken } = await auth_service_1.AuthService.login(email, password);
            return res.status(200).json({
                success: true,
                data: {
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                    },
                    token,
                    refreshToken,
                },
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token is required',
                });
            }
            const tokens = await auth_service_1.AuthService.refreshToken(refreshToken);
            return res.status(200).json({
                success: true,
                data: tokens,
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
    static async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token is required',
                });
            }
            await auth_service_1.AuthService.logout(refreshToken);
            return res.status(200).json({
                success: true,
                message: 'Logged out successfully',
            });
        }
        catch (error) {
            next(error);
            return;
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map