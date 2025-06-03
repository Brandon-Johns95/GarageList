/**
 * PSEUDO CODE: Trade Matches Page
 *
 * PURPOSE: Display trade matches for a specific user listing
 * FLOW:
 *   1. LOAD user's listing and trade preferences
 *   2. INITIALIZE trade matching engine
 *   3. DISPLAY matches with proposal actions
 *   4. HANDLE trade proposal creation
 */

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, RefreshCw, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { TradeMatchingEngine } from "@/components/trading/trade-matching-engine"
import { TradeMatchesDisplay } from "@/components/trading/trade-matches-display"

export default function TradeMatchesPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()

  // SECTION: Component state management
  const [listing, setListing] = useState(null)
  const [tradePreferences, setTradePreferences] = useState(null)
  const [matches, setMatches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  /**
   * PSEUDO: Load user's listing and trade preferences
   * STEPS:
   *   1. FETCH listing details from database
   *   2. VERIFY user owns the listing
   *   3. EXTRACT trade preferences
   *   4. VALIDATE trade eligibility
   */
  const loadListingData = async () => {
    try {
      setIsLoading(true)
      setError("")

      // STEP 1: Fetch listing with trade preferences
      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select(`
          *,
          listing_photos (photo_url, is_main_photo, sort_order)
        `)
        .eq("id", params.listingId)
        .single()

      if (listingError) throw new Error("Listing not found")

      // STEP 2: Verify ownership
      if (listingData.seller_id !== user?.id) {
        throw new Error("You can only view trade matches for your own listings")
      }

      // STEP 3: Check if trade is enabled
      if (!listingData.trade_considered) {
        throw new Error("This listing is not marked as trade-considered")
      }

      // STEP 4: Extract trade preferences
      const preferences = listingData.trade_preferences || {}

      setListing({
        ...listingData,
        images:
          listingData.listing_photos?.sort((a, b) => a.sort_order - b.sort_order)?.map((photo) => photo.photo_url) ||
          [],
      })
      setTradePreferences(preferences)
    } catch (error) {
      console.error("Error loading listing:", error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * PSEUDO: Handle trade proposal creation
   * FLOW:
   *   1. VALIDATE user authentication
   *   2. CREATE trade proposal record
   *   3. SEND notification to target seller
   *   4. REDIRECT to trade management
   */
  const handleSendTradeProposal = async (targetListingId: string) => {
    try {
      if (!user) {
        alert("Please sign in to send trade proposals")
        return
      }

      // Create trade proposal
      const { data: proposal, error } = await supabase
        .from("trade_proposals")
        .insert({
          proposer_listing_id: listing.id,
          target_listing_id: targetListingId,
          proposer_id: user.id,
          status: "pending",
          message: `I'd like to trade my ${listing.title} for your vehicle. Let's discuss!`,
        })
        .select()
        .single()

      if (error) throw error

      alert("Trade proposal sent successfully!")
      router.push(`/dashboard?tab=trades`)
    } catch (error) {
      console.error("Error sending trade proposal:", error)
      alert("Failed to send trade proposal. Please try again.")
    }
  }

  /**
   * PSEUDO: Refresh matches manually
   */
  const handleRefreshMatches = () => {
    setIsRefreshing(true)
    // The TradeMatchingEngine will automatically re-run
    setTimeout(() => setIsRefreshing(false), 2000)
  }

  // HOOK: Load data on component mount
  useEffect(() => {
    if (params.listingId && user) {
      loadListingData()
    }
  }, [params.listingId, user])

  // RENDER: Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading trade matches...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // RENDER: Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert className="max-w-2xl mx-auto">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center mt-6">
            <Button asChild>
              <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // RENDER: Main trade matches interface
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SECTION: Page header with navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trade Matches</h1>
              <p className="text-gray-600">For your {listing?.title}</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleRefreshMatches} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/sell/edit/${listing?.id}`}>
                <Settings className="h-4 w-4 mr-2" />
                Edit Preferences
              </Link>
            </Button>
          </div>
        </div>

        {/* SECTION: Your listing summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="w-24 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                {listing?.images?.[0] ? (
                  <img
                    src={listing.images[0] || "/placeholder.svg"}
                    alt={listing.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">No Image</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{listing?.title}</h3>
                <p className="text-xl font-bold text-green-600">${listing?.price?.toLocaleString()}</p>
                <p className="text-sm text-gray-600">
                  Looking to trade for: {tradePreferences?.bodyTypes?.join(", ") || "Various vehicle types"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION: Trade matching engine and results */}
        <TradeMatchingEngine
          userListingId={listing?.id}
          userPreferences={tradePreferences}
          onMatchesFound={setMatches}
        />

        <TradeMatchesDisplay
          matches={matches}
          userListing={listing}
          onSendTradeProposal={handleSendTradeProposal}
          isLoading={isRefreshing}
        />
      </div>
    </div>
  )
}
