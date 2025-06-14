import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import User from '../models/User';
import RefreshToken from '../models/RefreshToken';
import { IUser } from '../types/models';
import { Types } from 'mongoose';

export class AuthService {
  // Generate JWT token
  private static generateToken(userId: Types.ObjectId): string {
    const payload = { id: userId.toString() };
    const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as any };
    return jwt.sign(payload, env.JWT_SECRET, options);
  }
  	
  // Generate refresh token
  private static async generateRefreshToken(userId: Types.ObjectId): Promise<string> {
    const payload = { id: userId.toString() };
    const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any };
    const token = jwt.sign(payload, env.JWT_REFRESH_SECRET, options);

    // Save refresh token to database
    await RefreshToken.create({
      token,
      user_id: userId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return token;
  }

  // Register new user
  static async register(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ user: IUser; token: string; refreshToken: string }> {
    const user = await User.create(userData) as IUser & { _id: Types.ObjectId };
    const token = this.generateToken(user._id);
    const refreshToken = await this.generateRefreshToken(user._id);

    return { user, token, refreshToken };
  }

  // Login user
  static async login(
    email: string,
    password: string
  ): Promise<{ user: IUser; token: string; refreshToken: string }> {
    const user = await User.findOne({ email }) as IUser & { _id: Types.ObjectId };

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

  // Refresh token
  static async refreshToken(
    refreshToken: string
  ): Promise<{ token: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as {
        id: string;
      };

      // Check if refresh token exists in database
      const tokenDoc = await RefreshToken.findOne({
        token: refreshToken,
        user_id: new Types.ObjectId(decoded.id),
      });

      if (!tokenDoc) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const token = this.generateToken(new Types.ObjectId(decoded.id));
      const newRefreshToken = await this.generateRefreshToken(new Types.ObjectId(decoded.id));

      // Delete old refresh token
      await tokenDoc.deleteOne();

      return { token, refreshToken: newRefreshToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Logout user
  static async logout(refreshToken: string): Promise<void> {
    await RefreshToken.findOneAndDelete({ token: refreshToken });
  }
} 