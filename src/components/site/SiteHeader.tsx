import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, CloudSun, Menu, Wind, X, ArrowUpRight, Radio } from "lucide-react";

import { navigation } from "@/lib/site-nav";
import { getGenevaWeather, getTickerHeadlines } from "@/lib/wise.functions";
import { supabase } from "@/integrations/supabase/client";
import wiseLogo from "@/assets/wise-logo.png.asset.json";

function WiseMark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <img
        src={wiseLogo.url}
        alt="WISE — Weqsc International Secondary Examination"
        width={44}
        height={44}
        className="size-11 shrink-0 object-contain"
      />
      <span className="leading-[1.05]">
        <span className="block font-display text-[15px] font-semibold tracking-[0.06em] text-navy">
          WISE
        </span>
        <span className="block text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">
          Weqsc International
          <br />
          Scholastic Examination
        </span>
      </span>
    </span>
  );
}

function TickerBand() {
  const { data } = useQuery({
    queryKey: ["ticker"],
    queryFn: () => getTickerHeadlines(),
    staleTime: 5 * 60 * 1000,
  });
  const items = data ?? [];
  if (!items.length) return <div className="h-8 bg-navy-deep" />;

  return (
    <div className="relative overflow-hidden bg-navy-deep text-white">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center gap-2 bg-navy-deep pl-4 pr-6 text-[10px] uppercase tracking-[0.24em] text-azure-soft">
        <Radio className="size-3 animate-pulse" />
        <span className="hidden sm:inline">WISE Wire</span>
      </div>
      <div className="flex w-max animate-marquee items-center py-2 pl-56">
        {[...items, ...items].map((item, index) => (
          <span key={index} className="flex items-center whitespace-nowrap text-[12px]">
            <span className="mr-2 font-semibold uppercase tracking-[0.14em] text-azure-soft">
              {item.source}
            </span>
            <span className="text-white/80">{item.headline}</span>
            <span className="mx-6 text-swiss">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function WeatherStrip() {
  const { data } = useQuery({
    queryKey: ["weather"],
    queryFn: () => getGenevaWeather(),
    staleTime: 10 * 60 * 1000,
  });
  const [clock, setClock] = useState("");

  useEffect(() => {
    const update = () =>
      setClock(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Europe/Zurich",
        }).format(new Date()),
      );
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <CloudSun className="size-4 text-azure" />
        <span className="font-semibold text-navy">{data ? `${data.temperature}°C` : "—"}</span>
        <span className="hidden md:inline">Geneva · {data?.label ?? "Loading"}</span>
      </span>
      <span className="hidden items-center gap-1.5 lg:flex">
        <Wind className="size-3.5" />
        {data ? `${data.windspeed} km/h` : "—"}
      </span>
      <span className="hidden font-mono text-navy sm:inline">{clock} CET</span>
    </div>
  );
}

function MegaPanel({ index }: { index: number }) {
  const section = navigation[index]!;
  return (
    <div className="mx-auto grid max-w-[1400px] gap-10 px-8 py-12 lg:grid-cols-[1fr_2.6fr]">
      <div>
        <p className="text-[10px] uppercase tracking-[0.28em] text-swiss">Section</p>
        <h3 className="mt-3 font-display text-3xl font-light leading-tight text-navy">
          {section.label}
        </h3>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
          {section.blurb}
        </p>
        <Link
          to="/$"
          params={{ _splat: section.slug }}
          className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-azure underline-sweep"
        >
          Overview <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
      <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">
        {section.children.map((child) => {
          const childPath = child.slug ? `${section.slug}/${child.slug}` : section.slug;
          return (
            <div key={child.label}>
              <Link
                to="/$"
                params={{ _splat: childPath }}
                className="font-display text-[13px] font-semibold uppercase tracking-[0.1em] text-navy underline-sweep"
              >
                {child.label}
              </Link>
              {child.children?.length ? (
                <ul className="mt-2.5 space-y-1.5">
                  {child.children.map((leaf) => (
                    <li key={leaf.label}>
                      <Link
                        to="/$"
                        params={{ _splat: `${childPath}/${leaf.slug}` }}
                        className="text-[13px] leading-snug text-muted-foreground transition-colors hover:text-azure"
                      >
                        {leaf.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : child.blurb ? (
                <p className="mt-2 text-[12.5px] leading-snug text-muted-foreground">
                  {child.blurb}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SiteHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState<number | null>(null);
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useQuery({
    queryKey: ["auth-session"],
    queryFn: async () => (await supabase.auth.getSession()).data.session,
    staleTime: 60_000,
  });

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/my-wise", replace: true });
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <TickerBand />
      <div
        className={`border-b border-border/70 transition-all duration-500 ${
          scrolled ? "acrylic" : "bg-white/85 backdrop-blur-xl"
        }`}
        onMouseLeave={() => setOpen(null)}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-6 py-2">
          <WeatherStrip />
          <div className="flex items-center gap-5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <Link to="/$" params={{ _splat: "accreditation/accredited-school-directory" }} className="hidden underline-sweep sm:inline">
              Directory
            </Link>
            <Link to="/$" params={{ _splat: "examinations/results-certificates/certificate-verification" }} className="hidden underline-sweep md:inline">
              Verify a certificate
            </Link>
            {session ? <><Link to="/portal" className="font-semibold text-azure">Portal</Link><button onClick={handleSignOut} className="text-muted-foreground underline-sweep">Sign out</button></> : <Link to="/my-wise" className="group relative overflow-hidden rounded-[3px] bg-navy px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-white"><span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" /><span className="relative">MY WISE</span></Link>}
          </div>
        </div>

        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-8 px-6 pb-3">
          <Link to="/" onMouseEnter={() => setOpen(null)}>
            <WiseMark />
          </Link>
          <nav className="hidden items-center gap-1 xl:flex">
            {navigation.map((section, index) => (
              <button
                key={section.slug}
                onMouseEnter={() => setOpen(index)}
                onClick={() => setOpen(open === index ? null : index)}
                className={`group flex items-center gap-1 px-3 py-3 font-display text-[12.5px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                  open === index ? "text-azure" : "text-navy hover:text-azure"
                }`}
              >
                {section.label}
                <ChevronDown
                  className={`size-3.5 transition-transform duration-300 ${open === index ? "rotate-180" : ""}`}
                />
              </button>
            ))}
          </nav>
          <button
            onClick={() => setMobile(true)}
            className="flex items-center gap-2 text-navy xl:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-6" />
          </button>
        </div>

        <div
          className={`absolute inset-x-0 top-full hidden overflow-hidden border-b border-border/70 transition-[max-height,opacity] duration-500 xl:block ${
            open === null ? "max-h-0 opacity-0" : "max-h-[720px] opacity-100"
          }`}
        >
          <div className="acrylic bg-white/92">{open !== null ? <MegaPanel index={open} /> : null}</div>
        </div>
      </div>

      {mobile ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white/95 backdrop-blur-xl xl:hidden">
          <div className="flex items-center justify-between px-6 py-5">
            <WiseMark />
            <button onClick={() => setMobile(false)} aria-label="Close navigation">
              <X className="size-6 text-navy" />
            </button>
          </div>
          <nav className="px-6 pb-16">
            {navigation.map((section) => (
              <details key={section.slug} className="border-t border-border py-3">
                <summary className="cursor-pointer font-display text-sm font-semibold uppercase tracking-[0.12em] text-navy">
                  {section.label}
                </summary>
                <ul className="mt-3 space-y-2 pl-1">
                  {section.children.map((child) => (
                    <li key={child.label}>
                      <Link
                        to="/$"
                        params={{ _splat: child.slug ? `${section.slug}/${child.slug}` : section.slug }}
                        onClick={() => setMobile(false)}
                        className="text-sm text-muted-foreground"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
            <Link
              to="/my-wise"
              onClick={() => setMobile(false)}
              className="mt-8 block rounded-[3px] bg-navy px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-white"
            >
              My WISE
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
