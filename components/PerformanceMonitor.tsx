"use client"

import { useEffect } from "react"
import { onCLS, onFID, onLCP } from "web-vitals"

export default function PerformanceMonitor() {
  useEffect(() => {
    const reportWebVitals = ({
      name,
      value
    }: {
      name: string
      value: number
    }) => {
      console.log(`Web Vital: ${name}`, value)
      // Here you can send the metric to your analytics service
    }

    onCLS(reportWebVitals)
    onFID(reportWebVitals)
    onLCP(reportWebVitals)
  }, [])

  return null
}
