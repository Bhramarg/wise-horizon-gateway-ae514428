import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().max(120).optional(),
  organisation: z.string().max(160).optional(),
});

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const { readSession } = await import("./auth.server");
  return { user: await readSession() };
});

export const signInWithPassword = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => credentials.pick({ email: true, password: true }).parse(input))
  .handler(async ({ data }) => {
    const auth = await import("./auth.server");
    try {
      const user = await auth.findUserByEmail(data.email);
      if (!user || !(await auth.verifyPassword(data.password, user.password_hash))) {
        return { ok: false as const, error: "Those credentials don't match our records." };
      }
      await auth.touchLogin(user.id);
      const session = {
        id: user.id,
        email: user.email,
        name: user.name || user.email,
        provider: user.provider,
      };
      await auth.writeSession(session);
      return { ok: true as const, user: session };
    } catch (error) {
      console.error("signInWithPassword failed", error);
      return { ok: false as const, error: "The identity service is unavailable. Try again shortly." };
    }
  });

export const registerAccount = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => credentials.parse(input))
  .handler(async ({ data }) => {
    const auth = await import("./auth.server");
    try {
      const existing = await auth.findUserByEmail(data.email);
      if (existing) {
        return { ok: false as const, error: "An account already exists for this email." };
      }
      const user = await auth.createUser({
        email: data.email,
        name: data.name ?? "",
        organisation: data.organisation ?? "",
        passwordHash: await auth.hashPassword(data.password),
      });
      const session = {
        id: user.id,
        email: user.email,
        name: user.name || user.email,
        provider: user.provider,
      };
      await auth.writeSession(session);
      return { ok: true as const, user: session };
    } catch (error) {
      console.error("registerAccount failed", error);
      return { ok: false as const, error: "We couldn't create the account. Try again shortly." };
    }
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  const { destroySession } = await import("./auth.server");
  await destroySession();
  return { ok: true as const };
});

export const getGoogleAuthUrl = createServerFn({ method: "GET" }).handler(async () => {
  const clientId = process.env["GOOGLE_OAUTH_CLIENT_ID"];
  if (!clientId) return { url: null as string | null };
  const { getRequestUrl } = await import("@tanstack/react-start/server");
  const origin = new URL(getRequestUrl()).origin;
  const params = new URLSearchParams({
    client_id: clientId.trim(),
    redirect_uri: `${origin}/api/public/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });
  return { url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` };
});
