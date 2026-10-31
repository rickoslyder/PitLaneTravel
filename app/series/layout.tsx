import { PublicShell } from "@/components/public-shell"

export default function SeriesLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <PublicShell>{children}</PublicShell>
}