import { createServerFn } from "@tanstack/react-start";
import { setCookie } from "@tanstack/react-start/server";

export const loginFn = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data: input }) => {
    // Dynamic imports for server-side only packages
    const { connectDB } = await import("../../backend/database/db.js");
    const { User } = await import("../../backend/database/models.js");
    const bcrypt = (await import('bcryptjs')).default;
    const jwt = (await import('jsonwebtoken')).default;

    await connectDB();
    const { email, password } = input;

    const user = await User.findOne({ email });
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
      { userId: user._id.toString(), email: user.email },
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
      requiresPasswordChange: user.requiresPasswordChange 
    };
  });

export const changePasswordFn = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data: input }) => {
    const { connectDB } = await import("../../backend/database/db.js");
    const { User } = await import("../../backend/database/models.js");
    const bcrypt = (await import('bcryptjs')).default;

    await connectDB();
    const { email, oldPassword, newPassword } = input;

    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(oldPassword, user.password_hash as string);
    if (!isMatch) throw new Error("Invalid old password");

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    user.password_hash = password_hash;
    user.requiresPasswordChange = false;
    await user.save();

    return { success: true };
  });
