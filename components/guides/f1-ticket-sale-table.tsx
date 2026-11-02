import type { ReactNode } from "react"
import type { F1TicketSaleRow } from "@/data/guides/f1-2027-ticket-sales"
import { guideAffiliateRel } from "@/lib/guide-links"

function renderInline(text: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g
  const nodes: ReactNode[] = []
  let last = 0
  let match: RegExpExecArray | null
  let key = 0
  while ((match = pattern.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index))
    const token = match[0]
    if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>)
    } else {
      const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token)
      if (link) {
        const rel = guideAffiliateRel(link[2])
        nodes.push(
          <a
            key={key}
            href={link[2]}
            {...(rel ? { target: "_blank", rel } : {})}
          >
            {link[1]}
          </a>
        )
      }
    }
    key += 1
    last = match.index + token.length
  }
  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

export function F1TicketSaleTable({
  rows
}: {
  rows: readonly F1TicketSaleRow[]
}) {
  return (
    <div className="my-6 overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>Race (2027)</th>
            <th>On-sale date (local / UK)</th>
            <th>Official seller</th>
            <th>Status</th>
            <th>Source + checked</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.race}>
              <td>{row.race}</td>
              <td>{renderInline(row.onSaleDate)}</td>
              <td>{row.seller}</td>
              <td>{renderInline(row.status)}</td>
              <td>{renderInline(row.source)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
