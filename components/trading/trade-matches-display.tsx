/**
 * PSEUDO CODE: Trade Matches Display Component
 *
 * PURPOSE: Display trade matches with compatibility scores and actions
 * FLOW:
 *   1. RECEIVE matches from matching engine
 *   2. DISPLAY each match with details and score
 *   3. PROVIDE actions for trade proposals
 */

"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Star, MapPin, Calendar, Gauge, Heart, TrendingUp, Award, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface TradeMatch {
  listing: any
  seller: any
  compatibilityScore: number
  matchReasons: string[]
  distance?: number
}

interface TradeMatchesDisplayProps {
  matches: TradeMatch[]
  userListing: any
  onSendTradeProposal: (targetListingId: string) => void
  isLoading?: boolean
}

export function TradeMatchesDisplay({
  matches,
  userListing,
  onSendTradeProposal,
  isLoading = false,
}: TradeMatchesDisplayProps) {
  const [favoriteMatches, setFavoriteMatches] = useState<Set<string>>(new Set())

  /**
   * PSEUDO: Toggle favorite status for a match
   */
  const toggleFavorite = (listingId: string) => {
    setFavoriteMatches((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(listingId)) {
        newSet.delete(listingId)
      } else {
        newSet.add(listingId)
      }
      return newSet
    })
  }

  /**
   * PSEUDO: Get compatibility badge color based on score
   */
  const getCompatibilityBadge = (score: number) => {
    if (score >= 80) return { color: "bg-green-100 text-green-800", label: "Excellent Match" }
    if (score >= 60) return { color: "bg-blue-100 text-blue-800", label: "Good Match" }
    if (score >= 40) return { color: "bg-yellow-100 text-yellow-800", label: "Fair Match" }
    return { color: "bg-gray-100 text-gray-800", label: "Possible Match" }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <div className="w-48 h-32 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Trade Matches Found</h3>
          <p className="text-gray-600 mb-6">
            We couldn't find any vehicles that match your trade preferences right now.
          </p>
          <div className="space-y-2 text-sm text-gray-500 mb-6">
            <p>• Make sure other listings are marked as "trade considered"</p>
            <p>• Try expanding your price range or year preferences</p>
            <p>• Consider more vehicle types or makes</p>
            <p>• Check that your listing has trade preferences set</p>
            <p>• Verify there are other active listings in the system</p>
          </div>
          <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded">
            <p>
              <strong>Debug Info:</strong>
            </p>
            <p>User Listing ID: {userListing?.id || "Not found"}</p>
            <p>Trade Considered: {userListing?.trade_considered ? "Yes" : "No"}</p>
            <p>Has Preferences: {userListing?.trade_preferences ? "Yes" : "No"}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* SECTION: Match summary header */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Found {matches.length} Trade {matches.length === 1 ? "Match" : "Matches"}
            </h2>
            <p className="text-gray-600">Based on your {userListing?.title} and trade preferences</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {matches.filter((m) => m.compatibilityScore >= 70).length}
            </div>
            <div className="text-sm text-gray-600">High compatibility</div>
          </div>
        </div>
      </div>

      {/* SECTION: Individual match cards */}
      <div className="space-y-4">
        {matches.map((match) => {
          const compatibilityBadge = getCompatibilityBadge(match.compatibilityScore)
          const isFavorited = favoriteMatches.has(match.listing.id)

          return (
            <Card key={match.listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex">
                  {/* SUBSECTION: Vehicle image */}
                  <div className="w-48 h-32 relative flex-shrink-0">
                    <Image
                      src={match.listing.images?.[0] || "/placeholder.svg"}
                      alt={match.listing.title}
                      fill
                      className="object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute top-2 right-2 ${
                        isFavorited ? "text-red-500" : "text-white"
                      } hover:text-red-500`}
                      onClick={() => toggleFavorite(match.listing.id)}
                    >
                      <Heart className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
                    </Button>
                  </div>

                  {/* SUBSECTION: Match details */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{match.listing.title}</h3>
                          <Badge className={compatibilityBadge.color}>
                            {match.compatibilityScore}% {compatibilityBadge.label}
                          </Badge>
                        </div>
                        <p className="text-2xl font-bold text-green-600 mb-2">
                          ${match.listing.price?.toLocaleString()}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {match.listing.year}
                          </div>
                          <div className="flex items-center">
                            <Gauge className="h-4 w-4 mr-1" />
                            {match.listing.mileage?.toLocaleString()} mi
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {match.listing.location}
                          </div>
                          {match.distance && <div className="text-blue-600">{match.distance} miles away</div>}
                        </div>
                      </div>

                      {/* SUBSECTION: Compatibility score circle */}
                      <div className="text-center">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                            match.compatibilityScore >= 80
                              ? "bg-green-500"
                              : match.compatibilityScore >= 60
                                ? "bg-blue-500"
                                : match.compatibilityScore >= 40
                                  ? "bg-yellow-500"
                                  : "bg-gray-500"
                          }`}
                        >
                          {match.compatibilityScore}%
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Match</div>
                      </div>
                    </div>

                    {/* SUBSECTION: Match reasons */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Why this is a good match:</h4>
                      <div className="space-y-1">
                        {match.matchReasons.map((reason, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2 flex-shrink-0" />
                            {reason}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SUBSECTION: Seller info and actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={match.seller?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {match.seller?.first_name?.[0]}
                            {match.seller?.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {match.seller?.first_name} {match.seller?.last_name}
                          </p>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-xs text-gray-600">
                              {match.seller?.average_rating || 5.0} ({match.seller?.total_reviews || 0} reviews)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/listing/${match.listing.id}`}>View Details</Link>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onSendTradeProposal(match.listing.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Award className="h-4 w-4 mr-2" />
                          Propose Trade
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
