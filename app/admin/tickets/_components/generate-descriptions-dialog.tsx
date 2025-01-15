"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { toast } from "sonner"
import { SelectTicket } from "@/db/schema"
import { generateTicketDescriptionAction } from "@/actions/db/ai-actions"
import { updateTicketAction } from "@/actions/db/tickets-actions"
import { Check, X, Loader2 } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

interface GenerateDescriptionsDialogProps {
  children: React.ReactNode
  tickets: (SelectTicket & {
    race: { id: string; name: string; season: number }
  })[]
}

interface TicketState {
  currentDescription: string
  generatedDescription: string | null
  isGenerating: boolean
  isSaving: boolean
  error: string | null
  isApproved: boolean
  isSaved: boolean
}

export function GenerateDescriptionsDialog({
  children,
  tickets
}: GenerateDescriptionsDialogProps) {
  const [open, setOpen] = useState(false)
  const [ticketStates, setTicketStates] = useState<Record<number, TicketState>>(
    {}
  )
  const router = useRouter()

  // Filter tickets that have descriptions starting with "- "
  const eligibleTickets = tickets.filter(ticket =>
    ticket.description.trim().startsWith("- ")
  )

  const generateDescription = async (
    ticket: SelectTicket & { race: { name: string } }
  ) => {
    setTicketStates(prev => ({
      ...prev,
      [ticket.id]: {
        ...(prev[ticket.id] || {
          currentDescription: ticket.description,
          generatedDescription: null,
          isApproved: false,
          isSaved: false,
          error: null
        }),
        isGenerating: true,
        error: null
      }
    }))

    try {
      const result = await generateTicketDescriptionAction(
        ticket.title,
        ticket.race.name,
        ticket.description
      )

      if (result.isSuccess) {
        setTicketStates(prev => ({
          ...prev,
          [ticket.id]: {
            ...prev[ticket.id],
            generatedDescription: result.data,
            isGenerating: false
          }
        }))
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      setTicketStates(prev => ({
        ...prev,
        [ticket.id]: {
          ...prev[ticket.id],
          isGenerating: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to generate description"
        }
      }))
    }
  }

  const approveDescription = (ticketId: number) => {
    setTicketStates(prev => ({
      ...prev,
      [ticketId]: {
        ...prev[ticketId],
        isApproved: true
      }
    }))
  }

  const rejectDescription = (ticketId: number) => {
    setTicketStates(prev => ({
      ...prev,
      [ticketId]: {
        ...prev[ticketId],
        generatedDescription: null,
        isApproved: false
      }
    }))
  }

  const saveDescription = async (ticketId: number) => {
    const state = ticketStates[ticketId]
    if (!state?.generatedDescription || !state.isApproved) return

    setTicketStates(prev => ({
      ...prev,
      [ticketId]: {
        ...prev[ticketId],
        isSaving: true,
        error: null
      }
    }))

    try {
      const result = await updateTicketAction(ticketId, {
        description: state.generatedDescription
      })

      if (result.isSuccess) {
        setTicketStates(prev => ({
          ...prev,
          [ticketId]: {
            ...prev[ticketId],
            isSaving: false,
            isSaved: true,
            currentDescription: state.generatedDescription!
          }
        }))
        toast.success("Description updated successfully")
        router.refresh()
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      setTicketStates(prev => ({
        ...prev,
        [ticketId]: {
          ...prev[ticketId],
          isSaving: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to save description"
        }
      }))
      toast.error("Failed to update description")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Generate P1 Descriptions</DialogTitle>
          <DialogDescription>
            Generate and update descriptions for tickets that need improvement.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Ticket</TableHead>
                <TableHead className="w-[300px]">Current</TableHead>
                <TableHead className="w-[300px]">Generated</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eligibleTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No tickets found with descriptions starting with "- "
                  </TableCell>
                </TableRow>
              ) : (
                eligibleTickets.map(ticket => {
                  const state = ticketStates[ticket.id] || {
                    currentDescription: ticket.description,
                    generatedDescription: null,
                    isGenerating: false,
                    isSaving: false,
                    error: null,
                    isApproved: false,
                    isSaved: false
                  }

                  return (
                    <TableRow key={ticket.id} className="align-top">
                      <TableCell className="font-medium">
                        {ticket.title}
                      </TableCell>
                      <TableCell className="whitespace-pre-wrap text-sm">
                        {state.currentDescription}
                      </TableCell>
                      <TableCell className="whitespace-pre-wrap text-sm">
                        {state.generatedDescription || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!state.generatedDescription ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => generateDescription(ticket)}
                              disabled={state.isGenerating}
                            >
                              {state.isGenerating ? (
                                <>
                                  <Loader2 className="mr-2 size-3 animate-spin" />
                                  <span>Generating...</span>
                                </>
                              ) : (
                                "Generate"
                              )}
                            </Button>
                          ) : !state.isApproved ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-green-500 hover:bg-green-50 hover:text-green-600"
                                onClick={() => approveDescription(ticket.id)}
                              >
                                <Check className="size-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                onClick={() => rejectDescription(ticket.id)}
                              >
                                <X className="size-4" />
                              </Button>
                            </>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => saveDescription(ticket.id)}
                                    disabled={state.isSaving || state.isSaved}
                                    className="relative"
                                  >
                                    {state.isSaving ? (
                                      <>
                                        <Loader2 className="mr-2 size-3 animate-spin" />
                                        <span>Saving...</span>
                                      </>
                                    ) : state.isSaved ? (
                                      <>
                                        <Check className="mr-2 size-3 text-green-500" />
                                        <span>Saved!</span>
                                      </>
                                    ) : state.error ? (
                                      <>
                                        <X className="mr-2 size-3 text-red-500" />
                                        <span>Error</span>
                                      </>
                                    ) : (
                                      "Save"
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                {state.error && (
                                  <TooltipContent>
                                    <p>{state.error}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
