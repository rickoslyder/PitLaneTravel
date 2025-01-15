"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function ProgressIndicator() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const calculateProgress = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const maxScroll = documentHeight - windowHeight
      const currentProgress = (scrollTop / maxScroll) * 100
      setProgress(Math.min(currentProgress, 100))
    }

    calculateProgress()
    window.addEventListener("scroll", calculateProgress)
    window.addEventListener("resize", calculateProgress)

    return () => {
      window.removeEventListener("scroll", calculateProgress)
      window.removeEventListener("resize", calculateProgress)
    }
  }, [])

  return (
    <div className="bg-muted fixed inset-x-0 top-0 z-[100] h-0.5">
      <motion.div
        className="bg-primary h-full"
        style={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  )
}
