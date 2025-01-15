"use client"

import { Component, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCcw } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public reset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="border-destructive/20 bg-destructive/5 flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-lg border p-6 text-center">
            <AlertCircle className="text-destructive size-12" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Something went wrong</h3>
              <p className="text-muted-foreground text-sm">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
            </div>
            <Button variant="outline" className="mt-2" onClick={this.reset}>
              <RefreshCcw className="mr-2 size-4" />
              Try again
            </Button>
          </div>
        )
      )
    }

    return this.props.children
  }
}
