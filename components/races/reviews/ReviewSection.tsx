"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useAuth, useUser } from "@clerk/nextjs"
import { format } from "date-fns"
import { Star } from "lucide-react"
import { useEffect, useState } from "react"
import {
  createReviewAction,
  deleteReviewAction,
  getReviewsAction,
  updateReviewAction
} from "@/actions/db/community-actions"
import { toast } from "sonner"
import { SelectReview } from "@/db/schema"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface ReviewSectionProps {
  /** The race ID */
  raceId: string
}

export function ReviewSection({ raceId }: ReviewSectionProps) {
  const { userId } = useAuth()
  const { user } = useUser()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [content, setContent] = useState("")
  const [reviews, setReviews] = useState<SelectReview[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingReview, setEditingReview] = useState<SelectReview | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [raceId])

  const fetchReviews = async () => {
    const result = await getReviewsAction(raceId)
    if (result.isSuccess) {
      setReviews(result.data)
    } else {
      toast.error(result.message)
    }
  }

  const handleSubmit = async () => {
    if (!userId) {
      toast.error("Please sign in to leave a review")
      return
    }

    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (!content.trim()) {
      toast.error("Please enter a review")
      return
    }

    setIsSubmitting(true)

    try {
      if (editingReview) {
        const result = await updateReviewAction(editingReview.id, userId, {
          rating,
          content
        })

        if (result.isSuccess) {
          toast.success(result.message)
          await fetchReviews()
          resetForm()
        } else {
          toast.error(result.message)
        }
      } else {
        const result = await createReviewAction({
          userId,
          raceId,
          rating,
          content
        })

        if (result.isSuccess) {
          toast.success(result.message)
          await fetchReviews()
          resetForm()
        } else {
          toast.error(result.message)
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (reviewId: string) => {
    if (!userId) return

    const result = await deleteReviewAction(reviewId, userId)
    if (result.isSuccess) {
      toast.success(result.message)
      await fetchReviews()
    } else {
      toast.error(result.message)
    }
  }

  const handleEdit = (review: SelectReview) => {
    setEditingReview(review)
    setRating(review.rating)
    setContent(review.content)
  }

  const resetForm = () => {
    setRating(0)
    setContent("")
    setEditingReview(null)
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      : 0

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Write a Review</CardTitle>
            <CardDescription>
              Share your experience at this race
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(value => (
                  <Star
                    key={value}
                    className={cn(
                      "size-6 cursor-pointer transition-colors",
                      (hoverRating || rating) >= value
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    )}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(value)}
                  />
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Share your thoughts..."
              value={content}
              onChange={e => setContent(e.target.value)}
              className="min-h-[100px]"
            />
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full"
            >
              {editingReview ? "Update Review" : "Submit Review"}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Review Summary</CardTitle>
            <CardDescription>
              Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map(value => (
                  <Star
                    key={value}
                    className={cn(
                      "size-5",
                      value <= averageRating ? "fill-current" : "text-muted"
                    )}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {reviews.map(review => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback>
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <div className="font-semibold">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {format(new Date(review.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                </div>
                {userId === review.userId && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(review)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(review.id)}
                    >
                      Delete
                    </Button>
                  </div>
                )}
              </div>
              <div className="mt-2 flex text-yellow-400">
                {[1, 2, 3, 4, 5].map(value => (
                  <Star
                    key={value}
                    className={cn(
                      "size-4",
                      value <= review.rating ? "fill-current" : "text-muted"
                    )}
                  />
                ))}
              </div>
              <p className="text-muted-foreground mt-4">{review.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
