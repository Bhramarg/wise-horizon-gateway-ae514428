import { createFileRoute } from "@tanstack/react-router";
import { AnimatedHero } from "@/components/ui/blocks/AnimatedHero";
import { motion } from "framer-motion";

export const Route = createFileRoute("/about/chairperson")({
  head: () => ({
    meta: [
      { title: "Chairperson's Message | WISE" },
      { name: "description", content: "Read the inspiring message from WISE Chairperson Dr. Catherine Williams about our commitment to quality education." },
    ],
  }),
  component: ChairpersonMessagePage,
});

function ChairpersonMessagePage() {
  return (
    <main className="min-h-screen bg-background pb-20">
      <AnimatedHero 
        title="Chairperson's Message"
        subtitle="Leadership Vision for Global Education"
        imageSrc="/images/chairperson.jpg"
      />

      <section className="mx-auto max-w-5xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-start">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-1/3 flex flex-col items-center text-center sticky top-24"
          >
            <div className="overflow-hidden rounded-2xl shadow-lg border border-border/50">
              <img 
                src="/images/chairperson.jpg" 
                alt="Dr. Catherine Williams" 
                className="w-full aspect-[3/4] object-cover"
              />
            </div>
            <div className="mt-6">
              <h3 className="text-2xl font-bold text-foreground">Dr. Catherine Williams</h3>
              <p className="text-primary font-medium mt-1">Chairperson, WEQSC</p>
              <p className="text-muted-foreground text-sm mt-2">Ph.D. Education Policy, Oxford</p>
              <p className="text-muted-foreground text-sm">Geneva, Switzerland</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:w-2/3 prose prose-lg dark:prose-invert"
          >
            <blockquote className="text-3xl font-light text-foreground mb-12 border-l-4 border-primary pl-6 italic">
              "Education is the most powerful weapon which you can use to change the world, but only when it is accessible to all."
            </blockquote>
            
            <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
              <p className="font-semibold text-foreground">
                Dear Learners, Educators, and Global Education Community,
              </p>
              
              <p>
                It is with great pride and unwavering commitment that I welcome you to WISE – the WEQSC International Secondary Examination. For over three decades, WISE has stood as a beacon of educational excellence, equity, and innovation in the global education landscape.
              </p>
              
              <p>
                When we established WISE in 1991, our vision was simple yet revolutionary: to create an examination system that would break down the barriers that prevent learners from accessing quality secondary education. Today, that vision has evolved into a comprehensive framework that serves thousands of students across continents, providing them with internationally recognized credentials that open doors to higher education and meaningful careers.
              </p>
              
              <p>
                What sets WISE apart is not just our academic rigor or international recognition, but our unwavering commitment to equity and inclusion. We believe that every learner, regardless of their geographical location, economic background, or personal circumstances, deserves access to quality education that is respected and valued worldwide.
              </p>
            </div>

            <div className="mt-16">
              <h2 className="text-3xl font-bold text-foreground mb-6">Our Commitment to Excellence</h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
                <p>
                  The world of education is rapidly evolving, and WISE continues to lead this transformation. Our adoption of cutting-edge technologies, including AI-powered assessment tools and blockchain-verified credentials, ensures that our students receive not just a certificate, but a passport to global opportunities.
                </p>
                
                <p>
                  Our alignment with UNESCO's ISCED guidelines and the UN Sustainable Development Goal 4 reflects our commitment to contributing meaningfully to the global education ecosystem. We are not just an examination board; we are partners in the worldwide effort to make quality education accessible to all.
                </p>
                
                <p>
                  The flexibility and accessibility of our 100% online examination system have proven especially valuable in today's interconnected world. Whether you are a traditional student, a homeschooled learner, an adult returning to education, or someone seeking alternative pathways to academic success, WISE provides the framework and support you need to achieve your educational goals.
                </p>
              </div>
            </div>

            <div className="mt-16">
              <h2 className="text-3xl font-bold text-foreground mb-6">Looking Toward the Future</h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
                <p>
                  As we look toward the future, our commitment remains steadfast: to continue innovating and expanding access to quality secondary education while maintaining the highest standards of academic integrity. We are continuously working with universities, employers, and educational institutions worldwide to ensure that WISE credentials continue to be recognized and valued.
                </p>
                
                <p>
                  Our upcoming initiatives include enhanced digital learning resources, expanded partnership networks, and continued integration of emerging technologies to make education even more accessible and effective. We are also developing new pathways for vocational and technical education to meet the evolving needs of the global workforce.
                </p>
                
                <p>
                  To our students: Your success is our success. Every certificate we issue represents not just academic achievement, but a step toward a more equitable and educated world. We are honored to be part of your educational journey and committed to supporting you every step of the way.
                </p>
              </div>
            </div>

            <div className="mt-16 rounded-2xl bg-muted/50 p-8 border border-border/50">
              <p className="text-lg text-foreground font-medium mb-6">
                To educators and institutions: We invite you to join us in this mission. Together, we can build a global education ecosystem that truly serves every learner, regardless of their starting point or circumstances.
              </p>
              <p className="text-xl text-primary font-semibold">
                Thank you for choosing WISE. Thank you for believing in the power of inclusive, accessible, and excellent education.
              </p>
            </div>
          </motion.div>

        </div>
      </section>
    </main>
  );
}
