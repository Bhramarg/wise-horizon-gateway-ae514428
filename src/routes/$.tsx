import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, FileText } from "lucide-react";

import { Reveal } from "@/components/site/motion";
import { lookupNav } from "@/lib/site-nav";

export const Route = createFileRoute("/$")({
  loader: ({ params }) => {
    const node = lookupNav(params._splat ?? "");
    if (!node) throw notFound();
    return { path: node.path, label: node.label, blurb: node.blurb ?? null };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Page unavailable — WISE" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.label} — WISE Geneva`;
    const description =
      loaderData.blurb ??
      `${loaderData.label}: official information from WISE, the Swiss-seated accreditation body operating within the UNESCO recognition framework.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: PlaceholderPage,
});

function PlaceholderPage() {
  const { _splat } = Route.useParams();
  const node = lookupNav(_splat ?? "");
  if (!node) return null;

  const siblings = node.section.children.map((child) => ({
    label: child.label,
    path: child.slug ? `${node.section.slug}/${child.slug}` : node.section.slug,
  }));

  return (
    <div className="mica-surface">
      <div className="mx-auto max-w-[1400px] px-6 py-16">
        <Reveal>
          <nav className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            <Link to="/" className="underline-sweep">
              Home
            </Link>
            {node.trail.map((crumb) => (
              <span key={crumb.path} className="flex items-center gap-2">
                <ChevronRight className="size-3" />
                <Link to="/$" params={{ _splat: crumb.path.slice(1) }} className="underline-sweep">
                  {crumb.label}
                </Link>
              </span>
            ))}
          </nav>
        </Reveal>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_320px]">
          <div>
            <Reveal>
              <p className="text-[11px] uppercase tracking-[0.28em] text-swiss">
                {node.section.label}
              </p>
              <h1 className="mt-4 font-display text-5xl font-light leading-[1.05] tracking-tight text-navy md:text-6xl">
                {node.label}
              </h1>
              {node.blurb ? (
                <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  {node.blurb}
                </p>
              ) : null}
            </Reveal>

            <Reveal delay={120}>
              <div className="acrylic mt-10 rounded-sm p-10">
                <div className="flex items-center gap-3 text-azure">
                  <FileText className="size-5" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em]">
                    Content in preparation
                  </span>
                </div>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                  This section of the WISE portal is being drafted by the Secretariat and will be
                  published following review by the relevant committee. Structural navigation is
                  already live so that stakeholders can map the full framework.
                </p>
                <Link
                  to="/$"
                  params={{ _splat: "contact-us/enquiry-form" }}
                  className="mt-7 inline-flex items-center gap-2 rounded-[3px] bg-navy px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white lift"
                >
                  Request this document <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </Reveal>

            {node.children.length ? (
              <Reveal delay={180}>
                <h2 className="mt-14 font-display text-[12px] font-semibold uppercase tracking-[0.2em] text-navy">
                  In this chapter
                </h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {node.children.map((child) => (
                    <li key={child.path}>
                      <Link
                        to="/$"
                        params={{ _splat: child.path.slice(1) }}
                        className="acrylic group flex items-center justify-between rounded-sm px-5 py-4 text-sm text-navy lift"
                      >
                        {child.label}
                        <ArrowRight className="size-4 text-azure transition-transform group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ) : null}
          </div>

          <Reveal delay={140} className="lg:pt-24">
            <aside className="acrylic rounded-sm p-6">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {node.section.label}
              </p>
              <ul className="mt-4 space-y-2.5">
                {siblings.map((sibling) => {
                  const active = "/" + sibling.path === node.path;
                  return (
                    <li key={sibling.label}>
                      <Link
                        to="/$"
                        params={{ _splat: sibling.path }}
                        className={`flex text-[13.5px] leading-snug transition-colors ${
                          active ? "font-semibold text-azure" : "text-muted-foreground hover:text-navy"
                        }`}
                      >
                        {sibling.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </aside>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
