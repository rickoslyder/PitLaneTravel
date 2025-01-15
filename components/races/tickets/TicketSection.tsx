"use client"

import { RaceWithDetails } from "@/types/race"
import { SelectTicket, SelectTicketPackage } from "@/db/schema"
import { Suspense, useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TicketCard } from "./TicketCard"
import { PackageCard } from "./PackageCard"
import { TicketCardSkeleton } from "./TicketCardSkeleton"
import { useTickets } from "./use-tickets"

type Ticket = SelectTicket & { features: any[]; currentPrice: any }

export function TicketSection({ race }: { race: RaceWithDetails }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const { data, loading } = useTickets(race.id)

  const filteredTickets = data?.tickets?.filter((ticket: Ticket) => {
    const matchesSearch =
      searchQuery === "" ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.seatingDetails?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType =
      selectedType === "all" || ticket.ticketType === selectedType

    return matchesSearch && matchesType
  })

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>Race Tickets</h2>
          <p>Loading tickets...</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <TicketCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (!data?.tickets?.length && !data?.packages?.length) {
    return (
      <div className="space-y-8">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2>Race Tickets</h2>
          <p>No tickets are currently available for {race.name}.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <h2>Race Tickets</h2>
        <p>
          Choose from our selection of tickets for the {race.name}. All tickets
          include access to the circuit for the entire race weekend.
        </p>
      </div>

      <TicketFilters
        searchQuery={searchQuery}
        selectedType={selectedType}
        onSearchChange={setSearchQuery}
        onTypeChange={setSelectedType}
      />

      <Tabs defaultValue="individual">
        <TabsList>
          <TabsTrigger value="individual">Individual Tickets</TabsTrigger>
          <TabsTrigger value="packages">Ticket Packages</TabsTrigger>
        </TabsList>

        <TabsContent value="individual">
          <div className="grid gap-6 lg:grid-cols-3">
            <Suspense fallback={<TicketCardSkeleton />}>
              {filteredTickets?.map((ticket: Ticket, index: number) => (
                <TicketCard key={ticket.id} ticket={ticket} index={index} />
              ))}
            </Suspense>
          </div>
        </TabsContent>

        <TabsContent value="packages">
          <div className="grid gap-6 lg:grid-cols-2">
            <Suspense fallback={<TicketCardSkeleton />}>
              {data?.packages?.map(
                (
                  package_: SelectTicketPackage & { tickets: any[] },
                  index: number
                ) => (
                  <PackageCard
                    key={package_.id}
                    package_={package_}
                    index={index}
                  />
                )
              )}
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TicketFilters({
  searchQuery,
  selectedType,
  onSearchChange,
  onTypeChange
}: {
  searchQuery: string
  selectedType: string
  onSearchChange: (value: string) => void
  onTypeChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:w-96">
        <Search className="text-muted-foreground absolute left-2 top-2.5 size-4" />
        <Input
          placeholder="Search tickets..."
          className="pl-8"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={selectedType} onValueChange={onTypeChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="general_admission">General Admission</SelectItem>
          <SelectItem value="grandstand">Grandstand</SelectItem>
          <SelectItem value="vip">VIP</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
