import { createFileRoute } from "@tanstack/react-router";
import { Globe, ShieldCheck, Accessibility, Handshake, Network } from "lucide-react";
import { AnimatedHero } from "@/components/ui/blocks/AnimatedHero";
import { BentoGrid, BentoCard } from "@/components/ui/blocks/BentoGrid";

export const Route = createFileRoute("/about/vision")({
  head: () => ({
    meta: [
      { title: "Vision & Mission | WISE" },
      { name: "description", content: "Discover WISE's vision for accessible global education and mission to provide UNESCO-aligned quality learning." },
    ],
  }),
  component: VisionMissionPage,
});

function VisionMissionPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <AnimatedHero 
        title="Vision & Mission"
        subtitle="Global education provider with a vision for accessible quality education worldwide."
        imageSrc="/images/vision-hero.jpg"
      />

      <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-primary">Our Purpose</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Shaping the Future of Education
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <h3 className="text-2xl font-bold tracking-tight text-foreground mb-4 border-l-4 border-primary pl-4">
              Our Vision
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              To become the most trusted and accessible international secondary examination system that reflects the highest benchmarks of academic integrity, learner-centric equity, and global educational coherence.
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <h3 className="text-2xl font-bold tracking-tight text-foreground mb-4 border-l-4 border-primary pl-4">
              Our Mission
            </h3>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                To certify learners through a unified, fair, and adaptable examination model recognized across international academic and vocational institutions.
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                To harmonize global secondary education standards in alignment with UN Sustainable Development Goal 4 (Quality Education for All).
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                To support schools, learners, and governments with tools that ensure measurable, meaningful, and transferable learning outcomes.
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-bold">•</span>
                To promote open, decentralized access to education using digital infrastructure, AI, and verifiable learning technologies.
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Our Core Principles
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The foundational values that guide our approach to global education.
            </p>
          </div>
          
          <BentoGrid>
            <BentoCard
              title="Equity & Inclusion"
              description="Ensuring every learner, regardless of geography or background, has access to a recognized, fair, and meaningful education assessment."
              icon={<Accessibility className="size-8" />}
              delay={0.1}
            />
            <BentoCard
              title="Global Relevance"
              description="Aligned with international frameworks such as UNESCO, ISCED, and SDG4, WISE builds bridges between local learning and global opportunity."
              icon={<Globe className="size-8" />}
              delay={0.2}
            />
            <BentoCard
              title="Academic Integrity"
              description="Upholding rigorous evaluation standards across all subjects, languages, and streams of knowledge."
              icon={<ShieldCheck className="size-8" />}
              delay={0.3}
            />
            <BentoCard
              title="Digital Accessibility"
              description="Using modern platforms to offer examinations, records, and credentials in secure, verifiable formats."
              icon={<Network className="size-8" />}
              delay={0.4}
              className="md:col-span-2"
            />
            <BentoCard
              title="Collaboration Over Competition"
              description="Partnering with schools, governments, NGOs, and learning communities worldwide."
              icon={<Handshake className="size-8" />}
              delay={0.5}
            />
          </BentoGrid>
        </div>
      </section>
    </main>
  );
}
