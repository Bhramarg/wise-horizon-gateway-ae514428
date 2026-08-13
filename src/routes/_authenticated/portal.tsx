import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type ReactNode } from "react";
import { LogOut, Moon, ShieldCheck, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { claimFirstAdmin, getPortalOverview } from "@/lib/portal.functions";
import { AdminWorkspace } from "@/components/portal/AdminWorkspace";
import { DmsWorkspace } from "@/components/portal/DmsWorkspace";
import wiseLogo from "@/assets/wise-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/portal")({
  head: () => ({
    meta: [
      { title: "WISE Administration Portal" },
      { name: "description", content: "Secure WISE administration portal for institutions, learners, results and certificates." },
      { property: "og:title", content: "WISE Administration Portal" },
      { property: "og:description", content: "Secure institutional result and certificate administration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Portal,
});

function Portal() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const overviewFn = useServerFn(getPortalOverview);
  const claimFn = useServerFn(claimFirstAdmin);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.user_metadata?.["must_change_password"]) {
        navigate({ to: "/change-password", replace: true });
      }
    });
  }, [navigate]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    return () => document.documentElement.classList.remove("dark");
  }, [dark]);

  const { data, isLoading, error } = useQuery({ queryKey: ["portal-overview"], queryFn: () => overviewFn() });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["portal-overview"] });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/my-wise", replace: true });
  }

  if (isLoading) return <Loading />;
  if (error || !data) return <PortalMessage title="Portal unavailable" body="The secure workspace could not be loaded." />;
  if (!data.role)
    return (
      <PortalMessage
        title="Access not assigned"
        body="This account has no WISE role. If this is the first account, claim initial administrator access; otherwise ask an existing administrator to assign you."
      >
        <Button
          onClick={async () => {
            await claimFn();
            await refresh();
          }}
        >
          Claim initial administrator
        </Button>
        <Button variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </PortalMessage>
    );

  return (
    <main className="mica-surface min-h-screen text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-3.5">
          <div className="flex items-center gap-3">
            <img src={wiseLogo.url} alt="WISE seal" width={38} height={38} className="size-9 object-contain" />
            <div>
              <p className="font-display text-sm font-semibold tracking-tight">WISE Operations</p>
              <p className="text-[11px] text-muted-foreground">
                {data.role === "admin" ? "Evaluation & governance console" : "Digital marksheet studio"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground md:inline">{data.email}</span>
            <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setDark((value) => !value)}>
              {dark ? <Sun /> : <Moon />}
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut /> Sign out
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1500px] px-5 pb-16 pt-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {data.role === "admin" ? "Evaluation overview" : "Certification workspace"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.role === "admin"
              ? "Review dossiers, govern institutions and manage operator accounts."
              : "Follow the canonical certification workflow from learner record to blockchain hand-off."}
          </p>
        </div>
        {data.role === "admin" ? <AdminWorkspace data={data} refresh={refresh} /> : <DmsWorkspace data={data} refresh={refresh} />}
      </div>
    </main>
  );
}

function Loading() {
  return (
    <main className="mica-surface grid min-h-screen place-items-center">
      <p className="text-sm text-muted-foreground">Opening secure workspace…</p>
    </main>
  );
}

function PortalMessage({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <main className="mica-surface grid min-h-screen place-items-center px-6">
      <div className="acrylic max-w-lg rounded-xl p-9">
        <ShieldCheck className="size-8 text-azure" />
        <h1 className="mt-5 text-3xl font-light">{title}</h1>
        <p className="mt-3 text-muted-foreground">{body}</p>
        {children ? <div className="mt-7 flex flex-wrap gap-3">{children}</div> : null}
      </div>
    </main>
  );
}
