/**
 * PSEUDO CODE: Trade Matching Engine
 *
 * PURPOSE: Core logic for matching vehicles based on trade preferences
 * FLOW:
 *   1. ANALYZE user's vehicle and trade preferences
 *   2. SEARCH database for compatible vehicles
 *   3. CALCULATE compatibility scores
 *   4. RANK and return best matches
 */

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

interface TradeMatch {
  listing: any
  seller: any
  compatibilityScore: number
  matchReasons: string[]
  distance?: number
}

interface TradeMatchingProps {
  userListingId: string
  userPreferences: any
  userLocation?: { lat: number; lng: number }
  previewListing?: any // Add this for preview mode
  onMatchesFound: (matches: TradeMatch[]) => void
}

export function TradeMatchingEngine({
  userListingId,
  userPreferences,
  userLocation,
  previewListing, // Add this parameter
  onMatchesFound,
}: TradeMatchingProps) {
  const [isMatching, setIsMatching] = useState(false)
  const [matchingProgress, setMatchingProgress] = useState(0)

  /**
   * PSEUDO: Main matching algorithm
   * STEPS:
   *   1. GET all listings marked as trade-considered
   *   2. FILTER by basic compatibility
   *   3. CALCULATE detailed compatibility scores
   *   4. SORT by score and return top matches
   */
  const findTradeMatches = async () => {
    setIsMatching(true)
    setMatchingProgress(0)

    try {
      // STEP 1: Handle preview mode vs real listing
      setMatchingProgress(10)
      let userListing

      if (userListingId === "preview") {
        if (!previewListing) {
          const savedListing = localStorage.getItem("pendingListing")
          if (!savedListing) {
            throw new Error("No pending listing found for preview")
          }
          userListing = JSON.parse(savedListing)
        } else {
          userListing = previewListing
        }
      } else {
        const { data: fetchedListing } = await supabase.from("listings").select("*").eq("id", userListingId).single()
        if (!fetchedListing) throw new Error("User listing not found")
        userListing = fetchedListing
      }

      // STEP 2: Get all trade-eligible listings (excluding user's own)
      setMatchingProgress(25)
      const { data: potentialTrades } = await supabase
        .from("listings")
        .select(`
          *,
          listing_photos (photo_url, is_main_photo, sort_order)
        `)
        .eq("trade_considered", true)
        .neq("seller_id", userListing.seller_id)
        .neq("id", userListingId)

      if (!potentialTrades || potentialTrades.length === 0) {
        onMatchesFound([])
        return
      }

      // STEP 3: Get seller profiles for all potential trades
      setMatchingProgress(40)
      const sellerIds = potentialTrades.map((listing) => listing.seller_id)
      const { data: sellers } = await supabase.from("user_profiles").select("*").in("id", sellerIds)

      // STEP 4: Calculate compatibility for each potential trade
      setMatchingProgress(60)
      const matches: TradeMatch[] = []

      for (const listing of potentialTrades) {
        const seller = sellers?.find((s) => s.id === listing.seller_id)
        const compatibility = calculateCompatibility(userListing, listing, userPreferences)

        if (compatibility.score > 0) {
          matches.push({
            listing: {
              ...listing,
              images:
                listing.listing_photos?.sort((a, b) => a.sort_order - b.sort_order)?.map((photo) => photo.photo_url) ||
                [],
            },
            seller: seller || {},
            compatibilityScore: compatibility.score,
            matchReasons: compatibility.reasons,
            distance: userLocation ? calculateDistance(userLocation, listing.location) : undefined,
          })
        }
      }

      // STEP 5: Sort by compatibility score and return top matches
      setMatchingProgress(80)
      matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore)

      setMatchingProgress(100)
      onMatchesFound(matches.slice(0, 20)) // Return top 20 matches
    } catch (error) {
      console.error("Error finding trade matches:", error)
      onMatchesFound([])
    } finally {
      setIsMatching(false)
      setMatchingProgress(0)
    }
  }

  /**
   * PSEUDO: Compatibility scoring algorithm
   * FACTORS:
   *   - Vehicle type match (25 points)
   *   - Price range compatibility (20 points)
   *   - Year range match (15 points)
   *   - Make preference (15 points)
   *   - Mileage compatibility (10 points)
   *   - Condition match (10 points)
   *   - Feature preferences (5 points)
   */
  const calculateCompatibility = (userListing: any, targetListing: any, preferences: any) => {
    let score = 0
    const reasons: string[] = []
    const maxScore = 100

    // FACTOR 1: Vehicle type compatibility (25 points)
    if (preferences.bodyTypes?.includes(targetListing.body_type?.toLowerCase())) {
      score += 25
      reasons.push(`Matches your preferred ${targetListing.body_type} type`)
    }

    // FACTOR 2: Price range compatibility (20 points)
    const userPrice = userListing.price || 0
    const targetPrice = targetListing.price || 0
    const priceMin = preferences.priceRange?.[0] || 0
    const priceMax = preferences.priceRange?.[1] || 999999

    if (targetPrice >= priceMin && targetPrice <= priceMax) {
      const priceScore = 20 - (Math.abs(userPrice - targetPrice) / Math.max(userPrice, targetPrice)) * 10
      score += Math.max(priceScore, 5) // Minimum 5 points if in range
      reasons.push(`Price ${targetPrice.toLocaleString()} fits your budget`)
    }

    // FACTOR 3: Year range compatibility (15 points)
    const targetYear = targetListing.year || 0
    const yearMin = preferences.yearRange?.[0] || 1990
    const yearMax = preferences.yearRange?.[1] || new Date().getFullYear()

    if (targetYear >= yearMin && targetYear <= yearMax) {
      score += 15
      reasons.push(`${targetYear} model year matches your preference`)
    }

    // FACTOR 4: Make preference (15 points)
    if (preferences.makes?.includes(targetListing.make?.toLowerCase())) {
      score += 15
      reasons.push(`${targetListing.make} is on your preferred makes list`)
    }

    // FACTOR 5: Mileage compatibility (10 points)
    const targetMileage = targetListing.mileage || 0
    const mileageMax = preferences.mileageRange?.[1] || 999999

    if (targetMileage <= mileageMax) {
      const mileageScore = 10 - (targetMileage / mileageMax) * 5
      score += Math.max(mileageScore, 2)
      reasons.push(`Low mileage: ${targetMileage.toLocaleString()} miles`)
    }

    // FACTOR 6: Condition compatibility (10 points)
    if (preferences.conditions?.includes(targetListing.condition?.toLowerCase())) {
      score += 10
      reasons.push(`${targetListing.condition} condition meets your standards`)
    }

    // FACTOR 7: Fuel type preference (5 points)
    if (preferences.fuelTypes?.includes(targetListing.fuel_type?.toLowerCase())) {
      score += 5
      reasons.push(`${targetListing.fuel_type} fuel type matches preference`)
    }

    return {
      score: Math.round((score / maxScore) * 100),
      reasons: reasons.slice(0, 3), // Top 3 reasons
    }
  }

  /**
   * PSEUDO: Distance calculation between two locations
   * USES: Haversine formula for geographic distance
   */
  const calculateDistance = (userLocation: { lat: number; lng: number }, targetLocation: string) => {
    // This would implement actual distance calculation
    // For now, return a placeholder
    return Math.floor(Math.random() * 100) + 10
  }

  // Auto-run matching when component mounts or preferences change
  useEffect(() => {
    if (userListingId && userPreferences) {
      findTradeMatches()
    }
  }, [userListingId, userPreferences])

  return (
    <div className="trade-matching-engine">
      {isMatching && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Finding trade matches...</span>
            <span className="text-sm text-blue-700">{matchingProgress}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${matchingProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
