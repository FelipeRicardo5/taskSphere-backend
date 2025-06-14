import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  // Register new user
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = req.body;

      const { user, token, refreshToken } = await AuthService.register({
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
    } catch (error) {
      next(error);
      return;
    }
  }

  // Login user
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const { user, token, refreshToken } = await AuthService.login(
        email,
        password
      );

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
    } catch (error) {
      next(error);
      return;
    }
  }

  // Refresh token
  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
      }

      const tokens = await AuthService.refreshToken(refreshToken);

      return res.status(200).json({
        success: true,
        data: tokens,
      });
    } catch (error) {
      next(error);
      return;
    }
  }

  // Logout user
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
      }

      await AuthService.logout(refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
      return;
    }
  }
} 