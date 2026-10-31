import Link from "next/link"
import type { ReactNode } from "react"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import remarkGfm from "remark-gfm"

function headingText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children)
  }
  if (Array.isArray(children)) return children.map(headingText).join("")
  if (children && typeof children === "object" && "props" in children) {
    const element = children as { props?: { children?: ReactNode } }
    return headingText(element.props?.children)
  }
  return ""
}

function headingId(children: ReactNode): string {
  return headingText(children)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
}

const components: Components = {
  a: ({ href, children }) => {
    if (!href) return <>{children}</>
    if (href.startsWith("/")) {
      return <Link href={href}>{children}</Link>
    }
    return <a href={href}>{children}</a>
  },
  h2: ({ children }) => <h2 id={headingId(children)}>{children}</h2>,
  h3: ({ children }) => <h3 id={headingId(children)}>{children}</h3>,
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table>{children}</table>
    </div>
  )
}

export function GuideMarkdown({ source }: { source: string }) {
  return (
    <div className="prose prose-neutral dark:prose-invert prose-headings:scroll-mt-24 prose-h1:text-3xl prose-h1:font-semibold prose-h1:tracking-tight sm:prose-h1:text-4xl prose-p:leading-relaxed prose-a:font-medium max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  )
}
