import { createRemoteJWKSet, jwtVerify } from "jose";
import { query } from "../database/db.js";

// The JWKS URL from Neon Auth
const NEON_AUTH_DOMAIN = "https://ep-cold-frost-a7d30q9e.neonauth.ap-southeast-2.aws.neon.tech";
const JWKS_URL = new URL(`${NEON_AUTH_DOMAIN}/.well-known/jwks.json`);

const JWKS = createRemoteJWKSet(JWKS_URL);

export interface AuthContext {
  userId: string;
  email: string;
  roles: string[];
}

export async function verifyToken(token: string): Promise<AuthContext> {
  try {
    const { payload } = await jwtVerify(token, JWKS);
    
    // The subject (sub) is usually the user ID in OAuth
    const userId = payload.sub;
    const email = payload.email as string;

    if (!userId || !email) {
      throw new Error("Invalid token payload: missing sub or email");
    }

    // Upsert user into our database to ensure they exist, or just query their roles
    // We will do a query to find their roles
    const userRes = await query("SELECT id FROM public.users WHERE email = $1", [email]);
    let internalUserId = "";

    if (userRes.rows.length === 0) {
      // First time login - auto create the user in our DB
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

    return {
      userId: internalUserId,
      email,
      roles,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Error("Unauthorized");
  }
}
