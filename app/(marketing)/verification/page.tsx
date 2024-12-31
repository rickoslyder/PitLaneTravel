/*
<ai_context>
This server page returns a simple component as a (marketing) route, to be used for verification.
</ai_context>
*/

"use server"

export default async function VerificationPage() {
  return (
    <div>Impact-Site-Verification: 8f1c643f-d8d0-43d7-82ab-1ae7127952ca</div>
  )
}
