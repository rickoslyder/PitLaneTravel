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
        Page Not Found
      </h2>
      <p className="text-muted-foreground mx-auto max-w-[500px]">
        Oops! The page you're looking for doesn't exist or has been moved. Let's
        get you back on track.
      </p>

      <Button asChild className="mt-8">
        <Link href="/">Return Home</Link>
      </Button>
    </motion.div>
  )
}
