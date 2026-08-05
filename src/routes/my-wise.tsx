import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";

import { Reveal } from "@/components/site/motion";
import heroImage from "@/assets/wise-hero.jpg";
import { getGoogleAuthUrl, registerAccount, signInWithPassword } from "@/lib/auth.functions";

export const Route = createFileRoute("/my-wise")({
  head: () => {
    const title = "My WISE — Secure portal for schools, centres and ministries";
    const description =
      "Sign in to My WISE to submit self-evaluation reports, administer WISE examination sessions and verify recognition status.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: MyWise,
});

function MyWise() {
  const navigate = useNavigate();
  const login = useServerFn(signInWithPassword);
  const register = useServerFn(registerAccount);
  const googleUrl = useServerFn(getGoogleAuthUrl);

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [google, setGoogle] = useState<string | null>(null);

  useEffect(() => {
    googleUrl().then((res) => setGoogle(res.url));
  }, [googleUrl]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setMessage(null);
    try {
      const payload = {
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      };
      const result =
        mode === "signin"
          ? await login({ data: payload })
          : await register({
              data: {
                ...payload,
                name: String(form.get("name") ?? ""),
                organisation: String(form.get("organisation") ?? ""),
              },
            });
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      navigate({ to: "/" });
    } catch {
      setMessage("Something interrupted the request. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-navy-deep lg:block">
        <img
          src={heroImage}
          alt="WISE Secretariat, Geneva"
          width={1920}
          height={1200}
          loading="lazy"
          className="absolute inset-0 size-full animate-drift object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy-deep/90 via-navy/70 to-navy-deep/95" />
        <div className="pointer-events-none absolute -left-20 top-1/3 size-[420px] animate-float rounded-full bg-azure/25 blur-[140px]" />

        <div className="relative flex h-full flex-col justify-between p-14 text-white">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-[3px] bg-swiss font-display text-lg font-bold">
              W
            </span>
            <span className="text-[11px] uppercase tracking-[0.24em] text-white/70">
              WISE Geneva
            </span>
          </Link>

          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-azure-soft">My WISE</p>
            <h1 className="mt-6 max-w-lg font-display text-5xl font-extralight leading-[0.98] tracking-tight">
              One secure identity for the whole framework
            </h1>
            <ul className="mt-10 space-y-4 text-[14.5px] text-white/70">
              {[
                "Submit and track self-evaluation reports",
                "Administer examination sessions and centre logistics",
                "Download recognition letters and compliance records",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-azure-soft" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
            Route de Ferney, 1218 Grand-Saconnex, Geneva
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="mica-surface flex items-center justify-center px-6 py-16">
        <Reveal className="w-full max-w-md">
          <div className="acrylic rounded-sm p-9">
            <div className="flex items-center gap-2 text-azure">
              <Lock className="size-4" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">
                Secure sign in
              </span>
            </div>
            <h2 className="mt-5 font-display text-3xl font-light text-navy">
              {mode === "signin" ? "Welcome back" : "Create your access"}
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              {mode === "signin"
                ? "Use your institutional credentials or continue with Google."
                : "Register a school, examination centre or ministry contact."}
            </p>

            {google ? (
              <a
                href={google}
                className="mt-7 flex w-full items-center justify-center gap-3 rounded-[3px] border border-navy/15 bg-white px-5 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-navy lift"
              >
                <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2a7 7 0 0 1-6.6-4.8H1.4v3.1A12 12 0 0 0 12 24Z"
                  />
                  <path fill="#FBBC05" d="M5.4 14.5a7.2 7.2 0 0 1 0-4.6V6.8H1.4a12 12 0 0 0 0 10.4l4-2.7Z" />
                  <path
                    fill="#EA4335"
                    d="M12 4.8c1.8 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.4 6.8l4 3.1A7 7 0 0 1 12 4.8Z"
                  />
                </svg>
                Continue with Google
              </a>
            ) : null}

            <div className="my-7 flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "register" ? (
                <>
                  <Field name="name" label="Full name" />
                  <Field name="organisation" label="Institution" />
                </>
              ) : null}
              <Field name="email" label="Email" type="email" required />
              <Field name="password" label="Password" type="password" required />

              {message ? (
                <p className="rounded-[3px] bg-destructive/8 px-3 py-2 text-[13px] text-destructive">
                  {message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="group mt-2 flex w-full items-center justify-center gap-3 rounded-[3px] bg-navy px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white lift disabled:opacity-60"
              >
                {pending ? "Verifying…" : mode === "signin" ? "Sign in" : "Create account"}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            <button
              onClick={() => {
                setMode(mode === "signin" ? "register" : "signin");
                setMessage(null);
              }}
              className="mt-6 text-[12px] text-muted-foreground underline-sweep"
            >
              {mode === "signin"
                ? "No account yet? Register an institution"
                : "Already registered? Sign in"}
            </button>
          </div>

          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground underline-sweep"
          >
            Back to wise.weqsc.org
          </Link>
        </Reveal>
      </div>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={type === "password" ? "current-password" : "on"}
        className="mt-2 w-full rounded-[3px] border border-navy/12 bg-white/70 px-4 py-3 text-[15px] text-navy outline-none transition-colors focus:border-azure"
      />
    </label>
  );
}
