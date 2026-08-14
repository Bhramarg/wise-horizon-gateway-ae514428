import { createFileRoute } from "@tanstack/react-router";
import { AnimatedHero } from "@/components/ui/blocks/AnimatedHero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/about/faq")({
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions | WISE" },
      { name: "description", content: "Find answers to common questions about WISE examinations, eligibility, fees, and more." },
    ],
  }),
  component: FAQPage,
});

const faqData = [
  {
    category: "General Questions",
    items: [
      { q: "What is WISE?", a: "WISE (WEQSC International Secondary Examination) is a globally-aligned, academically rigorous, and socially conscious certification framework established under the World Education Quality Standard Commission (WEQSC), Geneva in 1991. It provides internationally recognized secondary education credentials." },
      { q: "Is WISE recognized globally?", a: "Yes, WISE certifications are benchmarked against international standards and recognized by universities, employers, and educational institutions worldwide. Our framework is aligned with UNESCO ISCED guidelines and supports UN SDG 4." },
      { q: "How is WISE different from other examination boards?", a: "WISE is designed as a public-good initiative focused on equity, inclusion, and accessibility. It offers 100% online examinations, flexible scheduling, blockchain-verifiable certificates, and is specifically designed to serve learners across diverse cultural and economic contexts." }
    ]
  },
  {
    category: "Eligibility & Applications",
    items: [
      { q: "Who can apply for WISE examinations?", a: "WISE is ideal for students seeking flexible secondary education, homeschooled learners, adult learners returning to education, and anyone needing globally recognized credentials. Minimum age requirements are 15 years for WISE X and 16 years for WISE XII." },
      { q: "What are the admission requirements?", a: "For WISE X: Completion of Grade 9 or equivalent, minimum age 15, English proficiency (IELTS 5.5 for non-native speakers). For WISE XII: Successful completion of WISE X or equivalent Grade 10, minimum age 16, English proficiency (IELTS 6.0)." },
      { q: "How do I apply for WISE examinations?", a: "You can apply through our online application portal. Complete the application form, submit required documents, pay the application fee, and select your preferred examination schedule. Our admissions team will guide you through the process." }
    ]
  },
  {
    category: "Examinations & Assessment",
    items: [
      { q: "Are the examinations conducted online?", a: "Yes, all WISE examinations are conducted 100% online using secure, AI-proctored platforms. This ensures accessibility while maintaining examination integrity and security standards." },
      { q: "How many subjects can I choose?", a: "For WISE X: 6-10 subjects including core subjects (English, Mathematics, Science, Social Studies) and electives. For WISE XII: 3-6 subjects depending on your chosen stream (Science, Commerce, or Humanities)." },
      { q: "How is the assessment structured?", a: "WISE X: 30% continuous assessment, 70% final examination. WISE XII: 20% internal assessment, 80% theory examination. Results are processed quickly with digital certificates issued promptly." }
    ]
  },
  {
    category: "Certificates & Recognition",
    items: [
      { q: "What type of certificates are issued?", a: "WISE issues digital transcripts and blockchain-verifiable certificates that are internationally recognized. These certificates are equivalent to Class 10/Grade 10 (WISE X) and Class 12/Grade 12 (WISE XII) certifications." },
      { q: "Will universities accept my WISE certificate?", a: "Yes, WISE certificates are accepted by universities worldwide for undergraduate admissions. Our alignment with international standards ensures recognition across educational institutions globally." },
      { q: "How can I verify my WISE certificate?", a: "WISE certificates are blockchain-verifiable and can be authenticated through our online verification system. Employers and institutions can instantly verify the authenticity of your credentials." }
    ]
  },
  {
    category: "Technical & Support",
    items: [
      { q: "What technical requirements do I need?", a: "You need a stable internet connection, a computer with webcam and microphone, and access to our online examination platform. Technical specifications and system requirements are provided upon registration." },
      { q: "What support is available during examinations?", a: "We provide 24/7 technical support during examination periods, comprehensive preparation materials, practice tests, and dedicated support teams to assist with any issues that may arise." },
      { q: "What if I face technical issues during the exam?", a: "Our emergency helpline (emergency@wise.weqsc.org) is available 24/7 during examination periods. Technical issues are resolved immediately, and alternative arrangements are made if necessary." }
    ]
  },
  {
    category: "Fees & Financial Aid",
    items: [
      { q: "What are the examination fees?", a: "Application fees are non-refundable and vary by region (typically $50-$500 USD). Detailed fee structures are available on our website and vary based on the number of subjects and examination level." },
      { q: "Are scholarships or financial aid available?", a: "Yes, WISE offers financial aid and scholarship programs for deserving students. Applications for financial assistance can be submitted along with your examination application." }
    ]
  }
];

function FAQPage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <AnimatedHero 
        title="Frequently Asked Questions"
        subtitle="Find answers to common questions about WISE examinations, eligibility, fees, and more."
        imageSrc="/images/faq-hero.jpg"
      />

      <section className="mx-auto max-w-4xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="space-y-16">
          {faqData.map((section, idx) => (
            <div key={idx}>
              <h2 className="text-2xl font-bold tracking-tight text-foreground mb-8 border-b border-border pb-4">
                {section.category}
              </h2>
              <Accordion type="single" collapsible className="w-full space-y-4">
                {section.items.map((item, i) => (
                  <AccordionItem key={i} value={`item-${idx}-${i}`} className="border bg-card rounded-xl px-6">
                    <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline hover:text-primary py-4">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
