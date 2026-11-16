export type AtAGlanceRow = {
  topic: string
  verdict: string
}

export function AtAGlanceTable({
  caption,
  rows
}: {
  caption: string
  rows: readonly AtAGlanceRow[]
}) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <caption className="mb-3 caption-top text-left text-base font-semibold">
          {caption}
        </caption>
        <thead>
          <tr>
            <th scope="col" className="border-b px-3 py-2 font-semibold">
              Topic
            </th>
            <th scope="col" className="border-b px-3 py-2 font-semibold">
              Verdict
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.topic}>
              <th scope="row" className="border-b px-3 py-2 font-semibold">
                {row.topic}
              </th>
              <td className="border-b px-3 py-2">{row.verdict}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
