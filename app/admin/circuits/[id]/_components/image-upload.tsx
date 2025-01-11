"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Image as ImageIcon,
  Upload,
  X,
  Link as LinkIcon,
  CheckCircle2,
  CloudUpload
} from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { uploadImageFromUrlAction } from "./upload-actions"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"

interface ImageUploadProps {
  label: string
  imageUrl: string | null
  onImageChange: (url: string | null) => void
  bucketName: "circuit_images" | "circuit_maps"
  accept?: string
  maxSize?: number // in MB
}

const SUPABASE_URL = "https://vsszkzazjhvlecyryzon.supabase.co"

export default function ImageUpload({
  label,
  imageUrl,
  onImageChange,
  bucketName,
  accept = "image/*",
  maxSize = 5 // Default 5MB
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [urlInput, setUrlInput] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [lastUploadedUrl, setLastUploadedUrl] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  const needsMigration = imageUrl && !imageUrl.startsWith(SUPABASE_URL)

  async function migrateImage() {
    if (!imageUrl) return
    setIsMigrating(true)
    const migrationToast = toast.loading(
      "Migrating image to Supabase storage..."
    )

    try {
      // Use the existing uploadFromUrl function
      await uploadFromUrl(imageUrl, migrationToast.toString())
      toast.success("Image migrated successfully!", { id: migrationToast })
    } catch (error) {
      console.error("Error migrating image:", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null
            ? JSON.stringify(error)
            : "Failed to migrate image"
      toast.error(`Error migrating image: ${errorMessage}`, {
        id: migrationToast
      })
    } finally {
      setIsMigrating(false)
    }
  }

  async function uploadFromUrl(url: string, toastId?: string) {
    const uploadToast =
      toastId?.toString() || toast.loading("Uploading image...")
    setIsUploading(true)

    try {
      // Fetch and validate the image on the server
      const result = await uploadImageFromUrlAction(url, bucketName, maxSize)
      if (!result.isSuccess) {
        toast.error(result.message, { id: uploadToast })
        return
      }

      // Delete old file if exists
      if (imageUrl?.startsWith(SUPABASE_URL)) {
        const oldPath = new URL(imageUrl).pathname.split("/").pop()
        if (oldPath) {
          await supabase.storage.from(bucketName).remove([oldPath])
        }
      }

      // Convert ArrayBuffer to Blob
      const blob = new Blob([result.data.blob], { type: result.data.type })

      // Upload new file
      const fileName = `${Date.now()}-${url.split("/").pop() || "image"}`
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, blob)

      if (error) {
        throw new Error(error.message || "Failed to upload to storage")
      }
      if (!data) {
        throw new Error("No data returned from storage upload")
      }

      // Get public URL
      const {
        data: { publicUrl }
      } = supabase.storage.from(bucketName).getPublicUrl(data.path)

      onImageChange(publicUrl)
      setUrlInput("")
      setPreviewUrl(null)
      setLastUploadedUrl(publicUrl)
      if (!toastId) {
        toast.success("Image uploaded successfully!", { id: uploadToast })
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "object" && error !== null
            ? JSON.stringify(error)
            : "Failed to upload image"
      toast.error(`Error uploading image: ${errorMessage}`, { id: uploadToast })
      throw error // Re-throw for migration handling
    } finally {
      setIsUploading(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSize}MB`)
      return
    }

    setIsUploading(true)
    const uploadToast = toast.loading("Uploading image...")

    try {
      // Delete old file if exists
      if (imageUrl?.startsWith(SUPABASE_URL)) {
        const oldPath = new URL(imageUrl).pathname.split("/").pop()
        if (oldPath) {
          await supabase.storage.from(bucketName).remove([oldPath])
        }
      }

      // Upload new file
      const fileName = `${Date.now()}-${file.name}`
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file)

      if (error) throw error

      // Get public URL
      const {
        data: { publicUrl }
      } = supabase.storage.from(bucketName).getPublicUrl(data.path)

      onImageChange(publicUrl)
      setLastUploadedUrl(publicUrl)
      toast.success("Image uploaded successfully!", { id: uploadToast })
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error("Failed to upload image", { id: uploadToast })
    } finally {
      setIsUploading(false)
    }
  }

  async function handleRemoveImage() {
    if (!imageUrl) return

    const removeToast = toast.loading("Removing image...")

    try {
      if (imageUrl.startsWith(SUPABASE_URL)) {
        const path = new URL(imageUrl).pathname.split("/").pop()
        if (path) {
          const { error } = await supabase.storage
            .from(bucketName)
            .remove([path])
          if (error) throw error
        }
      }

      onImageChange(null)
      setPreviewUrl(null)
      setUrlInput("")
      setLastUploadedUrl(null)
      toast.success("Image removed successfully!", { id: removeToast })
    } catch (error) {
      console.error("Error removing image:", error)
      toast.error("Failed to remove image", { id: removeToast })
    }
  }

  function handleUrlInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const url = e.target.value
    setUrlInput(url)
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  return (
    <div className="space-y-2">
      <Label>
        <div className="flex items-center gap-2">
          <ImageIcon className="size-4" />
          {label}
        </div>
      </Label>

      <div className="space-y-4">
        {(imageUrl || previewUrl) && (
          <Card className="relative overflow-hidden">
            <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
              {needsMigration && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={migrateImage}
                        disabled={isMigrating}
                        className="bg-white"
                      >
                        {isMigrating ? (
                          <CloudUpload className="size-4 animate-bounce text-blue-500" />
                        ) : (
                          <CloudUpload className="size-4 text-blue-500" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Migrate image to Supabase storage</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button
                variant="destructive"
                size="icon"
                onClick={handleRemoveImage}
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="relative aspect-video w-full">
              <Image
                src={previewUrl || imageUrl || ""}
                alt={label}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </Card>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept={accept}
              onChange={handleFileUpload}
              disabled={isUploading || isMigrating}
              className="cursor-pointer"
            />
            {isUploading && (
              <Button disabled>
                <Upload className="mr-2 size-4 animate-bounce" />
                Uploading...
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <LinkIcon className="size-4 text-gray-500" />
              </div>
              <Input
                type="url"
                value={urlInput}
                onChange={handleUrlInputChange}
                placeholder="Or enter an image URL..."
                className="pl-10"
                disabled={isUploading || isMigrating}
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => urlInput && uploadFromUrl(urlInput)}
                    disabled={!urlInput || isUploading || isMigrating}
                    variant={lastUploadedUrl ? "outline" : "default"}
                    className={lastUploadedUrl ? "text-green-600" : ""}
                  >
                    {isUploading ? (
                      <>
                        <Upload className="mr-2 size-4 animate-bounce" />
                        Uploading...
                      </>
                    ) : lastUploadedUrl ? (
                      <>
                        <CheckCircle2 className="mr-2 size-4" />
                        Uploaded!
                      </>
                    ) : (
                      "Upload URL"
                    )}
                  </Button>
                </TooltipTrigger>
                {lastUploadedUrl && (
                  <TooltipContent>
                    <p className="max-w-xs truncate font-mono text-xs">
                      {lastUploadedUrl}
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    </div>
  )
}
