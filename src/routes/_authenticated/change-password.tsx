import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import wiseLogo from "@/assets/wise-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/change-password")({
  head: () => ({
    meta: [
      { title: "Set a new WISE password" },
      { name: "description", content: "Replace your temporary WISE credentials with a permanent password before entering the secure portal." },
      { property: "og:title", content: "Set a new WISE password" },
      { property: "og:description", content: "Replace your temporary WISE credentials with a permanent password." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ChangePassword,
});

function ChangePassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password.length < 10) {
      setMessage("Use at least 10 characters.");
      return;
    }
    if (password !== confirm) {
      setMessage("The two passwords do not match.");
      return;
    }
    setPending(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({
      password,
      data: { must_change_password: false },
    });
    setPending(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    navigate({ to: "/portal", replace: true });
  }

  return (
    <main className="mica-surface grid min-h-screen place-items-center px-6 py-16">
      <div className="acrylic w-full max-w-md rounded-sm p-9">
        <img src={wiseLogo.url} alt="WISE seal" width={56} height={56} className="size-14 object-contain" />
        <div className="mt-6 flex items-center gap-2 text-azure">
          <KeyRound className="size-4" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.22em]">Mandatory update</span>
        </div>
        <h1 className="mt-4 font-display text-3xl font-light text-navy">Set your permanent password</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          {email ? `${email} is signed in with temporary credentials. ` : ""}Choose a new password to continue to the portal.
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">New password</span>
            <Input name="password" type="password" required autoComplete="new-password" className="mt-2 h-12 rounded-[3px]" />
          </label>
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Confirm password</span>
            <Input name="confirm" type="password" required autoComplete="new-password" className="mt-2 h-12 rounded-[3px]" />
          </label>
          {message ? (
            <p className="rounded-[3px] bg-destructive/8 px-3 py-2 text-[13px] text-destructive">{message}</p>
          ) : null}
          <Button type="submit" disabled={pending} className="w-full rounded-[3px] bg-navy py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
            {pending ? "Saving…" : "Save and continue"}
          </Button>
        </form>
      </div>
    </main>
  );
}
