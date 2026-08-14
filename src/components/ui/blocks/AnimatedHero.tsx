import { motion } from "framer-motion";

interface AnimatedHeroProps {
  title: string;
  subtitle: string;
  imageSrc: string;
}

export function AnimatedHero({ title, subtitle, imageSrc }: AnimatedHeroProps) {
  return (
    <div className="relative flex h-[60vh] min-h-[500px] w-full items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <img
          src={imageSrc}
          alt={title}
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      </div>
      
      <div className="z-10 flex max-w-4xl flex-col items-center gap-6 px-6 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
        >
          {title}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          {subtitle}
        </motion.p>
      </div>
    </div>
  );
}
