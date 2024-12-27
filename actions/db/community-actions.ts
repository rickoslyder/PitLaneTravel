"use server"

import { db } from "@/db/db"
import { reviewsTable, tipsTable } from "@/db/schema"
import { ActionState } from "@/types"
import { InsertReview, SelectReview, InsertTip, SelectTip } from "@/db/schema"
import { and, eq, desc } from "drizzle-orm"

// Reviews
export async function createReviewAction(
  review: InsertReview
): Promise<ActionState<SelectReview>> {
  try {
    const [newReview] = await db.insert(reviewsTable).values(review).returning()
    return {
      isSuccess: true,
      message: "Review created successfully",
      data: newReview
    }
  } catch (error) {
    console.error("Error creating review:", error)
    return { isSuccess: false, message: "Failed to create review" }
  }
}

export async function getAllReviewsAction(): Promise<ActionState<SelectReview[]>> {
  try {
    const reviews = await db
      .select()
      .from(reviewsTable)
      .orderBy(desc(reviewsTable.createdAt))

    return {
      isSuccess: true,
      message: "Reviews retrieved successfully",
      data: reviews
    }
  } catch (error) {
    console.error("Error getting reviews:", error)
    return { isSuccess: false, message: "Failed to get reviews" }
  }
}

export async function getReviewsAction(
  raceId: string
): Promise<ActionState<SelectReview[]>> {
  try {
    const reviews = await db
      .select()
      .from(reviewsTable)
      .where(eq(reviewsTable.raceId, raceId))
      .orderBy(desc(reviewsTable.createdAt))
    return {
      isSuccess: true,
      message: "Reviews retrieved successfully",
      data: reviews
    }
  } catch (error) {
    console.error("Error getting reviews:", error)
    return { isSuccess: false, message: "Failed to get reviews" }
  }
}

export async function updateReviewAction(
  id: string,
  userId: string,
  data: Partial<InsertReview>
): Promise<ActionState<SelectReview>> {
  try {
    const [updatedReview] = await db
      .update(reviewsTable)
      .set(data)
      .where(and(eq(reviewsTable.id, id), eq(reviewsTable.userId, userId)))
      .returning()

    if (!updatedReview) {
      return { isSuccess: false, message: "Review not found or access denied" }
    }

    return {
      isSuccess: true,
      message: "Review updated successfully",
      data: updatedReview
    }
  } catch (error) {
    console.error("Error updating review:", error)
    return { isSuccess: false, message: "Failed to update review" }
  }
}

export async function deleteReviewAction(
  id: string,
  userId: string
): Promise<ActionState<void>> {
  try {
    await db
      .delete(reviewsTable)
      .where(and(eq(reviewsTable.id, id), eq(reviewsTable.userId, userId)))
    return {
      isSuccess: true,
      message: "Review deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting review:", error)
    return { isSuccess: false, message: "Failed to delete review" }
  }
}

// Tips
export async function createTipAction(
  tip: InsertTip
): Promise<ActionState<SelectTip>> {
  try {
    const [newTip] = await db.insert(tipsTable).values(tip).returning()
    return {
      isSuccess: true,
      message: "Tip created successfully",
      data: newTip
    }
  } catch (error) {
    console.error("Error creating tip:", error)
    return { isSuccess: false, message: "Failed to create tip" }
  }
}

export async function getAllTipsAction(): Promise<ActionState<SelectTip[]>> {
  try {
    const tips = await db
      .select()
      .from(tipsTable)
      .orderBy(desc(tipsTable.createdAt))

    return {
      isSuccess: true,
      message: "Tips retrieved successfully",
      data: tips
    }
  } catch (error) {
    console.error("Error getting tips:", error)
    return { isSuccess: false, message: "Failed to get tips" }
  }
}

export async function getTipsAction(
  raceId: string
): Promise<ActionState<SelectTip[]>> {
  try {
    const tips = await db
      .select()
      .from(tipsTable)
      .where(eq(tipsTable.raceId, raceId))
      .orderBy(desc(tipsTable.createdAt))
    return {
      isSuccess: true,
      message: "Tips retrieved successfully",
      data: tips
    }
  } catch (error) {
    console.error("Error getting tips:", error)
    return { isSuccess: false, message: "Failed to get tips" }
  }
}

export async function updateTipAction(
  id: string,
  userId: string,
  data: Partial<InsertTip>
): Promise<ActionState<SelectTip>> {
  try {
    const [updatedTip] = await db
      .update(tipsTable)
      .set(data)
      .where(and(eq(tipsTable.id, id), eq(tipsTable.userId, userId)))
      .returning()

    if (!updatedTip) {
      return { isSuccess: false, message: "Tip not found or access denied" }
    }

    return {
      isSuccess: true,
      message: "Tip updated successfully",
      data: updatedTip
    }
  } catch (error) {
    console.error("Error updating tip:", error)
    return { isSuccess: false, message: "Failed to update tip" }
  }
}

export async function deleteTipAction(
  id: string,
  userId: string
): Promise<ActionState<void>> {
  try {
    await db
      .delete(tipsTable)
      .where(and(eq(tipsTable.id, id), eq(tipsTable.userId, userId)))
    return {
      isSuccess: true,
      message: "Tip deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting tip:", error)
    return { isSuccess: false, message: "Failed to delete tip" }
  }
}
