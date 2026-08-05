import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/auth/google/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const failure = Response.redirect(`${url.origin}/my-wise?error=google`, 302);
        if (!code) return failure;

        const clientId = process.env["GOOGLE_OAUTH_CLIENT_ID"]?.trim();
        const clientSecret = process.env["GOOGLE_OAUTH_CLIENT_SECRET"]?.trim();
        if (!clientId || !clientSecret) return failure;

        try {
          const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "content-type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              code,
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: `${url.origin}/api/public/auth/google/callback`,
              grant_type: "authorization_code",
            }),
          });
          if (!tokenRes.ok) {
            console.error("google token exchange failed", await tokenRes.text());
            return failure;
          }
          const token = (await tokenRes.json()) as { access_token?: string };
          if (!token.access_token) return failure;

          const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { authorization: `Bearer ${token.access_token}` },
          });
          if (!profileRes.ok) return failure;
          const profile = (await profileRes.json()) as {
            email?: string;
            name?: string;
            email_verified?: boolean;
          };
          if (!profile.email) return failure;

          const auth = await import("@/lib/auth.server");
          const existing = await auth.findUserByEmail(profile.email);
          const user =
            existing ??
            (await auth.createUser({
              email: profile.email,
              name: profile.name ?? profile.email,
              provider: "google",
            }));
          await auth.touchLogin(user.id);
          await auth.writeSession({
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            provider: user.provider,
          });
          return Response.redirect(`${url.origin}/my-wise?welcome=1`, 302);
        } catch (error) {
          console.error("google oauth callback failed", error);
          return failure;
        }
      },
    },
  },
});
