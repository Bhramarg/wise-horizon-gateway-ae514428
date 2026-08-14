import { useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { LogOut, Moon, Sun, LayoutDashboard, FileText, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Overview } from "@/components/portal/shell";
import wiseLogo from "@/assets/wise-logo.png.asset.json";

export function PortalLayout({ data, children }: { data: Overview; children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    return () => document.documentElement.classList.remove("dark");
  }, [dark]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/my-wise", replace: true });
  }

  const navItems = [
    { name: "Dashboard", path: "/portal", icon: LayoutDashboard },
    { name: "Self-Evaluation", path: "/reports", icon: FileText },
    { name: "Exam Sessions", path: "/sessions", icon: Calendar },
  ];

  return (
    <main className="mica-surface min-h-screen text-foreground flex flex-col">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-4 px-5 py-3.5">
          <div className="flex items-center gap-6">
            <Link to="/portal" className="flex items-center gap-3">
              <img src={wiseLogo.url} alt="WISE seal" width={38} height={38} className="size-9 object-contain" />
              <div>
                <p className="font-display text-sm font-semibold tracking-tight">WISE Operations</p>
                <p className="text-[11px] text-muted-foreground">
                  {data.role === "admin" ? "Evaluation & governance console" : "Digital marksheet studio"}
                </p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1 ml-6 border-l border-border/60 pl-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      isActive ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground md:inline">{data.email}</span>
            <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setDark((value) => !value)}>
              {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="size-4 mr-2" /> Sign out
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-[1500px] flex-1 px-5 pb-16 pt-6">
        {children}
      </div>
    </main>
  );
}
