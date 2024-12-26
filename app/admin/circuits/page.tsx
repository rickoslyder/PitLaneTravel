"use server"

import { db } from "@/db/db"
import { circuitsTable } from "@/db/schema"
import { desc } from "drizzle-orm"
import Link from "next/link"
import { SelectCircuit } from "@/db/schema"

export default async function CircuitsAdminPage() {
  const circuits = await db
    .select()
    .from(circuitsTable)
    .orderBy(desc(circuitsTable.name))

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Circuits</h2>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Country
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {circuits.map((circuit: SelectCircuit) => (
              <tr key={circuit.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                  {circuit.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {circuit.country}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  <Link
                    href={`/admin/circuits/${circuit.id}`}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
