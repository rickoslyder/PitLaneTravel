"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { TransformedFlightOffer } from "@/types/duffel"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  Check,
  Info,
  Plane,
  User,
  CreditCard,
  Luggage
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DuffelPassengerTitle,
  DuffelPassengerType,
  DuffelPassengerGender
} from "@/types/duffel"
import { formatTime, formatDate, formatDuration } from "@/lib/utils"
import PhoneInput, {
  isValidPhoneNumber,
  formatPhoneNumber
} from "react-phone-number-input"
import "react-phone-number-input/style.css"
import { sendGTMEvent } from "@next/third-parties/google"

interface FlightBookingFormProps {
  offer: TransformedFlightOffer
  passengerCount: number
  onClose: () => void
  raceId?: string
  userId?: string
}

interface PassengerDetails {
  id: string
  type: DuffelPassengerType
  title: DuffelPassengerTitle
  gender: DuffelPassengerGender
  given_name: string
  family_name: string
  email: string
  phone_number: string
  born_on: string
  isPhoneValid?: boolean
}

const steps = [
  {
    id: "flight",
    name: "Flight Details",
    icon: Plane
  },
  {
    id: "passengers",
    name: "Passenger Information",
    icon: User
  },
  {
    id: "payment",
    name: "Payment",
    icon: CreditCard
  }
] as const

function FlightSegment({
  segment
}: {
  segment: TransformedFlightOffer["slices"][0]["segments"][0]
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr,auto,1fr]">
      {/* Departure */}
      <div>
        <div className="text-sm font-medium">
          {formatTime(segment.departure.time)}
        </div>
        <div className="text-muted-foreground text-xs">
          {formatDate(segment.departure.time)}
        </div>
        <div className="text-sm">{segment.departure.airport}</div>
        {segment.departure.city && (
          <div className="text-muted-foreground text-xs">
            {segment.departure.city}
            {segment.departure.terminal &&
              ` • Terminal ${segment.departure.terminal}`}
          </div>
        )}
      </div>

      {/* Duration */}
      <div className="flex flex-col items-center justify-center">
        <div className="text-xs font-medium">
          {formatDuration(segment.duration)}
        </div>
        <div className="relative flex w-full items-center justify-center">
          <div className="bg-border absolute inset-x-0 h-[1px]" />
          <Plane className="bg-background relative size-3 rotate-0" />
        </div>
        <div className="text-muted-foreground text-xs">
          Flight {segment.flight_number}
        </div>
      </div>

      {/* Arrival */}
      <div className="text-right">
        <div className="text-sm font-medium">
          {formatTime(segment.arrival.time)}
        </div>
        <div className="text-muted-foreground text-xs">
          {formatDate(segment.arrival.time)}
        </div>
        <div className="text-sm">{segment.arrival.airport}</div>
        {segment.arrival.city && (
          <div className="text-muted-foreground text-xs">
            {segment.arrival.city}
            {segment.arrival.terminal &&
              ` • Terminal ${segment.arrival.terminal}`}
          </div>
        )}
      </div>
    </div>
  )
}

