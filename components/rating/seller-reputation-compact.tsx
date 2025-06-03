"use client"

import { useState, useEffect } from "react"
import { Star, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "./star-rating"
import { supabase } from "@/lib/supabase"

interface SellerReputationCompactProps {
  sellerId: string
}

interface ReputationData {
  total_reviews: number
  average_rating: number
  verified_purchases: number
}

export function SellerReputationCompact({ sellerId }: SellerReputationCompactProps) {
  const [reputation, setReputation] = useState<ReputationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadReputation()
  }, [sellerId])

  const loadReputation = async () => {
    try {
      setIsLoading(true)

      // Load reputation summary
      const { data: reputationData, error: reputationError } = await supabase
        .from("seller_reputation")
        .select("total_reviews, average_rating, verified_purchases")
        .eq("seller_id", sellerId)
        .single()

      if (reputationError && reputationError.code !== "PGRST116") {
        throw reputationError
      }

      setReputation(reputationData)
    } catch (error) {
      console.error("Error loading reputation:", error)
      setReputation(null)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    )
  }

  if (!reputation || reputation.total_reviews === 0) {
    return (
      <div className="flex items-center space-x-2 text-gray-500">
        <Star className="h-4 w-4" />
        <span className="text-sm">No reviews yet</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-1">
        <StarRating rating={reputation.average_rating} readonly size="sm" />
        <span className="font-medium text-gray-900">{reputation.average_rating.toFixed(1)}</span>
        <span className="text-sm text-gray-600">
          ({reputation.total_reviews} review{reputation.total_reviews !== 1 ? "s" : ""})
        </span>
      </div>
      {reputation.verified_purchases > 0 && (
        <Badge variant="secondary" className="text-xs">
          <Shield className="h-3 w-3 mr-1" />
          {reputation.verified_purchases} verified
        </Badge>
      )}
    </div>
  )
}
