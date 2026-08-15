import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";

export const loginFn = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data: input }) => {
    // Dynamic imports for server-side only packages
    const { query } = await import("../../backend/database/db.js");
    const bcrypt = (await import('bcryptjs')).default;
    const jwt = (await import('jsonwebtoken')).default;

    const { email, password } = input;

    const { rows } = await query(`SELECT * FROM public.users WHERE email = $1 LIMIT 1`, [email]);
    const user = rows[0];
    
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash as string);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not configured");

    const token = jwt.sign(
      { userId: user.id.toString(), email: user.email },
      secret,
      { expiresIn: "1d" }
    );

    setCookie("auth_token", token, {
      path: "/",
      maxAge: 86400,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "lax"
    });

    return { 
      success: true, 
      // Supabase users table may not have requiresPasswordChange by default, handle gracefully
      requiresPasswordChange: user.requires_password_change || false 
    };
  });

export const changePasswordFn = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data: input }) => {
    const { query } = await import("../../backend/database/db.js");
    const bcrypt = (await import('bcryptjs')).default;

    const { email, oldPassword, newPassword } = input;

    const { rows } = await query(`SELECT * FROM public.users WHERE email = $1 LIMIT 1`, [email]);
    const user = rows[0];
    
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash as string);
    if (!isMatch) throw new Error("Invalid old password");

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await query(`
      UPDATE public.users 
      SET password_hash = $1, requires_password_change = false 
      WHERE id = $2
    `, [password_hash, user.id]);

    return { success: true };
  });
