/*
<ai_context>
This server layout provides a shared header and basic structure for (marketing) routes.
</ai_context>
*/

import { PublicShell } from "@/components/public-shell"

export default async function MarketingLayout({
  children
}: {
  children: React.ReactNode
}) {
  return <PublicShell>{children}</PublicShell>
}
