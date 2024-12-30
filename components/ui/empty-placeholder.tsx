"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {}

export function EmptyPlaceholder({
  className,
  children,
  ...props
}: EmptyPlaceholderProps) {
  return (
    <div
      className={cn(
        "animate-in fade-in-50 flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        {children}
      </div>
    </div>
  )
}

interface EmptyPlaceholderIconProps
  extends Partial<React.SVGProps<SVGSVGElement>> {
  name: "calendar" | "warning"
}

EmptyPlaceholder.Icon = function EmptyPlaceHolderIcon({
  name,
  className,
  ...props
}: EmptyPlaceholderIconProps) {
  const Icon = name === "calendar" ? Calendar : AlertTriangle

  return (
    <div className="bg-muted flex size-20 items-center justify-center rounded-full">
      <Icon className={cn("size-10", className)} {...props} />
    </div>
  )
}

interface EmptyPlaceholderTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

EmptyPlaceholder.Title = function EmptyPlaceholderTitle({
  className,
  ...props
}: EmptyPlaceholderTitleProps) {
  return (
    <h2 className={cn("mt-6 text-xl font-semibold", className)} {...props} />
  )
}

interface EmptyPlaceholderDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

EmptyPlaceholder.Description = function EmptyPlaceholderDescription({
  className,
  ...props
}: EmptyPlaceholderDescriptionProps) {
  return (
    <p
      className={cn(
        "text-muted-foreground mb-8 mt-3 text-center text-sm font-normal leading-6",
        className
      )}
      {...props}
    />
  )
}

interface EmptyPlaceholderButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href: string
}

EmptyPlaceholder.Button = function EmptyPlaceholderButton({
  className,
  href,
  children,
  ...props
}: EmptyPlaceholderButtonProps) {
  return (
    <Link href={href}>
      <Button
        variant="outline"
        className={cn("relative", className)}
        {...props}
      >
        {children}
      </Button>
    </Link>
  )
}
