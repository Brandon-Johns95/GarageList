"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { StarRating } from "./star-rating"
import { supabase } from "@/lib/supabase"

interface ReviewFormProps {
  sellerId: string
  sellerName: string
  listingId?: number
  listingTitle?: string
  onClose: () => void
  onSubmit: () => void
}

export function ReviewForm({ sellerId, sellerName, listingId, listingTitle, onClose, onSubmit }: ReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [reviewText, setReviewText] = useState("")
  const [communicationRating, setCommunicationRating] = useState(0)
  const [accuracyRating, setAccuracyRating] = useState(0)
  const [timelinessRating, setTimelinessRating] = useState(0)
  const [isVerifiedPurchase, setIsVerifiedPurchase] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError("Please provide an overall rating")
      return
    }

    try {
      setIsSubmitting(true)
      setError("")

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError("You must be logged in to submit a review")
        return
      }

      // Submit review
      const { error: submitError } = await supabase.from("seller_reviews").insert({
        reviewer_id: user.id,
        seller_id: sellerId,
        listing_id: listingId || null,
        rating,
        title: title.trim() || null,
        review_text: reviewText.trim() || null,
        communication_rating: communicationRating || null,
        accuracy_rating: accuracyRating || null,
        timeliness_rating: timelinessRating || null,
        is_verified_purchase: isVerifiedPurchase,
      })

      if (submitError) {
        throw submitError
      }

      onSubmit()
    } catch (error) {
      console.error("Error submitting review:", error)
      setError(error instanceof Error ? error.message : "Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Write a Review for {sellerName}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {listingTitle && <p className="text-sm text-gray-600">Regarding: {listingTitle}</p>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Overall Rating */}
            <div>
              <Label className="text-base font-medium">Overall Rating *</Label>
              <div className="mt-2">
                <StarRating rating={rating} onRatingChange={setRating} size="lg" />
              </div>
            </div>

            {/* Review Title */}
            <div>
              <Label htmlFor="title">Review Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your experience"
                maxLength={200}
              />
            </div>

            {/* Review Text */}
            <div>
              <Label htmlFor="review">Your Review</Label>
              <Textarea
                id="review"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share details about your experience with this seller..."
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1">{reviewText.length}/1000 characters</p>
            </div>

            {/* Detailed Ratings */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Detailed Ratings (Optional)</Label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">Communication</Label>
                  <div className="mt-1">
                    <StarRating rating={communicationRating} onRatingChange={setCommunicationRating} />
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Accuracy</Label>
                  <div className="mt-1">
                    <StarRating rating={accuracyRating} onRatingChange={setAccuracyRating} />
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Timeliness</Label>
                  <div className="mt-1">
                    <StarRating rating={timelinessRating} onRatingChange={setTimelinessRating} />
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Purchase */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="verified"
                checked={isVerifiedPurchase}
                onCheckedChange={(checked) => setIsVerifiedPurchase(checked as boolean)}
              />
              <Label htmlFor="verified" className="text-sm">
                This is a verified purchase
              </Label>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button type="submit" disabled={isSubmitting || rating === 0} className="flex-1">
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
