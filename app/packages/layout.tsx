import { PublicShell } from "@/components/public-shell"

export default function PackagesLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <PublicShell>{children}</PublicShell>
}
