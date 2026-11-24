import "@/app/global-styles"
import { PublicShell } from "@/components/public-shell"

export default function CircuitsLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <PublicShell>{children}</PublicShell>
}
