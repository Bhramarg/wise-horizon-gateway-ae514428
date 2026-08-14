import { createFileRoute } from "@tanstack/react-router";
import { AnimatedHero } from "@/components/ui/blocks/AnimatedHero";
import { BentoGrid, BentoCard } from "@/components/ui/blocks/BentoGrid";
import { Users, Globe2, Network, CheckCircle, Scale, Users2, ShieldCheck, Lightbulb } from "lucide-react";

export const Route = createFileRoute("/about/governing-body")({
  head: () => ({
    meta: [
      { title: "Governing Body | WISE" },
      { name: "description", content: "Meet the executive committee and advisory board that guide the World Education Quality Standard Commission (WEQSC)." },
    ],
  }),
  component: GoverningBodyPage,
});

function GoverningBodyPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <AnimatedHero 
        title="Governing Body"
        subtitle="Guided by distinguished educators, policymakers, and industry experts worldwide."
        imageSrc="/images/governing-body.jpg"
      />

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            WEQSC Executive Committee
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our governing body ensures that WISE maintains the highest standards of academic integrity and global relevance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { initials: "CW", name: "Dr. Catherine Williams", role: "Chairperson", desc: "Ph.D. Education Policy, Oxford University" },
            { initials: "MS", name: "Prof. Michael Singh", role: "Vice Chairperson", desc: "UNESCO Representative, Former Director of Education" },
            { initials: "AR", name: "Dr. Ahmed Rahman", role: "Secretary General", desc: "International Education Standards Expert" },
            { initials: "EJ", name: "Dr. Elizabeth Johnson", role: "Chief Academic Officer", desc: "Curriculum Development & Assessment Specialist" },
            { initials: "JL", name: "Prof. James Liu", role: "Technology Director", desc: "Digital Education & Innovation Expert" },
            { initials: "MG", name: "Dr. Maria Garcia", role: "Regional Director", desc: "International Partnerships & Recognition" },
          ].map((member, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl border bg-card p-8 text-center shadow-sm transition-all hover:shadow-md">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  {member.initials}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-foreground">{member.name}</h3>
                <p className="mb-3 font-medium text-primary">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-muted/50 py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Advisory Board & Regional Reps
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            <div className="rounded-2xl bg-card p-8 shadow-sm border border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <Users className="size-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Academic Advisors</h3>
              </div>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-center gap-3"><span className="text-primary font-bold">•</span> Prof. Sarah Thompson - Cambridge University</li>
                <li className="flex items-center gap-3"><span className="text-primary font-bold">•</span> Dr. Robert Chen - Stanford University</li>
                <li className="flex items-center gap-3"><span className="text-primary font-bold">•</span> Prof. Amira Hassan - American University of Cairo</li>
                <li className="flex items-center gap-3"><span className="text-primary font-bold">•</span> Dr. Klaus Mueller - Max Planck Institute</li>
                <li className="flex items-center gap-3"><span className="text-primary font-bold">•</span> Prof. Priya Sharma - Indian Institute of Technology</li>
              </ul>
            </div>

            <div className="rounded-2xl bg-card p-8 shadow-sm border border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <Network className="size-6 text-primary" />
                <h3 className="text-xl font-bold text-foreground">Industry Advisors</h3>
              </div>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-center gap-3"><span className="text-primary font-bold">•</span> John Anderson - Former CEO, Global Education Corp</li>
                <li className="flex items-center gap-3"><span className="text-primary font-bold">•</span> Lisa Zhang - Director, Microsoft Education</li>
                <li className="flex items-center gap-3"><span className="text-primary font-bold">•</span> David Brown - Senior VP, Pearson International</li>
                <li className="flex items-center gap-3"><span className="text-primary font-bold">•</span> Rachel Kim - Chief Learning Officer, IBM</li>
                <li className="flex items-center gap-3"><span className="text-primary font-bold">•</span> Mark Wilson - Founder, EdTech Innovations</li>
              </ul>
            </div>
          </div>

          <h3 className="text-2xl font-bold text-center mb-10 text-foreground">Regional Representatives</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { region: "Asia Pacific", name: "Dr. Hiroshi Tanaka", inst: "University of Tokyo" },
              { region: "Europe", name: "Prof. Anna Kowalski", inst: "Warsaw University" },
              { region: "Americas", name: "Dr. Carlos Mendoza", inst: "University of São Paulo" },
              { region: "Africa & Middle East", name: "Prof. Fatima Al-Zahra", inst: "University of Cape Town" },
            ].map((rep, i) => (
              <div key={i} className="rounded-2xl bg-card p-6 text-center shadow-sm border border-border/50">
                <Globe2 className="mx-auto size-8 text-primary/40 mb-4" />
                <h4 className="font-bold text-foreground mb-2">{rep.region}</h4>
                <p className="text-sm font-medium text-muted-foreground mb-1">{rep.name}</p>
                <p className="text-xs text-muted-foreground">{rep.inst}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Governance Principles
          </h2>
        </div>
        <BentoGrid>
          <BentoCard
            title="Transparency"
            description="All governance decisions are made transparently with clear documentation and stakeholder consultation."
            icon={<CheckCircle className="size-8" />}
            delay={0.1}
          />
          <BentoCard
            title="Accountability"
            description="Regular audits and reviews ensure accountability to students, institutions, and the global education community."
            icon={<Scale className="size-8" />}
            delay={0.2}
          />
          <BentoCard
            title="Inclusivity"
            description="Decision-making processes include diverse perspectives from all regions and stakeholder groups."
            icon={<Users2 className="size-8" />}
            delay={0.3}
          />
          <BentoCard
            title="Innovation"
            description="Continuous innovation in educational practices while maintaining established quality standards."
            icon={<Lightbulb className="size-8" />}
            delay={0.4}
            className="md:col-span-3 lg:col-span-1"
          />
        </BentoGrid>
      </section>
    </main>
  );
}
