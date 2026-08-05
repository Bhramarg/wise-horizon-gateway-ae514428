import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  ClipboardCheck,
  FileSearch,
  Globe2,
  GraduationCap,
  Landmark,
  Quote,
  Search,
  ShieldCheck,
  Stamp,
} from "lucide-react";

import { Counter, Reveal } from "@/components/site/motion";
import heroImage from "@/assets/wise-hero.jpg";

export const Route = createFileRoute("/")({
  head: () => {
    const title = "WISE — Swiss Accreditation Body for International Education";
    const description =
      "WISE is a Geneva-seated accreditation body operating within the UNESCO recognition framework: school accreditation, government equivalency and the WISE International Secondary Examination.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
      ],
    };
  },
  component: Landing,
});

const stats = [
  { value: 1420, suffix: "", label: "Accredited schools worldwide" },
  { value: 96, suffix: "", label: "Countries with recognition agreements" },
  { value: 38400, suffix: "", label: "Examination candidates in 2025" },
  { value: 99.2, suffix: "%", decimals: 1, label: "Monitoring compliance rate" },
];

const frameworks = [
  {
    icon: Globe2,
    title: "Lisbon Recognition Convention",
    body: "Our recognition methodology is anchored in the UNESCO/Council of Europe treaty and the 1999 recommendation on international access qualifications.",
    to: "recognition-and-standards/unesco-conventions/lisbon-recognition-convention",
  },
  {
    icon: Landmark,
    title: "EQF & EHEA alignment",
    body: "WISE qualification levels are referenced to the European Qualifications Framework and the Bologna standards for the European Higher Education Area.",
    to: "recognition-and-standards/european-regulatory-framework/eqf-alignment",
  },
  {
    icon: Building2,
    title: "Swiss federal architecture",
    body: "Seated in Geneva and read across the 26 cantons, with liaison to SERI for the recognition of foreign qualifications.",
    to: "recognition-and-standards/swiss-education-system/federalism-and-cantons",
  },
];

const lifecycle = [
  {
    step: "01",
    icon: FileSearch,
    title: "Expression of interest",
    body: "Eligibility screening and candidacy dossier opened by the Secretariat.",
    to: "accreditation/for-schools-international/application-process/expression-of-interest",
  },
  {
    step: "02",
    icon: ClipboardCheck,
    title: "Self-evaluation report",
    body: "The school evidences leadership, curriculum, staffing and infrastructure against WISE standards.",
    to: "accreditation/for-schools-international/application-process/self-evaluation-report",
  },
  {
    step: "03",
    icon: ShieldCheck,
    title: "Verification site visit",
    body: "The WISE Inspectorate verifies evidence on site and interviews the community.",
    to: "accreditation/for-schools-international/application-process/verification-site-visit",
  },
  {
    step: "04",
    icon: Stamp,
    title: "Accreditation decision",
    body: "Provisional or full accreditation granted by the Executive Committee, with biennial monitoring.",
    to: "accreditation/for-schools-international/application-process/accreditation-decision",
  },
];

const announcements = [
  {
    tag: "UNESCO",
    date: "12 July",
    title: "Reciprocal recognition protocol extended to four new state parties",
  },
  {
    tag: "Swiss Federal Council",
    date: "04 July",
    title: "Bilateral dialogue confirms equivalency route for WISE secondary certificates",
  },
  {
    tag: "Secretariat",
    date: "28 June",
    title: "2026 accreditation cycle opens for expressions of interest",
  },
  {
    tag: "Examinations",
    date: "19 June",
    title: "November session timetable and centre security protocols published",
  },
];

const partners = [
  "UNESCO",
  "Council of Europe",
  "European Commission",
  "SERI Switzerland",
  "EHEA / Bologna",
  "OECD",
  "Commonwealth Secretariat",
  "African Union CESA",
];

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`relative px-6 py-24 md:py-32 ${className}`}>
      <div className="mx-auto max-w-[1400px]">{children}</div>
    </section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-swiss">
      <span className="h-px w-10 bg-swiss" />
      {children}
    </p>
  );
}

