import { motion } from "framer-motion";
import { ReactNode } from "react";

export function BentoGrid({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto ${className}`}>
      {children}
    </div>
  );
}

export function BentoCard({
  title,
  description,
  icon,
  className = "",
  delay = 0,
}: {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md ${className}`}
    >
      <div className="z-10 flex flex-col gap-4">
        {icon && <div className="text-primary">{icon}</div>}
        <div className="space-y-2">
          <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity hover:opacity-100" />
    </motion.div>
  );
}
