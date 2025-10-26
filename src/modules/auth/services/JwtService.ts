import jwt from 'jsonwebtoken';
import { config } from '../../../config';
import { JWTPayload, AdminJWTPayload, RefreshTokenPayload, AdminRefreshTokenPayload, AuthTokens } from '../../../types';

export class JwtService {
  /**
   * Generate access token
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    const tokenPayload: JWTPayload = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role
    };

    return jwt.sign(tokenPayload, config.jwt.secret, {
      expiresIn: config.jwt.expire,
      issuer: 'educational-management-system',
      audience: 'educational-management-system-users'
    } as jwt.SignOptions);
  }

  /**
   * Generate admin access token
   */
  static generateAdminAccessToken(payload: Omit<AdminJWTPayload, 'iat' | 'exp'>): string {
    const tokenPayload: AdminJWTPayload = {
      adminId: payload.adminId,
      role: payload.role,
      permissions: payload.permissions
    };

    return jwt.sign(tokenPayload, config.jwt.secret, {
      expiresIn: config.jwt.expire,
      issuer: 'educational-management-system',
      audience: 'educational-management-system-admins'
    } as jwt.SignOptions);
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId: string, tokenVersion: number): string {
    const payload: RefreshTokenPayload = {
      userId,
      tokenVersion
    };

    return jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpire,
      issuer: 'educational-management-system',
      audience: 'educational-management-system-refresh'
    } as jwt.SignOptions);
  }

  /**
   * Generate both access and refresh tokens
   */
  static generateTokenPair(
    userId: string,
    email: string,
    role: string,
    tokenVersion: number
  ): AuthTokens {
    const accessToken = this.generateAccessToken({ userId, email, role });
    const refreshToken = this.generateRefreshToken(userId, tokenVersion);

    // Calculate expiration time
    const decoded = jwt.decode(accessToken) as JWTPayload;
    const expiresIn = decoded.exp ? (decoded.exp * 1000 - Date.now()) / 1000 : 0;

    return {
      accessToken,
      refreshToken,
      expiresIn: Math.floor(expiresIn)
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const payload = jwt.verify(token, config.jwt.secret, {
        issuer: 'educational-management-system',
        audience: 'educational-management-system-users'
      }) as JWTPayload;

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Verify admin access token
   */
  static verifyAdminAccessToken(token: string): AdminJWTPayload {
    try {
      const payload = jwt.verify(token, config.jwt.secret, {
        issuer: 'educational-management-system',
        audience: 'educational-management-system-admins'
      }) as AdminJWTPayload;

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const payload = jwt.verify(token, config.jwt.refreshSecret, {
        issuer: 'educational-management-system',
        audience: 'educational-management-system-refresh'
      }) as RefreshTokenPayload;

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      } else {
        throw new Error('Refresh token verification failed');
      }
    }
  }

  /**
   * Verify admin refresh token
   */
  static verifyAdminRefreshToken(token: string): AdminRefreshTokenPayload {
    try {
      const payload = jwt.verify(token, config.jwt.refreshSecret, {
        issuer: 'educational-management-system',
        audience: 'educational-management-system-refresh'
      }) as AdminRefreshTokenPayload;

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      } else {
        throw new Error('Refresh token verification failed');
      }
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1] || null;
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (decoded && decoded.exp) {
        return decoded.exp * 1000 < Date.now();
      }
      return true;
    } catch {
      return true;
    }
  }
}
