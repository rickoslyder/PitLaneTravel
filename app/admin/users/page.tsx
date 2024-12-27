"use server"

import { Suspense } from "react"
import { PageHeader } from "@/components/page-header"
import { UsersTable } from "./_components/users-table"
import { UsersSkeleton } from "./_components/users-skeleton"
import { db } from "@/db/db"
import { profilesTable } from "@/db/schema"
import { count, sql } from "drizzle-orm"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Shield, Crown } from "lucide-react"

async function UserStats() {
  const [totalUsers] = await db.select({ value: count() }).from(profilesTable)
  const [adminCount] = await db
    .select({ value: count() })
    .from(profilesTable)
    .where(sql`is_admin = true`)
  const [proCount] = await db
    .select({ value: count() })
    .from(profilesTable)
    .where(sql`membership = 'pro'`)

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <Users className="text-muted-foreground size-5" />
            <div>
              <p className="text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold">{totalUsers.value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <Shield className="text-muted-foreground size-5" />
            <div>
              <p className="text-sm font-medium">Admins</p>
              <p className="text-2xl font-bold">{adminCount.value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-4">
            <Crown className="text-muted-foreground size-5" />
            <div>
              <p className="text-sm font-medium">Pro Users</p>
              <p className="text-2xl font-bold">{proCount.value}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

async function UsersTableWrapper() {
  const profiles = await db.select().from(profilesTable)
  return <UsersTable initialData={profiles} />
}

export default async function UsersPage() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <PageHeader
        title="User Management"
        description="Manage user profiles, memberships, and admin access"
      />

      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className="size-5 animate-pulse rounded bg-gray-200" />
                    <div>
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                      <div className="mt-1 h-7 w-16 animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <UserStats />
      </Suspense>

      <Suspense fallback={<UsersSkeleton />}>
        <UsersTableWrapper />
      </Suspense>
    </div>
  )
}
