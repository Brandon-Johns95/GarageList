/**
 * PSEUDO CODE: Trade Matches Preview Page
 *
 * PURPOSE: Show potential trade matches before listing is published
 * FLOW:
 *   1. LOAD pending listing data from localStorage
 *   2. SIMULATE trade matching with current preferences
 *   3. DISPLAY potential matches to encourage listing completion
 *   4. PROVIDE option to continue with listing or modify preferences
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TradeMatchingEngine } from "@/components/trading/trade-matching-engine"
import { TradeMatchesDisplay } from "@/components/trading/trade-matches-display"
import { Header } from "@/components/header"

export default function TradeMatchesPreviewPage() {
  const router = useRouter()
  const [pendingListing, setPendingListing] = useState(null)
  const [tradePreferences, setTradePreferences] = useState(null)
  const [matches, setMatches] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  /**
   * PSEUDO: Load pending listing data from localStorage
   */
  useEffect(() => {
    const savedListing = localStorage.getItem("pendingListing")
    const savedPreferences = localStorage.getItem("pendingTradePreferences")

    if (!savedListing || !savedPreferences) {
      router.push("/sell")
      return
    }

    try {
      const listing = JSON.parse(savedListing)
      const preferences = JSON.parse(savedPreferences)

      setPendingListing(listing)
      setTradePreferences(preferences)
      setIsLoading(false)
    } catch (error) {
      console.error("Error loading pending listing:", error)
      router.push("/sell")
    }
  }, [router])

  /**
   * PSEUDO: Handle matches found from matching engine
   */
  const handleMatchesFound = (foundMatches) => {
    setMatches(foundMatches)
  }

  /**
   * PSEUDO: Continue with listing publication
   */
  const continueWithListing = () => {
    router.push("/sell")
  }

  /**
   * PSEUDO: Modify trade preferences
   */
  const modifyPreferences = () => {
    router.push("/sell?step=3")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading trade preview...</p>
        </div>
      </div>
    )
  }

  if (!pendingListing || !tradePreferences) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Pending Listing Found</h1>
          <p className="text-gray-600 mb-6">Please start by creating a listing with trade preferences.</p>
          <Button asChild>
            <a href="/sell">Create Listing</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* SECTION: Header with back button */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listing
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trade Matches Preview</h1>
              <p className="text-gray-600 mt-2">
                See potential trade matches for your {pendingListing.year} {pendingListing.make} {pendingListing.model}
              </p>
            </div>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Preview Mode
            </Badge>
          </div>
        </div>

        {/* SECTION: Listing preview card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Your Listing Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {pendingListing.year} {pendingListing.make} {pendingListing.model}
                </h3>
                <p className="text-2xl font-bold text-green-600">${pendingListing.price?.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{pendingListing.mileage?.toLocaleString()} miles</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Trade Preferences</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>• {tradePreferences.bodyTypes?.length || 0} vehicle types</p>
                  <p>
                    • ${tradePreferences.priceRange?.[0]?.toLocaleString()} - $
                    {tradePreferences.priceRange?.[1]?.toLocaleString()}
                  </p>
                  <p>
                    • {tradePreferences.yearRange?.[0]} - {tradePreferences.yearRange?.[1]} years
                  </p>
                  <p>• {tradePreferences.makes?.length || 0} preferred makes</p>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <Alert className="border-blue-200 bg-blue-50">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    Your listing will be searchable by traders once published!
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION: Trade matching engine */}
        <TradeMatchingEngine
          userListingId="preview"
          userPreferences={tradePreferences}
          previewListing={pendingListing}
          onMatchesFound={handleMatchesFound}
        />

        {/* SECTION: Matches display */}
        <div className="mb-8">
          <TradeMatchesDisplay
            matches={matches}
            userListing={pendingListing}
            onSendTradeProposal={(targetListingId) => {
              alert("Complete your listing first to send trade proposals!")
            }}
          />
        </div>

        {/* SECTION: Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={continueWithListing} className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-4 w-4 mr-2" />
            Complete Listing & Enable Trading
          </Button>

          <Button variant="outline" size="lg" onClick={modifyPreferences}>
            Modify Trade Preferences
          </Button>
        </div>

        {/* SECTION: Benefits of trading */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Trade on GarageList?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Smart Matching</h4>
                <p className="text-sm text-gray-600">
                  Our algorithm finds the best trade matches based on your preferences
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Secure Trading</h4>
                <p className="text-sm text-gray-600">Built-in verification and secure communication tools</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">No Fees</h4>
                <p className="text-sm text-gray-600">Trade directly with other users without platform fees</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
