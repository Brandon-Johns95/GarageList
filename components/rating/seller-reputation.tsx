"use client"

import { useState, useEffect } from "react"
import { Star, Shield, Clock, MessageCircle, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StarRating } from "./star-rating"
import { supabase } from "@/lib/supabase"

interface SellerReputationProps {
  sellerId: string
  showDetailed?: boolean
}

interface ReputationData {
  total_reviews: number
  average_rating: number
  communication_avg: number
  accuracy_avg: number
  timeliness_avg: number
  verified_purchases: number
  response_rate: number
  response_time_hours: number
}

interface RatingDistribution {
  rating: number
  count: number
  percentage: number
}

export function SellerReputation({ sellerId, showDetailed = true }: SellerReputationProps) {
  const [reputation, setReputation] = useState<ReputationData | null>(null)
  const [distribution, setDistribution] = useState<RatingDistribution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    loadReputation()
  }, [sellerId])

  const loadReputation = async () => {
    try {
      setIsLoading(true)
      setError("")

      // Load reputation summary
      const { data: reputationData, error: reputationError } = await supabase
        .from("seller_reputation")
        .select("*")
        .eq("seller_id", sellerId)
        .single()

      if (reputationError && reputationError.code !== "PGRST116") {
        throw reputationError
      }

      // Load rating distribution
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("seller_reviews")
        .select("rating")
        .eq("seller_id", sellerId)

      if (reviewsError) {
        throw reviewsError
      }

      // Calculate distribution
      const ratingCounts = [1, 2, 3, 4, 5].map((rating) => {
        const count = reviewsData?.filter((r) => r.rating === rating).length || 0
        const percentage = reviewsData?.length ? (count / reviewsData.length) * 100 : 0
        return { rating, count, percentage }
      })

      setReputation(reputationData)
      setDistribution(ratingCounts)
    } catch (error) {
      console.error("Error loading reputation:", error)
      setError("Failed to load seller reputation")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!reputation || reputation.total_reviews === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Star className="h-5 w-5 mr-2" />
            Seller Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600">No reviews yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Star className="h-5 w-5 mr-2" />
          Seller Rating
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-3xl font-bold">{reputation.average_rating.toFixed(1)}</span>
            <StarRating rating={reputation.average_rating} readonly size="lg" />
          </div>
          <p className="text-gray-600">
            Based on {reputation.total_reviews} review{reputation.total_reviews !== 1 ? "s" : ""}
          </p>
          {reputation.verified_purchases > 0 && (
            <Badge variant="secondary" className="mt-2">
              <Shield className="h-3 w-3 mr-1" />
              {reputation.verified_purchases} verified purchase{reputation.verified_purchases !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {/* Rating Distribution */}
        {showDetailed && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Rating Breakdown</h4>
            {distribution.reverse().map((item) => (
              <div key={item.rating} className="flex items-center space-x-2 text-sm">
                <span className="w-8">{item.rating}★</span>
                <Progress value={item.percentage} className="flex-1 h-2" />
                <span className="w-8 text-gray-600">{item.count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Detailed Ratings */}
        {showDetailed &&
          (reputation.communication_avg > 0 || reputation.accuracy_avg > 0 || reputation.timeliness_avg > 0) && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Detailed Ratings</h4>
              {reputation.communication_avg > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Communication</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StarRating rating={reputation.communication_avg} readonly size="sm" />
                    <span className="text-sm text-gray-600">{reputation.communication_avg.toFixed(1)}</span>
                  </div>
                </div>
              )}
              {reputation.accuracy_avg > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Accuracy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StarRating rating={reputation.accuracy_avg} readonly size="sm" />
                    <span className="text-sm text-gray-600">{reputation.accuracy_avg.toFixed(1)}</span>
                  </div>
                </div>
              )}
              {reputation.timeliness_avg > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">Timeliness</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <StarRating rating={reputation.timeliness_avg} readonly size="sm" />
                    <span className="text-sm text-gray-600">{reputation.timeliness_avg.toFixed(1)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

        {/* Response Stats */}
        {showDetailed && (
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Response Rate</span>
              <span className="font-medium">{reputation.response_rate.toFixed(0)}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Typical Response Time</span>
              <span className="font-medium">
                {reputation.response_time_hours < 24
                  ? `${reputation.response_time_hours} hours`
                  : `${Math.round(reputation.response_time_hours / 24)} days`}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
