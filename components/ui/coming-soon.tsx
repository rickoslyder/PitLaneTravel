"use client"

import { motion } from "framer-motion"
import { Construction } from "lucide-react"

interface ComingSoonProps {
  title?: string
  description?: string
}

export function ComingSoon({
  title = "Coming Soon",
  description = "This feature is under construction. Check back later!"
}: ComingSoonProps) {
  return (
    <div className="from-background to-muted/20 relative flex h-[70vh] w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b p-4">
      {/* Background Pattern */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"
        style={{
          maskImage: "radial-gradient(circle at center, black, transparent 80%)"
        }}
      />

      <div className="relative space-y-8">
        {/* Icon with glow effect */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
          className="relative flex justify-center"
        >
          <div className="bg-primary/10 absolute -inset-4 rounded-full blur-xl" />
          <Construction className="text-primary relative size-20" />
        </motion.div>

        {/* Text content with staggered animation */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
          className="space-y-4 text-center"
        >
          <motion.h2
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 }
            }}
            className="from-foreground to-foreground/70 bg-gradient-to-br bg-clip-text text-4xl font-bold tracking-tight text-transparent"
          >
            {title}
          </motion.h2>

          <motion.p
            variants={{
              hidden: { y: 20, opacity: 0 },
              visible: { y: 0, opacity: 1 }
            }}
            className="text-muted-foreground mx-auto max-w-md text-lg"
          >
            {description}
          </motion.p>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute inset-0 -z-10"
        >
          <div className="bg-primary/5 absolute left-1/2 top-1/2 size-32 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
          <div className="bg-primary/5 absolute left-1/4 top-1/4 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
          <div className="bg-primary/5 absolute bottom-1/4 right-1/4 size-48 translate-x-1/2 translate-y-1/2 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </div>
  )
}
