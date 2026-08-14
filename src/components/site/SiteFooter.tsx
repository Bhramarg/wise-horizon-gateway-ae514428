import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

import { navigation } from "@/lib/site-nav";

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-navy-deep text-white">
      <div className="pointer-events-none absolute -left-32 top-0 size-[520px] rounded-full bg-azure/20 blur-[140px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 size-[420px] rounded-full bg-swiss/15 blur-[140px]" />

      <div className="relative mx-auto max-w-[1400px] px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_2.2fr]">
          <div>
            <img
              src="/wise-logo.png"
              alt="WISE — Weqsc International Secondary Examination"
              width={72}
              height={72}
              loading="lazy"
              className="size-[72px] object-contain"
            />
            <p className="mt-5 font-display text-2xl font-light tracking-tight">
              WISE — Weqsc International Secondary Examination
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              A WEQSC accreditation body seated in Switzerland, operating within the UNESCO
              recognition framework and the European qualification architecture.
            </p>
            <ul className="mt-7 space-y-2.5 text-sm text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 text-azure-soft" />
                Rue de Varembé 7, 1202 Geneva, Switzerland
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 text-azure-soft" />
                +41 22 000 18 00
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 text-azure-soft" />
                secretariat@weqsc.org
              </li>
            </ul>

            <form
              className="mt-8 flex max-w-sm overflow-hidden rounded-[3px] border border-white/20"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="Institutional email"
                className="w-full bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none"
              />
              <button className="bg-swiss px-5 text-[11px] font-semibold uppercase tracking-[0.16em]">
                Subscribe
              </button>
            </form>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 lg:grid-cols-4">
            {navigation.map((section) => (
              <div key={section.slug}>
                <Link
                  to="/$"
                  params={{ _splat: section.slug }}
                  className="font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-azure-soft"
                >
                  {section.label}
                </Link>
                <ul className="mt-3 space-y-1.5">
                  {section.children.slice(0, 6).map((child) => (
                    <li key={child.label}>
                      <Link
                        to="/$"
                        params={{
                          _splat: child.slug ? `${section.slug}/${child.slug}` : section.slug,
                        }}
                        className="text-[13px] leading-snug text-white/60 transition-colors hover:text-white"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 pt-6 text-[11px] uppercase tracking-[0.16em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} WISE · WEQSC. Geneva, Switzerland.</p>
          <div className="flex flex-wrap gap-5">
            <Link to="/$" params={{ _splat: "resources-library/policies-and-procedures/legal-framework" }}>
              Legal
            </Link>
            <Link
              to="/$"
              params={{ _splat: "resources-library/policies-and-procedures/data-protection-policy" }}
            >
              Data protection
            </Link>
            <Link to="/my-wise" className="flex items-center gap-1 text-white/70">
              My WISE <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
