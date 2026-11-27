import { PublicShell } from "@/components/public-shell"

export default function RacesLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <PublicShell showFooter={false}>{children}</PublicShell>
}