function FlightSlice({
  slice,
  index
}: {
  slice: TransformedFlightOffer["slices"][0]
  index: number
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">
          {index === 0 ? "Outbound" : "Return"} Flight
        </Badge>
        <div className="text-muted-foreground text-sm">
          Total duration: {formatDuration(slice.duration)}
        </div>
      </div>

      {slice.segments.map((segment, segmentIndex) => (
        <div key={`${segment.flight_number}-${segmentIndex}`}>
          <FlightSegment segment={segment} />
          {segmentIndex < slice.segments.length - 1 && (
            <div className="bg-muted/50 text-muted-foreground my-2 rounded-md p-2 text-center text-xs">
              Connection time:{" "}
              {formatDuration(
                String(
                  Math.floor(
                    (new Date(
                      slice.segments[segmentIndex + 1].departure.time
                    ).getTime() -
                      new Date(segment.arrival.time).getTime()) /
                      1000
                  )
                )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export function FlightBookingForm({
  offer,
  passengerCount,
  onClose,
  raceId,
  userId
}: FlightBookingFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState("flight")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [passengers, setPassengers] = useState<PassengerDetails[]>(
    offer.passengers.map(offerPassenger => ({
      id: offerPassenger.id,
      type: offerPassenger.type,
      title: "mr" as DuffelPassengerTitle,
      gender: "m" as DuffelPassengerGender,
      given_name: "",
      family_name: "",
      email: "",
      phone_number: "",
      born_on: "",
      isPhoneValid: false
    }))
  )

  const handlePassengerChange = (
    index: number,
    field: keyof PassengerDetails,
    value: any
  ) => {
    setPassengers(prev =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    )
  }

  const handleSubmit = async () => {
    setErrors([]) // Clear previous errors

    // Validate passenger details
    const isValid = passengers.every(passenger => {
      return (
        passenger.given_name &&
        passenger.family_name &&
        passenger.email &&
        passenger.phone_number &&
        passenger.isPhoneValid &&
        passenger.title &&
        passenger.born_on
      )
    })

    if (!isValid) {
      toast.error("Please fill in all passenger details")
      return
    }

    if (!raceId) {
      toast.error("Race ID is required")
      return
    }

    setIsLoading(true)
    let flightDetails =
      offer.slices
        ?.map(slice =>
          slice.segments.map(segment => segment.flight_number).join(", ")
        )
        .join(" / ") || "Flight number not available"

    try {
      // Format phone numbers before submission
      const formattedPassengers = passengers.map(passenger => ({
        ...passenger,
        phone_number: passenger.phone_number.startsWith("+")
          ? passenger.phone_number
          : `+${passenger.phone_number.replace(/^0+/, "")}`
      }))

      sendGTMEvent({
        event: "add_payment_info",
        user_data: {
          external_id: userId ?? null,
          email: formattedPassengers[0].email,
          phone_number: formattedPassengers[0].phone_number,
          title: formattedPassengers[0].title,
          gender: formattedPassengers[0].gender,
          passenger_type: formattedPassengers[0].type,
          first_name: formattedPassengers[0].given_name,
          last_name: formattedPassengers[0].family_name,
          city: offer.slices?.[0]?.departure?.city,
          dob: formattedPassengers[0].born_on
        },
        x_fb_ud_external_id: userId ?? null,
        items: [
          {
            item_name: flightDetails,
            quantity: 1,
            price: offer.total_amount,
            item_category: "flight",
            item_brand: offer.airline.name
          }
        ]
      })

      const response = await fetch("/api/flights/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          offerId: offer.id,
          passengers: formattedPassengers,
          raceId
        })
      })

      const data = await response.json()
      if (!response.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          // Extract error messages from the Duffel API error response
          const errorMessages = data.errors.map(
            (error: any) => error.message || error.title
          )
          setErrors(errorMessages)
          toast.error(data.error || "Failed to book flight")
        } else {
          throw new Error(data.error || "Failed to book flight")
        }
        return
      }

      toast.success("Flight booked successfully!")
      sendGTMEvent({
        event: "purchase",
        user_data: {
          external_id: userId ?? null,
          email: formattedPassengers[0].email,
          phone_number: formattedPassengers[0].phone_number,
          title: formattedPassengers[0].title,
          gender: formattedPassengers[0].gender,
          passenger_type: formattedPassengers[0].type,
          first_name: formattedPassengers[0].given_name,
          last_name: formattedPassengers[0].family_name,
          city: offer.slices?.[0]?.departure?.city,
          dob: formattedPassengers[0].born_on
        },
        x_fb_ud_external_id: userId ?? null,
        currency: offer.total_currency,
        value: offer.total_amount,
        items: [
          {
            item_name: flightDetails,
            quantity: 1,
            price: offer.total_amount,
            item_category: "flight",
            item_brand: offer.airline.name
          }
        ]
      })
      router.push(`/flights/confirmation?bookingId=${data.data.bookingId}`)
    } catch (error) {
      console.error("Error booking flight:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to book flight"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep === "flight") {
      setCurrentStep("passengers")
      let flightDetails =
        offer.slices
          ?.map(slice =>
            slice.segments.map(segment => segment.flight_number).join(", ")
          )
          .join(" / ") || "Flight number not available"
      sendGTMEvent({
        event: "initiate_checkout",
        user_data: {
          external_id: userId ?? null
        },
        x_fb_ud_external_id: userId ?? null,
        items: [
          {
            item_name: flightDetails,
            quantity: 1,
            price: offer.total_amount,
            item_category: "flight",
            item_brand: offer.airline.name
          }
        ]
      })
    } else if (currentStep === "passengers") {
      // Validate all passenger details before proceeding
      const isValid = passengers.every(passenger => {
        return (
          passenger.given_name &&
          passenger.family_name &&
          passenger.email &&
          passenger.phone_number &&
          passenger.isPhoneValid &&
          passenger.title &&
          passenger.born_on
        )
      })

      if (!isValid) {
        toast.error("Please fill in all passenger details correctly")
        return
      }

      setCurrentStep("payment")
    }
  }

  const prevStep = () => {
    if (currentStep === "payment") setCurrentStep("passengers")
    else if (currentStep === "passengers") setCurrentStep("flight")
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Book Flight</DialogTitle>
          <DialogDescription>
            Please enter passenger details for your flight from{" "}
            {offer.slices?.[0]?.departure?.city ||
              offer.slices?.[0]?.departure?.airport}{" "}
            to{" "}
            {offer.slices?.[0]?.arrival?.city ||
              offer.slices?.[0]?.arrival?.airport}
            {offer.slices?.[1] && " (Round Trip)"}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <nav aria-label="Progress">
          <ol
            role="list"
            className="space-y-4 md:flex md:space-x-8 md:space-y-0"
          >
            {steps.map(
              (
                step: { id: string; name: string; icon: any },
                index: number
              ) => (
                <li key={step.id} className="md:flex-1">
                  <div
                    className={cn(
                      "group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                      currentStep === step.id
                        ? "border-primary"
                        : index <
                            steps.findIndex(
                              (s: { id: string }) => s.id === currentStep
                            )
                          ? "border-primary"
                          : "border-muted"
                    )}
                  >
                    <span className="text-sm font-medium">
                      <step.icon className="mr-2 inline-block size-4" />
                      {step.name}
                    </span>
                  </div>
                </li>
              )
            )}
          </ol>
        </nav>

        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>
              <div className="mt-2">
                {errors.map((error, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span>•</span>
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {currentStep === "flight" && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  {/* Airline Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {offer.airline.logo_symbol_url ? (
                        <img
                          src={offer.airline.logo_symbol_url}
                          alt={offer.airline.name}
                          className="size-12 object-contain"
                        />
                      ) : (
                        <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
                          <Plane className="text-primary size-6" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{offer.airline.name}</div>
                        <div className="text-muted-foreground text-sm">
                          {offer.slices
                            ?.map((slice, i) =>
                              slice.segments
                                ?.map(segment => segment.flight_number)
                                .join(", ")
                            )
                            .join(" / ") || "Flight number not available"}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {offer.total_amount} {offer.total_currency}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {offer.tax_amount && offer.tax_currency
                          ? `Including ${offer.tax_amount} ${offer.tax_currency} tax`
                          : "Tax included"}
                      </div>
                    </div>
                  </div>

                  {/* Flight Slices */}
                  <div className="space-y-6">
                    {offer.slices?.map((slice, index) => (
                      <FlightSlice
                        key={`slice-${index}`}
                        slice={slice}
                        index={index}
                      />
                    ))}
                  </div>

                  {/* Baggage Info */}
                  <div className="border-t pt-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Luggage className="size-4" />
                      <span>Baggage Allowance</span>
                    </div>
                    <div className="space-y-1">
                      {offer.baggage.checked.length > 0 && (
                        <div className="text-muted-foreground text-sm">
                          <span className="font-medium">Checked:</span>{" "}
                          {offer.baggage.checked.map((bag, i) => (
                            <span key={i}>
                              {bag.quantity}x bag
                              {i < offer.baggage.checked.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </div>
                      )}
                      {offer.baggage.carry_on.length > 0 && (
                        <div className="text-muted-foreground text-sm">
                          <span className="font-medium">Carry-on:</span>{" "}
                          {offer.baggage.carry_on.map((bag, i) => (
                            <span key={i}>
                              {bag.quantity}x bag
                              {i < offer.baggage.carry_on.length - 1
                                ? ", "
                                : ""}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === "passengers" && (
            <div className="space-y-6">
              {passengers.map((passenger, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <h4 className="mb-4 font-medium">
                      Passenger {index + 1} of {passengerCount}
                    </h4>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`title-${index}`}>Title</Label>
                        <Select
                          value={passenger.title}
                          onValueChange={value => {
                            handlePassengerChange(
                              index,
                              "title",
                              value as DuffelPassengerTitle
                            )
                            // Auto-set gender based on title
                            if (value === "mr") {
                              handlePassengerChange(
                                index,
                                "gender",
                                "m" as DuffelPassengerGender
                              )
                            } else if (["mrs", "ms", "miss"].includes(value)) {
                              handlePassengerChange(
                                index,
                                "gender",
                                "f" as DuffelPassengerGender
                              )
                            }
                          }}
                        >
                          <SelectTrigger id={`title-${index}`}>
                            <SelectValue placeholder="Select title" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mr">Mr</SelectItem>
                            <SelectItem value="mrs">Mrs</SelectItem>
                            <SelectItem value="ms">Ms</SelectItem>
                            <SelectItem value="miss">Miss</SelectItem>
                            <SelectItem value="dr">Dr</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`gender-${index}`}>Gender</Label>
                        <Select
                          value={passenger.gender}
                          onValueChange={value =>
                            handlePassengerChange(
                              index,
                              "gender",
                              value as DuffelPassengerGender
                            )
                          }
                        >
                          <SelectTrigger id={`gender-${index}`}>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="m">Male</SelectItem>
                            <SelectItem value="f">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`type-${index}`}>Passenger Type</Label>
                        <Select
                          value={passenger.type}
                          onValueChange={value =>
                            handlePassengerChange(
                              index,
                              "type",
                              value as DuffelPassengerType
                            )
                          }
                        >
                          <SelectTrigger id={`type-${index}`}>
                            <SelectValue placeholder="Select passenger type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="adult">Adult</SelectItem>
                            <SelectItem value="child">Child</SelectItem>
                            <SelectItem value="infant_without_seat">
                              Infant (No Seat)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`given-name-${index}`}>
                          First Name
                        </Label>
                        <Input
                          id={`given-name-${index}`}
                          value={passenger.given_name}
                          onChange={e =>
                            handlePassengerChange(
                              index,
                              "given_name",
                              e.target.value
                            )
                          }
                          placeholder="Enter first name"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`family-name-${index}`}>
                          Last Name
                        </Label>
                        <Input
                          id={`family-name-${index}`}
                          value={passenger.family_name}
                          onChange={e =>
                            handlePassengerChange(
                              index,
                              "family_name",
                              e.target.value
                            )
                          }
                          placeholder="Enter last name"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`email-${index}`}>Email</Label>
                        <Input
                          id={`email-${index}`}
                          type="email"
                          value={passenger.email}
                          onChange={e =>
                            handlePassengerChange(
                              index,
                              "email",
                              e.target.value
                            )
                          }
                          placeholder="Enter email address"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`phone-${index}`}>Phone Number</Label>
                        <div className="relative">
                          <PhoneInput
                            id={`phone-${index}`}
                            value={passenger.phone_number || undefined}
                            onChange={value => {
                              const phoneNumber = value || ""
                              const isValid = value
                                ? isValidPhoneNumber(value)
                                : false
                              handlePassengerChange(
                                index,
                                "phone_number",
                                phoneNumber
                              )
                              handlePassengerChange(
                                index,
                                "isPhoneValid",
                                isValid
                              )
                            }}
                            international
                            withCountryCallingCode
                            defaultCountry="GB"
                            placeholder="Enter phone number"
                            numberInputProps={{
                              className: cn(
                                "border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 pl-[4.5rem] text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                                !passenger.isPhoneValid &&
                                  passenger.phone_number &&
                                  "border-destructive"
                              )
                            }}
                            className="[&_.PhoneInputCountry]:absolute [&_.PhoneInputCountry]:left-[0.5rem] [&_.PhoneInputCountry]:top-[0.5rem] [&_.PhoneInputCountry]:z-10"
                          />
                          {!passenger.isPhoneValid &&
                            passenger.phone_number && (
                              <div className="text-destructive mt-1 text-sm">
                                Please enter a valid phone number with country
                                code
                              </div>
                            )}
                          <div className="text-muted-foreground mt-1 text-xs">
                            Include country code (e.g., +44 for UK)
                          </div>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor={`born-on-${index}`}>
                          Date of Birth
                        </Label>
                        <Input
                          id={`born-on-${index}`}
                          type="date"
                          value={passenger.born_on}
                          onChange={e =>
                            handlePassengerChange(
                              index,
                              "born_on",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {currentStep === "payment" && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="mb-2 font-medium">Price Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Base fare</span>
                        <span>
                          {offer.base_amount} {offer.base_currency}
                        </span>
                      </div>
                      {offer.tax_amount && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Taxes & fees
                          </span>
                          <span>
                            {offer.tax_amount} {offer.tax_currency}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2 font-medium">
                        <span>Total</span>
                        <span>
                          {offer.total_amount} {offer.total_currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  {offer.payment_requirements.requires_instant_payment && (
                    <Alert>
                      <Info className="size-4" />
                      <AlertDescription>
                        This flight requires immediate payment to secure the
                        booking.
                      </AlertDescription>
                    </Alert>
                  )}

                  {offer.payment_requirements.price_guarantee_expires_at && (
                    <Alert>
                      <Info className="size-4" />
                      <AlertDescription>
                        Price guaranteed until{" "}
                        {new Date(
                          offer.payment_requirements.price_guarantee_expires_at
                        ).toLocaleString()}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-6 flex justify-between">
          {currentStep !== "flight" && (
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
          )}
          {currentStep === "payment" ? (
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Booking..." : "Book Flight"}
            </Button>
          ) : (
            <Button onClick={nextStep}>Continue</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
