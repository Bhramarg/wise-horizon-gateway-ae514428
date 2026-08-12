import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Lock, ShieldCheck } from "lucide-react";

import { Reveal } from "@/components/site/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImage from "@/assets/wise-hero.jpg";
import { supabase } from "@/integrations/supabase/client";
import wiseLogo from "@/assets/wise-logo.png.asset.json";

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
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
      const { error } = await supabase.auth.signInWithPassword(payload);
      if (error) {
        setMessage("Those credentials don't match an active WISE account.");
        return;
      }
      navigate({ to: "/portal" });
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
            <img
              src={wiseLogo.url}
              alt="WISE — Weqsc International Scholastic Examination"
              width={44}
              height={44}
              className="size-11 object-contain"
            />
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
              Welcome back
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
              Use the credentials issued by your WISE administrator.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <Field name="email" label="Email" type="email" required />
              <Field name="password" label="Password" type="password" required />

              {message ? (
                <p className="rounded-[3px] bg-destructive/8 px-3 py-2 text-[13px] text-destructive">
                  {message}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={pending}
                className="group mt-2 flex w-full items-center justify-center gap-3 rounded-[3px] bg-navy px-5 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white lift disabled:opacity-60"
              >
                {pending ? "Verifying…" : "Sign in"}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>
            <p className="mt-6 text-[12px] leading-relaxed text-muted-foreground">Accounts are created and assigned to institutions by a WISE administrator. Public registration is disabled.</p>
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
      <Input
        name={name}
        type={type}
        required={required}
        autoComplete={type === "password" ? "current-password" : "on"}
        className="mt-2 h-12 rounded-[3px] border-navy/12 bg-white/70 px-4 text-[15px] text-navy focus-visible:ring-azure"
      />
    </label>
  );
}
