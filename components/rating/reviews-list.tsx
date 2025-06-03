"use client"

import { useState, useEffect } from "react"
import { Star, ThumbsUp, Flag, Calendar, Shield } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StarRating } from "./star-rating"
import { supabase } from "@/lib/supabase"

interface Review {
  id: number
  rating: number
  title: string
  review_text: string
  communication_rating: number
  accuracy_rating: number
  timeliness_rating: number
  is_verified_purchase: boolean
  helpful_votes: number
  created_at: string
  reviewer: {
    id: string
    name: string
    avatar: string
    review_count: number
  }
  listing: {
    id: number
    title: string
  } | null
}

interface ReviewsListProps {
  sellerId: string
}

export function ReviewsList({ sellerId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterBy, setFilterBy] = useState("all")

  useEffect(() => {
    loadReviews()
  }, [sellerId, sortBy, filterBy])

  const loadReviews = async () => {
    try {
      setIsLoading(true)
      setError("")

      // PSEUDO: Step 1 - Get base reviews data
      let query = supabase.from("seller_reviews").select("*").eq("seller_id", sellerId)

      // PSEUDO: Apply filters to base query
      if (filterBy !== "all") {
        if (filterBy === "verified") {
          query = query.eq("is_verified_purchase", true)
        } else if (filterBy === "5-star") {
          query = query.eq("rating", 5)
        } else if (filterBy === "4-star") {
          query = query.eq("rating", 4)
        } else if (filterBy === "3-star") {
          query = query.eq("rating", 3)
        } else if (filterBy === "2-star") {
          query = query.eq("rating", 2)
        } else if (filterBy === "1-star") {
          query = query.eq("rating", 1)
        }
      }

      // PSEUDO: Apply sorting to base query
      if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false })
      } else if (sortBy === "oldest") {
        query = query.order("created_at", { ascending: true })
      } else if (sortBy === "highest") {
        query = query.order("rating", { ascending: false })
      } else if (sortBy === "lowest") {
        query = query.order("rating", { ascending: true })
      } else if (sortBy === "helpful") {
        query = query.order("helpful_votes", { ascending: false })
      }

      const { data: reviewsData, error: reviewsError } = await query

      if (reviewsError) {
        throw reviewsError
      }

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([])
        return
      }

      // PSEUDO: Step 2 - Get reviewer profiles manually
      const reviewerIds = reviewsData
        .map((review) => review.reviewer_id)
        .filter(Boolean)
        .filter((id, index, arr) => arr.indexOf(id) === index) // Remove duplicates

      let profilesData: any[] = []
      if (reviewerIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("user_profiles")
          .select("id, first_name, last_name, avatar_url")
          .in("id", reviewerIds)

        if (!profilesError && profiles) {
          profilesData = profiles
        }
      }

      // PSEUDO: Step 3 - Get listing data manually
      const listingIds = reviewsData
        .map((review) => review.listing_id)
        .filter(Boolean)
        .filter((id, index, arr) => arr.indexOf(id) === index) // Remove duplicates

      let listingsData: any[] = []
      if (listingIds.length > 0) {
        const { data: listings, error: listingsError } = await supabase
          .from("listings")
          .select("id, title")
          .in("id", listingIds)

        if (!listingsError && listings) {
          listingsData = listings
        }
      }

      // PSEUDO: Step 4 - Combine all data manually
      const transformedReviews: Review[] = reviewsData.map((review) => {
        const reviewer = profilesData.find((profile) => profile.id === review.reviewer_id)
        const listing = listingsData.find((listing) => listing.id === review.listing_id)

        return {
          id: review.id,
          rating: review.rating || 0,
          title: review.title || "",
          review_text: review.review_text || "",
          communication_rating: review.communication_rating || 0,
          accuracy_rating: review.accuracy_rating || 0,
          timeliness_rating: review.timeliness_rating || 0,
          is_verified_purchase: review.is_verified_purchase || false,
          helpful_votes: review.helpful_votes || 0,
          created_at: review.created_at,
          reviewer: {
            id: reviewer?.id || "",
            name: reviewer
              ? `${reviewer.first_name || ""} ${reviewer.last_name || ""}`.trim() || "Anonymous"
              : "Anonymous",
            avatar: reviewer?.avatar_url || "/placeholder.svg?height=40&width=40",
            review_count: 0, // This would need to be calculated separately
          },
          listing: listing
            ? {
                id: listing.id,
                title: listing.title,
              }
            : null,
        }
      })

      setReviews(transformedReviews)
    } catch (error) {
      console.error("Error loading reviews:", error)
      setError("Failed to load reviews. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleHelpfulVote = async (reviewId: number, isHelpful: boolean) => {
    try {
      // PSEUDO: Implement voting logic
      // This would increment the helpful_votes count
      console.log("Vote:", reviewId, isHelpful)
    } catch (error) {
      console.error("Error voting:", error)
    }
  }

  // PSEUDO: Loading state with skeleton cards
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // PSEUDO: Error state display
  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Button variant="outline" onClick={loadReviews} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* PSEUDO: Filter and sort controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="verified">Verified Only</SelectItem>
                  <SelectItem value="5-star">5 Star</SelectItem>
                  <SelectItem value="4-star">4 Star</SelectItem>
                  <SelectItem value="3-star">3 Star</SelectItem>
                  <SelectItem value="2-star">2 Star</SelectItem>
                  <SelectItem value="1-star">1 Star</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Rated</SelectItem>
                  <SelectItem value="lowest">Lowest Rated</SelectItem>
                  <SelectItem value="helpful">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <p className="text-sm text-gray-600">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* PSEUDO: Reviews list or empty state */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* PSEUDO: Reviewer avatar */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={review.reviewer.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {review.reviewer.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    {/* PSEUDO: Review header with name, date, and rating */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{review.reviewer.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(review.created_at).toLocaleDateString()}</span>
                          {review.is_verified_purchase && (
                            <Badge className="bg-green-100 text-green-800">
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <StarRating rating={review.rating} readonly />
                    </div>

                    {/* PSEUDO: Review title if provided */}
                    {review.title && <h5 className="font-medium text-gray-900">{review.title}</h5>}

                    {/* PSEUDO: Related listing if available */}
                    {review.listing && (
                      <p className="text-sm text-gray-600">
                        Regarding: <span className="font-medium">{review.listing.title}</span>
                      </p>
                    )}

                    {/* PSEUDO: Review text content */}
                    {review.review_text && <p className="text-gray-700 leading-relaxed">{review.review_text}</p>}

                    {/* PSEUDO: Detailed ratings breakdown */}
                    {(review.communication_rating > 0 ||
                      review.accuracy_rating > 0 ||
                      review.timeliness_rating > 0) && (
                      <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                        {review.communication_rating > 0 && (
                          <div className="text-center">
                            <p className="text-xs text-gray-600 mb-1">Communication</p>
                            <StarRating rating={review.communication_rating} readonly size="sm" />
                          </div>
                        )}
                        {review.accuracy_rating > 0 && (
                          <div className="text-center">
                            <p className="text-xs text-gray-600 mb-1">Accuracy</p>
                            <StarRating rating={review.accuracy_rating} readonly size="sm" />
                          </div>
                        )}
                        {review.timeliness_rating > 0 && (
                          <div className="text-center">
                            <p className="text-xs text-gray-600 mb-1">Timeliness</p>
                            <StarRating rating={review.timeliness_rating} readonly size="sm" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* PSEUDO: Review actions (helpful vote, report) */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" onClick={() => handleHelpfulVote(review.id, true)}>
                          <ThumbsUp className="h-4 w-4 mr-1" />
                          Helpful ({review.helpful_votes})
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Flag className="h-4 w-4 mr-1" />
                          Report
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // PSEUDO: Empty state when no reviews found
        <Card>
          <CardContent className="p-8 text-center">
            <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">
              {filterBy === "all"
                ? "This seller hasn't received any reviews yet."
                : "No reviews match the selected filter."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
