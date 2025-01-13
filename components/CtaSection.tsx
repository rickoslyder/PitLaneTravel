"use client"

import { useState } from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { subscribeToNewsletter } from "../actions/newsletter-actions"
import { Loader2 } from "lucide-react"

export default function CtaSection() {
  const [email, setEmail] = useState("")
  const [state, formAction] = useActionState(subscribeToNewsletter, null)

  return (
    <section className="mt-20 bg-gradient-to-b from-[#E10600] to-[#B30500] py-20 text-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="mb-4 text-center text-4xl font-bold">
            Ready to Plan Your Ultimate F1 Experience?
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-white/90">
            Join PitLane Travel today and make your race weekend unforgettable
          </p>
          <motion.form
            className="mx-auto flex max-w-xl flex-col items-center justify-center gap-4 sm:flex-row"
            action={formAction}
          >
            <div className="relative w-full max-w-sm">
              <Input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-12 bg-white/10 text-white placeholder:text-white/70 focus-visible:ring-white"
              />
              {state?.validating && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="size-5 animate-spin text-white" />
                </div>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              variant="secondary"
              className="h-12 w-full bg-white px-8 text-lg font-semibold text-[#E10600] hover:bg-white/90 sm:w-auto"
              disabled={state?.validating}
            >
              {state?.validating ? "Submitting..." : "Get Started Now"}
            </Button>
          </motion.form>
          {state && !state.validating && (
            <motion.p
              className={`mt-4 text-center ${state.success ? "text-green-300" : "text-red-300"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {state.message}
            </motion.p>
          )}
        </motion.div>
      </div>
    </section>
  )
}
