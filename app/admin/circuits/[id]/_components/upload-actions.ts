"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { ActionState } from "@/types"

export async function uploadImageFromUrlAction(
  url: string,
  bucketName: "circuit_images" | "circuit_maps",
  maxSizeMB: number
): Promise<ActionState<{ blob: ArrayBuffer; type: string }>> {
  try {
    // Validate URL format
    try {
      new URL(url)
    } catch {
      return {
        isSuccess: false,
        message: "Invalid URL format"
      }
    }

    const response = await fetch(url, {
      next: {
        revalidate: 0 // Disable caching
      }
    }).catch(error => {
      throw new Error(`Network error: ${error.message}`)
    })

    if (!response.ok) {
      return {
        isSuccess: false,
        message: `Failed to fetch image: ${response.status} ${response.statusText}`
      }
    }

    const contentType = response.headers.get("content-type")
    if (!contentType) {
      return {
        isSuccess: false,
        message: "No content type header in response"
      }
    }

    if (!contentType.startsWith("image/")) {
      return {
        isSuccess: false,
        message: `Invalid content type: ${contentType} (expected image/*)`
      }
    }

    let arrayBuffer: ArrayBuffer
    try {
      arrayBuffer = await response.arrayBuffer()
    } catch (error) {
      throw new Error(
        `Failed to read image data: ${error instanceof Error ? error.message : "Unknown error"}`
      )
    }

    // Validate file size
    if (arrayBuffer.byteLength > maxSizeMB * 1024 * 1024) {
      return {
        isSuccess: false,
        message: `File size (${(arrayBuffer.byteLength / (1024 * 1024)).toFixed(2)}MB) exceeds limit of ${maxSizeMB}MB`
      }
    }

    if (arrayBuffer.byteLength === 0) {
      return {
        isSuccess: false,
        message: "Image data is empty"
      }
    }

    return {
      isSuccess: true,
      message: "Image fetched successfully",
      data: {
        blob: arrayBuffer,
        type: contentType
      }
    }
  } catch (error) {
    console.error("Error fetching image:", error)
    return {
      isSuccess: false,
      message:
        error instanceof Error
          ? `Failed to fetch image: ${error.message}`
          : typeof error === "object" && error !== null
            ? `Failed to fetch image: ${JSON.stringify(error)}`
            : "Failed to fetch image: Unknown error"
    }
  }
}
