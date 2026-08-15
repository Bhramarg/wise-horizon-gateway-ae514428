import { createMiddleware } from '@tanstack/react-start';
import { getCookie } from '@tanstack/react-start/server';

export interface AuthContext {
  userId: string;
  email: string;
  roles: string[];
}

export const requireAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const { connectDB } = await import('../../backend/database/db.js');
    const { User } = await import('../../backend/database/models.js');
    const jwt = (await import('jsonwebtoken')).default;

    // 1. Get the session token from the cookie
    const token = getCookie('auth_token');
    
    if (!token) {
      throw new Error('Unauthorized: No auth_token cookie found');
    }

    try {
      // 2. Verify JWT signature against our secret
      const secret = process.env.JWT_SECRET;
      if (!secret) throw new Error("JWT_SECRET is not configured");

      const decoded = jwt.verify(token, secret) as any;
      const userId = decoded.userId;

      if (!userId) {
        throw new Error("Invalid token payload: missing userId");
      }

      await connectDB();
      const user = await User.findById(userId);

      if (!user) {
        throw new Error("User no longer exists");
      }

      const context: AuthContext = {
        userId: user._id.toString(),
        email: user.email,
        roles: user.roles || []
      };

      return next({ context });
    } catch (err) {
      console.error("Auth Middleware Error:", err);
      throw new Error('Unauthorized');
    }
  }
);
