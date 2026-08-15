import { createMiddleware } from '@tanstack/react-start';
import { getCookie } from '@tanstack/react-start/server';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { query } from '../../backend/database/db';

const NEON_AUTH_DOMAIN = "https://ep-cold-frost-a7d30q9e.neonauth.ap-southeast-2.aws.neon.tech";
const JWKS_URL = new URL(`${NEON_AUTH_DOMAIN}/.well-known/jwks.json`);
const JWKS = createRemoteJWKSet(JWKS_URL);

export interface AuthContext {
  userId: string;
  email: string;
  roles: string[];
}

export const requireAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    // 1. Get the Neon Auth token from the cookie
    const token = getCookie('neon_access_token');
    
    if (!token) {
      throw new Error('Unauthorized: No neon_access_token cookie found');
    }

    try {
      // 2. Verify JWT signature against Neon Auth JWKS
      const { payload } = await jwtVerify(token, JWKS);
      const userId = payload.sub;
      const email = payload.email as string;

      if (!userId || !email) {
        throw new Error("Invalid token payload: missing sub or email");
      }

      // 3. Ensure user exists in our Neon DB and get roles
      const userRes = await query("SELECT id FROM public.users WHERE email = $1", [email]);
      let internalUserId = "";

      if (userRes.rows.length === 0) {
        // First time login via Neon Auth, register them in our DB
        const insertRes = await query(
          "INSERT INTO public.users (id, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
          [userId, email, "oauth-managed"]
        );
        internalUserId = insertRes.rows[0].id;
      } else {
        internalUserId = userRes.rows[0].id;
      }

      const rolesRes = await query(
        "SELECT role FROM public.user_roles WHERE user_id = $1",
        [internalUserId]
      );

      const roles = rolesRes.rows.map((r) => r.role);

      return next({
        context: {
          userId: internalUserId,
          email,
          roles,
        },
      });
    } catch (err: any) {
      console.error("Token verification failed:", err);
      throw new Error("Unauthorized: " + err.message);
    }
  }
);
