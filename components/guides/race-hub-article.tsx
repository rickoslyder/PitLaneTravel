import Link from "next/link"
import type { ReactNode } from "react"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import { AFFILIATE_LINK_REL } from "@/lib/race-hub-subpages"

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

function isSponsoredHref(href: string): boolean {
  try {
    const host = new URL(href).hostname.toLowerCase().replace(/^www\./, "")
    return host === "pxf.io" || host.endsWith(".pxf.io")
  } catch {
    return false
  }
}

/** HTML anchors in the approved copy become markdown links with the same rel. */
export function articleMarkdown(source: string): string {
  return source.replace(
    /<a href="([^"]+)" rel="sponsored nofollow">([^<]+)<\/a>/g,
    (_, href, label) => `[${label}](${href})`
  )
}

export function RaceHubArticle({ source }: { source: string }) {
  let paragraph = 0
  const components: Components = {
    a: ({ href, children }) => {
      if (!href) return <>{children}</>
      if (href.startsWith("/")) return <Link href={href}>{children}</Link>
      if (isSponsoredHref(href)) {
        return (
          <a href={href} rel={AFFILIATE_LINK_REL}>
            {children}
          </a>
        )
      }
      return <a href={href}>{children}</a>
    },
    p: ({ children }) => {
      paragraph += 1
      if (paragraph === 1) {
        return (
          <p data-answer-first className="text-base leading-relaxed">
            {children}
          </p>
        )
      }
      return <p className="leading-relaxed">{children}</p>
    },
    h2: ({ children }) => (
      <h2
        id={headingId(children)}
        className="text-2xl font-semibold tracking-tight"
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 id={headingId(children)} className="text-lg font-semibold">
        {children}
      </h3>
    ),
    table: ({ children }) => (
      <div className="my-6 overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th scope="col" className="border-b px-3 py-2 font-semibold">
        {children}
      </th>
    ),
    td: ({ children }) => <td className="border-b px-3 py-2">{children}</td>
  }

  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {articleMarkdown(source)}
      </ReactMarkdown>
    </div>
  )
}