function Landing() {
  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative min-h-[92vh] overflow-hidden">
        <img
          src={heroImage}
          alt="The WISE Secretariat building on Lake Geneva with the Alps behind"
          width={1920}
          height={1200}
          className="absolute inset-0 size-full animate-drift object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/70 to-white" />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />

        <div className="relative mx-auto grid max-w-[1400px] gap-14 px-6 pb-24 pt-24 lg:grid-cols-[1.15fr_0.85fr] lg:pt-32">
          <div>
            <Reveal>
              <Eyebrow>Geneva · Switzerland · Since 1997</Eyebrow>
            </Reveal>
            <Reveal delay={90}>
              <h1 className="mt-7 font-display text-[13vw] font-extralight uppercase leading-[0.88] tracking-[-0.03em] text-navy sm:text-[9vw] lg:text-[6.6rem]">
                Standards
                <br />
                <span className="font-semibold">that travel</span>
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                WISE is the accreditation body of the World Education Quality &amp; Standards
                Council. We accredit international schools, benchmark national curricula and award
                the WISE International Secondary Examination — recognised within the UNESCO
                convention framework and the European qualification architecture.
              </p>
            </Reveal>
            <Reveal delay={260}>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  to="/$"
                  params={{ _splat: "accreditation/for-schools-international/application-process" }}
                  className="group relative inline-flex items-center gap-3 overflow-hidden rounded-[3px] bg-navy px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white lift"
                >
                  <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  <span className="relative">Begin accreditation</span>
                  <ArrowRight className="relative size-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  to="/$"
                  params={{ _splat: "accreditation/accredited-school-directory" }}
                  className="acrylic inline-flex items-center gap-3 rounded-[3px] px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy lift"
                >
                  School directory <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={220} className="self-end">
            <div className="acrylic animate-float rounded-sm p-8">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Verify an award
              </p>
              <h2 className="mt-3 font-display text-2xl font-light text-navy">
                Certificate verification
              </h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                Universities, ministries and employers can authenticate any WISE certificate by
                candidate number.
              </p>
              <form
                className="mt-6 flex items-center gap-2 border-b border-navy/20 pb-2"
                onSubmit={(event) => event.preventDefault()}
              >
                <Search className="size-4 text-azure" />
                <input
                  placeholder="WISE-2025-000000"
                  className="w-full bg-transparent text-sm text-navy placeholder:text-muted-foreground/70 focus:outline-none"
                />
                <button className="text-[11px] font-semibold uppercase tracking-[0.16em] text-azure">
                  Check
                </button>
              </form>
              <div className="mt-7 grid grid-cols-3 gap-4 border-t border-navy/10 pt-6 text-center">
                {[
                  { k: "96", v: "States" },
                  { k: "1,420", v: "Schools" },
                  { k: "AA+", v: "Assurance" },
                ].map((item) => (
                  <div key={item.v}>
                    <p className="font-display text-xl font-semibold text-navy">{item.k}</p>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      {item.v}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ANNOUNCEMENTS */}
      <Section className="mica-surface">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <Reveal>
              <Eyebrow>Official announcements</Eyebrow>
              <h2 className="mt-6 font-display text-4xl font-light leading-[1.05] text-navy md:text-5xl">
                Statements from the Secretariat, UNESCO and the Swiss authorities
              </h2>
              <p className="mt-6 max-w-lg leading-relaxed text-muted-foreground">
                Every policy change, recognition decree and examination notice is published here
                first and mirrored to national committees within 48 hours.
              </p>
              <Link
                to="/$"
                params={{ _splat: "news-events/announcements" }}
                className="mt-8 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-azure underline-sweep"
              >
                All announcements <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          </div>
          <ul className="space-y-3">
            {announcements.map((item, index) => (
              <Reveal as="li" key={item.title} delay={index * 90}>
                <Link
                  to="/$"
                  params={{ _splat: "news-events/press-releases" }}
                  className="acrylic group flex items-start gap-5 rounded-sm p-6 lift"
                >
                  <span className="mt-1 w-16 shrink-0 text-[10px] font-semibold uppercase tracking-[0.14em] text-swiss">
                    {item.date}
                  </span>
                  <span>
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      {item.tag}
                    </span>
                    <span className="mt-1.5 block font-display text-[17px] font-medium leading-snug text-navy">
                      {item.title}
                    </span>
                  </span>
                  <ArrowUpRight className="ml-auto size-4 shrink-0 text-azure transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </Link>
              </Reveal>
            ))}
          </ul>
        </div>
      </Section>

      {/* STATS */}
      <section className="relative overflow-hidden bg-navy px-6 py-24 text-white">
        <div className="pointer-events-none absolute -left-24 top-0 size-[460px] rounded-full bg-azure/25 blur-[130px]" />
        <div className="pointer-events-none absolute -right-16 bottom-0 size-[380px] rounded-full bg-swiss/20 blur-[130px]" />
        <div className="relative mx-auto max-w-[1400px]">
          <Reveal>
            <p className="text-[11px] uppercase tracking-[0.28em] text-azure-soft">Fast facts</p>
          </Reveal>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <Reveal key={stat.label} delay={index * 110}>
                <div className="border-t border-white/15 pt-6">
                  <p className="font-display text-5xl font-light tracking-tight md:text-6xl">
                    <Counter value={stat.value} suffix={stat.suffix} decimals={stat.decimals ?? 0} />
                  </p>
                  <p className="mt-3 max-w-[16rem] text-[13px] uppercase leading-snug tracking-[0.12em] text-white/60">
                    {stat.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MESSAGE */}
      <Section>
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <div className="acrylic relative rounded-sm p-10">
              <span className="absolute -right-4 -top-4 grid size-14 place-items-center rounded-[3px] bg-swiss text-white">
                <Quote className="size-6" />
              </span>
              <p className="font-serif text-2xl font-light leading-snug text-navy">
                “Recognition is trust made portable. A learner in Nairobi, Ho Chi Minh City or
                Zürich must be able to carry a WISE award across any border and be read the same
                way.”
              </p>
              <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-navy">
                Dr. Élise Ramseyer
              </p>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                Secretary-General, WISE Geneva
              </p>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <Eyebrow>Message from the Secretariat</Eyebrow>
            <h2 className="mt-6 font-display text-4xl font-light leading-[1.08] text-navy md:text-5xl">
              A mandate written with ministries, not around them
            </h2>
            <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
              WISE works through national committees that sit inside ministries of education. Our
              standards are drafted in public consultation, referenced to the European
              Qualifications Framework, and monitored by an independent inspectorate. The result is
              an award that admissions officers and labour authorities can read without
              translation.
            </p>
            <div className="mt-9 grid gap-4 sm:grid-cols-2">
              {[
                { icon: BadgeCheck, label: "Independent inspectorate" },
                { icon: GraduationCap, label: "Attainment-referenced grading" },
                { icon: Globe2, label: "96 recognition agreements" },
                { icon: ShieldCheck, label: "Biennial compliance review" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm text-navy">
                  <item.icon className="size-5 text-azure" />
                  {item.label}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </Section>

      {/* FRAMEWORKS */}
      <Section className="mica-surface">
        <Reveal>
          <Eyebrow>Recognition &amp; standards</Eyebrow>
          <h2 className="mt-6 max-w-3xl font-display text-4xl font-light leading-[1.05] text-navy md:text-5xl">
            Three instruments hold the framework together
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {frameworks.map((item, index) => (
            <Reveal key={item.title} delay={index * 120}>
              <Link
                to="/$"
                params={{ _splat: item.to }}
                className="acrylic group flex h-full flex-col rounded-sm p-9 lift"
              >
                <span className="grid size-12 place-items-center rounded-[3px] bg-navy/5 text-azure">
                  <item.icon className="size-6" />
                </span>
                <h3 className="mt-7 font-display text-2xl font-light leading-tight text-navy">
                  {item.title}
                </h3>
                <p className="mt-4 text-[14.5px] leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
                <span className="mt-8 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-azure">
                  Read the framework
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* LIFECYCLE */}
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <Eyebrow>Accreditation lifecycle</Eyebrow>
            <h2 className="mt-6 max-w-2xl font-display text-4xl font-light leading-[1.05] text-navy md:text-5xl">
              Four stages from candidacy to full accreditation
            </h2>
          </Reveal>
          <Reveal delay={100}>
            <Link
              to="/$"
              params={{ _splat: "accreditation/for-schools-international/fees-and-timeline" }}
              className="text-[11px] font-semibold uppercase tracking-[0.2em] text-azure underline-sweep"
            >
              Fees &amp; timeline
            </Link>
          </Reveal>
        </div>

        <div className="relative mt-16">
          <div className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-azure/40 to-transparent lg:block" />
          <div className="grid gap-8 lg:grid-cols-4">
            {lifecycle.map((item, index) => (
              <Reveal key={item.step} delay={index * 140}>
                <Link to="/$" params={{ _splat: item.to }} className="group block">
                  <span className="relative grid size-14 place-items-center rounded-full bg-white text-azure shadow-[0_10px_30px_-12px_rgba(20,40,80,0.35)]">
                    <span className="absolute inset-0 animate-pulse-ring rounded-full border border-azure/40" />
                    <item.icon className="size-6" />
                  </span>
                  <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-swiss">
                    {item.step}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-medium leading-snug text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-azure opacity-0 transition-opacity group-hover:opacity-100">
                    Open stage <ArrowRight className="size-3.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* EXAMINATIONS */}
      <section className="relative overflow-hidden bg-navy-deep px-6 py-28 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute left-1/4 top-10 size-[520px] animate-float rounded-full bg-azure/25 blur-[150px]" />
          <div className="absolute bottom-0 right-10 size-[380px] rounded-full bg-swiss/20 blur-[130px]" />
        </div>
        <div className="relative mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <p className="flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-azure-soft">
              <span className="h-px w-10 bg-azure-soft" />
              Examinations
            </p>
            <h2 className="mt-6 font-display text-4xl font-extralight uppercase leading-[0.95] tracking-tight md:text-6xl">
              The WISE International
              <br />
              <span className="font-semibold">Secondary Examination</span>
            </h2>
            <p className="mt-7 max-w-xl leading-relaxed text-white/65">
              A pre-college qualification built on attainment referencing rather than cohort
              curves, with continuous internal assessment verified by the WISE Inspectorate and a
              secure global session calendar.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/$"
                params={{ _splat: "examinations/for-students/registration-guidance" }}
                className="rounded-[3px] bg-white px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy lift"
              >
                Student registration
              </Link>
              <Link
                to="/$"
                params={{ _splat: "examinations/for-schools-exam-centres/registration-as-examination-centre" }}
                className="acrylic-dark rounded-[3px] px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white lift"
              >
                Become an exam centre
              </Link>
            </div>
          </Reveal>

          <Reveal delay={140}>
            <div className="acrylic-dark rounded-sm p-8">
              <p className="text-[10px] uppercase tracking-[0.22em] text-azure-soft">
                Global benchmarking
              </p>
              <ul className="mt-6 space-y-5">
                {[
                  { name: "WISE ISE Level 5", note: "EQF 4 · University entrance", width: "94%" },
                  { name: "International Baccalaureate DP", note: "Comparable band", width: "92%" },
                  { name: "GCE A-Level", note: "Comparable band", width: "90%" },
                  { name: "Swiss Matura", note: "Reference qualification", width: "96%" },
                ].map((row, index) => (
                  <li key={row.name}>
                    <div className="flex items-baseline justify-between text-sm">
                      <span className="font-medium">{row.name}</span>
                      <span className="text-[11px] uppercase tracking-[0.14em] text-white/50">
                        {row.note}
                      </span>
                    </div>
                    <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-azure to-white/80 transition-[width] duration-[1400ms] ease-out"
                        style={{ width: row.width, transitionDelay: `${index * 160}ms` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                to="/$"
                params={{ _splat: "examinations/the-examination-system/global-benchmarking" }}
                className="mt-8 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-azure-soft underline-sweep"
              >
                Benchmarking methodology <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* DIRECTORY */}
      <Section className="mica-surface">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <Eyebrow>Accredited school directory</Eyebrow>
            <h2 className="mt-6 font-display text-4xl font-light leading-[1.05] text-navy md:text-5xl">
              1,420 schools. Filterable by country, cycle and status.
            </h2>
            <p className="mt-6 max-w-lg leading-relaxed text-muted-foreground">
              Ministries and universities use the directory as the authoritative source of WISE
              accreditation status, including provisional standing and withdrawal notices.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="acrylic rounded-sm p-8">
              <form
                className="flex items-center gap-3 border-b border-navy/20 pb-3"
                onSubmit={(event) => event.preventDefault()}
              >
                <Search className="size-5 text-azure" />
                <input
                  placeholder="Search school, city or country"
                  className="w-full bg-transparent text-[15px] text-navy placeholder:text-muted-foreground/70 focus:outline-none"
                />
              </form>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Switzerland", "Kenya", "Vietnam", "Brazil", "UAE", "Provisional", "Full"].map(
                  (chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-navy/12 px-3.5 py-1.5 text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:border-azure hover:text-azure"
                    >
                      {chip}
                    </span>
                  ),
                )}
              </div>
              <Link
                to="/$"
                params={{ _splat: "accreditation/accredited-school-directory" }}
                className="mt-8 inline-flex items-center gap-2 rounded-[3px] bg-navy px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white lift"
              >
                Open directory <ArrowRight className="size-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* PARTNERS MARQUEE */}
      <section className="border-y border-border bg-white py-10">
        <div className="relative overflow-hidden">
          <div className="flex w-max animate-marquee-slow items-center">
            {[...partners, ...partners].map((partner, index) => (
              <span
                key={index}
                className="mx-10 whitespace-nowrap font-display text-lg font-light uppercase tracking-[0.18em] text-navy/35"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <Section>
        <Reveal>
          <div className="acrylic relative overflow-hidden rounded-sm px-8 py-16 text-center md:px-20">
            <div className="pointer-events-none absolute -left-20 -top-24 size-[340px] rounded-full bg-azure/15 blur-[110px]" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 size-[300px] rounded-full bg-swiss/12 blur-[110px]" />
            <p className="relative text-[11px] uppercase tracking-[0.28em] text-swiss">
              My WISE portal
            </p>
            <h2 className="relative mx-auto mt-6 max-w-3xl font-display text-4xl font-light leading-[1.05] text-navy md:text-6xl">
              One secure identity for schools, centres and ministries
            </h2>
            <p className="relative mx-auto mt-6 max-w-xl leading-relaxed text-muted-foreground">
              Submit self-evaluations, administer examination sessions and verify recognition status
              from a single authenticated workspace.
            </p>
            <div className="relative mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/my-wise"
                className="group inline-flex items-center gap-3 overflow-hidden rounded-[3px] bg-navy px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white lift"
              >
                <span className="relative">Enter My WISE</span>
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/$"
                params={{ _splat: "contact-us/enquiry-form" }}
                className="inline-flex items-center gap-3 rounded-[3px] border border-navy/15 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-navy lift"
              >
                Contact the Secretariat
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>
    </div>
  );
}
