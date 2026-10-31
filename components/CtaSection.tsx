"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { FlagIcon } from "lucide-react"
import Link from "next/link"

export default function CtaSection() {
  return (
    <section className="bg-foreground text-background mt-20 py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="mb-4 text-center text-4xl font-bold">
            Ready to compare race weekends?
          </h2>
          <p className="text-background/90 mx-auto mb-12 max-w-2xl text-center text-lg">
            Open the five-series calendar and start from a real event.
          </p>
          <div className="flex justify-center">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-lg font-semibold"
            >
              <Link href="/races">
                <FlagIcon className="mr-2 size-5" />
                View Race Calendar
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
