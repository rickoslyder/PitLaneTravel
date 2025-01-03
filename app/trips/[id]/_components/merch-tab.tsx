"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Trip, SavedMerch } from "@/types/trip"
import { ShoppingBag, Edit2, Save, X } from "lucide-react"

interface MerchTabProps {
  trip: Trip
  userId: string
  editingSection: string | null
  setEditingSection: (section: string | null) => void
  editedTrip: Trip
  setEditedTrip: (trip: Trip) => void
}

export function MerchTab({
  trip,
  userId,
  editingSection,
  setEditingSection,
  editedTrip,
  setEditedTrip
}: MerchTabProps) {
  const handleAddMerch = () => {
    const newMerch: SavedMerch = {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      category: "clothing",
      price: "0",
      currency: "USD",
      inStock: "available"
    }

    setEditedTrip({
      ...editedTrip,
      savedMerch: [...(editedTrip.savedMerch || []), newMerch]
    })
  }

  const handleRemoveMerch = (id: string) => {
    setEditedTrip({
      ...editedTrip,
      savedMerch: editedTrip.savedMerch?.filter(item => item.id !== id)
    })
  }

  const handleMerchChange = (
    id: string,
    field: keyof SavedMerch,
    value: any
  ) => {
    setEditedTrip({
      ...editedTrip,
      savedMerch: editedTrip.savedMerch?.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle>Race Merchandise</CardTitle>
          <CardDescription>
            Keep track of merchandise you want to buy at the race
          </CardDescription>
        </div>
        {editingSection === "merch" ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingSection(null)}
            >
              <X className="mr-2 size-4" />
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setEditingSection(null)}
            >
              <Save className="mr-2 size-4" />
              Save Changes
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditingSection("merch")}
          >
            <Edit2 className="mr-2 size-4" />
            Edit Merch
          </Button>
        )}
      </CardHeader>

      <CardContent>
        {editingSection === "merch" ? (
          <div className="space-y-6">
            {editedTrip.savedMerch?.map(item => (
              <div key={item.id} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-medium">
                    <span className="bg-primary size-2 rounded-full" />
                    Merchandise Item
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMerch(item.id)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="e.g. Team Cap"
                      value={item.name}
                      onChange={e =>
                        handleMerchChange(item.id, "name", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={item.category}
                      onValueChange={value =>
                        handleMerchChange(item.id, "category", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="accessories">Accessories</SelectItem>
                        <SelectItem value="memorabilia">Memorabilia</SelectItem>
                        <SelectItem value="collectibles">
                          Collectibles
                        </SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={item.price}
                      onChange={e =>
                        handleMerchChange(item.id, "price", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input
                      placeholder="USD"
                      value={item.currency}
                      onChange={e =>
                        handleMerchChange(item.id, "currency", e.target.value)
                      }
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="Add a description..."
                      value={item.description}
                      onChange={e =>
                        handleMerchChange(
                          item.id,
                          "description",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input
                      placeholder="https://..."
                      value={item.imageUrl}
                      onChange={e =>
                        handleMerchChange(item.id, "imageUrl", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Purchase URL</Label>
                    <Input
                      placeholder="https://..."
                      value={item.purchaseUrl}
                      onChange={e =>
                        handleMerchChange(
                          item.id,
                          "purchaseUrl",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button onClick={handleAddMerch} className="w-full">
              <ShoppingBag className="mr-2 size-4" />
              Add Merchandise Item
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {trip.savedMerch && trip.savedMerch.length > 0 ? (
              trip.savedMerch.map(item => (
                <div key={item.id} className="space-y-4">
                  <h3 className="flex items-center gap-2 font-medium">
                    <span className="bg-primary size-2 rounded-full" />
                    {item.name}
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Category</div>
                      <div className="text-muted-foreground capitalize">
                        {item.category}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-medium">Price</div>
                      <div className="text-muted-foreground">
                        {item.price} {item.currency}
                      </div>
                    </div>

                    <div className="col-span-2 space-y-1">
                      <div className="text-sm font-medium">Description</div>
                      <div className="text-muted-foreground">
                        {item.description}
                      </div>
                    </div>

                    {item.purchaseUrl && (
                      <div className="col-span-2">
                        <Button
                          variant="outline"
                          asChild
                          className="w-full sm:w-auto"
                        >
                          <a
                            href={item.purchaseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ShoppingBag className="mr-2 size-4" />
                            Purchase Item
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground py-8 text-center">
                No merchandise items added yet
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
