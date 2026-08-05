# WISE — Landing Page + My WISE Login

Build the public face of WISE (World Institute for Standards in Education / WEQSC), a Swiss-based accreditation body: one long, animated landing page with an extra-large mega-menu, plus a striking "My WISE" login page. All other menu destinations get real routes but intentionally empty placeholder pages.

## Visual direction

Bright-white "acrylic / mica" surface language: layered frosted glass panels, soft translucency, subtle noise, large airy whitespace, thin hairline rules. Swiss-institutional accent palette — deep Geneva navy, UNESCO blue, and a restrained Swiss red highlight. Type: large condensed/geometric headings with a light-weight editorial body face. Motion everywhere but disciplined: scroll-reveal fades and slides, parallax hero, counters that animate on entry, hover lift on cards, animated underlines, marquee ticker, smooth mega-menu open/close. Respect `prefers-reduced-motion`.

## Top chrome (all pages)

1. **News ticker band** (above everything): continuously scrolling line of European / UNESCO headlines.
2. **Utility bar**: live weather + temperature for Geneva, language stub, and a prominent **My WISE** button.
3. **Main navigation**: extra-large mega-menu panels with frosted-glass backdrop, column layouts, section descriptions, and full sub-tree links from the WISE menu structure.

## Landing page sections (long scroll)

- Cinematic hero: layered acrylic cards over a Geneva/Alps backdrop, headline, dual CTAs.
- Breaking news + official announcements (UNESCO / Swiss Federal) split panel.
- Quick stats band: accredited schools, countries, candidates, exam centres — animated counters.
- Ministerial / Secretary-General message with portrait and signature.
- Recognition framework rail: Lisbon Convention, EQF, EHEA, Swiss cantonal system.
- Accreditation lifecycle: animated 4-step path (interest → self-evaluation → site visit → decision).
- Examinations showcase: WISE International Secondary Examination, benchmarking vs IB / A-Levels / Matura.
- Accredited school directory teaser with search field.
- Partners / governmental logos marquee.
- Events & press strip.
- Newsletter + full institutional footer mirroring the sitemap.

## My WISE

- `/my-wise` — full-bleed split login: animated acrylic left panel with brand motion, right panel with a glass login card. Email + password form and **Continue with Google**. Also links to the three portals (school accreditation, exam centre, government recognition).
- Login is functional against Neon: users table, hashed passwords, session cookie. Google sign-in wired through the provided Google OAuth client.

## Menu pages (placeholders)

Every node in the supplied sitemap gets a route rendering a shared placeholder shell: page title, breadcrumb, section nav, and a "Content coming soon" state. Sections covered: about-wise, recognition-and-standards, accreditation, examinations, government-relations, news-events, resources-library, portal-login, contact-us — including all listed children.

## Technical notes

- Data layer: Neon Postgres via `@neondatabase/serverless`, accessed only from TanStack `createServerFn` handlers. `DATABASE_URL` stored as a project secret (never in client code).
- Auth: server functions for signup/login/logout with `bcrypt`-style hashing (edge-safe implementation), HTTP-only session cookie, plus Google OAuth using `GOOGLE_OAUTH_CLIENT_ID` / `GOOGLE_OAUTH_CLIENT_SECRET` secrets. `VITE_*` client id used only for the browser-side button.
- Weather: Open-Meteo (no key) for Geneva, fetched server-side and cached.
- News ticker: curated UNESCO / European headline list served from a server function so it can later be swapped for a live feed.
- Routing: file-based routes under `src/routes/`, one file per sitemap node; shared `MegaMenu`, `NewsTicker`, `WeatherBadge`, `SiteFooter`, `PlaceholderPage` components.
- Animation: CSS/Tailwind keyframes plus a small intersection-observer reveal hook — no heavy animation dependency.
- SEO: unique `head()` title/description/OG per route.

## Secrets needed

`DATABASE_URL`, `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET` — I'll prompt for these when implementing.
