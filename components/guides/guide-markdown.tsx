import Link from "next/link"
import ReactMarkdown from "react-markdown"
import type { Components } from "react-markdown"
import remarkGfm from "remark-gfm"

const components: Components = {
  a: ({ href, children }) => {
    if (!href) return <>{children}</>
    if (href.startsWith("/")) {
      return <Link href={href}>{children}</Link>
    }
    return <a href={href}>{children}</a>
  },
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
