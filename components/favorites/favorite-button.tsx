"use client"

import { useState, useEffect } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

interface FavoriteButtonProps {
  listingId: number
  className?: string
  size?: "sm" | "default" | "lg"
  variant?: "ghost" | "outline" | "default"
}

export function FavoriteButton({
  listingId,
  className = "",
  size = "default",
  variant = "ghost",
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      checkFavoriteStatus()
    }
  }, [user, listingId])

  const checkFavoriteStatus = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", listingId)
        .single()

      if (error && error.code !== "PGRST116") {
        console.error("Error checking favorite status:", error)
        return
      }

      setIsFavorited(!!data)
    } catch (error) {
      console.error("Error checking favorite status:", error)
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      // Could trigger sign-in modal here
      alert("Please sign in to save favorites")
      return
    }

    setIsLoading(true)

    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listingId)

        if (error) throw error
        setIsFavorited(false)
      } else {
        // Add to favorites
        const { error } = await supabase.from("favorites").insert({
          user_id: user.id,
          listing_id: listingId,
        })

        if (error) throw error
        setIsFavorited(true)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      alert("Failed to update favorite. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleFavorite}
      disabled={isLoading}
      className={`${className} ${isFavorited ? "text-red-500 hover:text-red-600" : "text-gray-400 hover:text-red-500"}`}
    >
      <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
    </Button>
  )
}
