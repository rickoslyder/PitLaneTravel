"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"

export default function NotFoundContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <h1 className="text-4xl font-bold tracking-tight">404</h1>
      <h2 className="text-muted-foreground text-2xl font-semibold">
        Page not found
      </h2>
      <p className="text-muted-foreground mx-auto max-w-[500px]">
        That page has moved or doesn&apos;t exist. Let&apos;s get you back to
        the racing.
      </p>

      <Button asChild className="mt-8">
        <Link href="/">Back to home</Link>
      </Button>
    </motion.div>
  )
}
