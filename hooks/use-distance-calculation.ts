"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { distanceCache } from "@/lib/distance-utils"

interface Listing {
  id: string
  location: string
  city?: string
  state?: string
  zipCode?: string
}

interface DistanceData {
  listingId: string
  distance?: {
    text: string
    value: number
    miles: number
  }
  duration?: {
    text: string
    value: number
  }
  error?: string
}

// Function to validate and clean location strings
const isValidLocation = (location: string): boolean => {
  if (!location || typeof location !== "string") return false

  const cleaned = location.trim().toLowerCase()

  // Filter out invalid/placeholder locations
  const invalidLocations = [
    "location not specified",
    "not specified",
    "unknown",
    "n/a",
    "na",
    "tbd",
    "to be determined",
    "",
    "null",
    "undefined",
  ]

  if (invalidLocations.includes(cleaned)) return false
  if (cleaned.length < 3) return false

  return true
}

// Memoize the isValidLocation function
const memoizedIsValidLocation = (location: string): boolean => {
  const result = isValidLocation(location)
  return result
}

// Function to build location string from listing details
const buildLocationString = (listing: Listing): string | null => {
  // First try the main location field
  if (isValidLocation(listing.location)) {
    return listing.location.trim()
  }

  // Try to build from city, state, zipCode
  const parts = []
  if (listing.city && listing.city.trim() && listing.city.toLowerCase() !== "unknown") {
    parts.push(listing.city.trim())
  }
  if (listing.state && listing.state.trim() && listing.state.toLowerCase() !== "unknown") {
    parts.push(listing.state.trim())
  }
  if (listing.zipCode && listing.zipCode.trim() && listing.zipCode !== "00000") {
    parts.push(listing.zipCode.trim())
  }

  const constructed = parts.join(", ")
  return isValidLocation(constructed) ? constructed : null
}

// Memoize the buildLocationString function
const memoizedBuildLocationString = (listing: Listing): string | null => {
  const result = buildLocationString(listing)
  return result
}

export function useDistanceCalculation(userLocation: string | null, listings: Listing[]) {
  // State variables to manage distances, loading, errors, and API availability
  const [distances, setDistances] = useState<Map<string, DistanceData>>(new Map())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiAvailable, setApiAvailable] = useState(true)

  // useRef to hold the latest userLocation and listings for the useCallback
  const userLocationRef = useRef(userLocation)
  const listingsRef = useRef(listings)

  useEffect(() => {
    userLocationRef.current = userLocation
    listingsRef.current = listings
  }, [userLocation, listings])

  // useCallback to memoize the distance calculation logic
  const calculateDistances = useCallback(async () => {
    const userLocation = userLocationRef.current
    const listings = listingsRef.current

    // Reset distances if userLocation or listings are empty
    if (!userLocation || listings.length === 0) {
      setDistances(new Map())
      return
    }

    // Validate user location
    if (!isValidLocation(userLocation)) {
      console.warn("Invalid user location provided:", userLocation)
      setError("Please provide a valid location to calculate distances")
      return
    }

    // If we already know the API is unavailable, don't try again
    if (!apiAvailable) return

    setLoading(true)
    setError(null)

    try {
      // Prepare listings with proper location strings and separate valid from invalid
      const validListings = []
      const invalidListings = []

      listings.forEach((listing) => {
        const locationString = memoizedBuildLocationString(listing)
        if (locationString) {
          validListings.push({
            id: listing.id,
            location: locationString,
          })
        } else {
          invalidListings.push(listing.id)
        }
      })

      console.log(`Processing ${validListings.length} valid listings, ${invalidListings.length} invalid locations`)

      // Create distance map with invalid listings marked as unavailable
      const distanceMap = new Map<string, DistanceData>()

      // Add invalid listings to the map with appropriate messaging
      invalidListings.forEach((listingId) => {
        distanceMap.set(listingId, {
          listingId,
          distance: {
            text: "Location not available",
            value: 0,
            miles: 0,
          },
          duration: {
            text: "Time not available",
            value: 0,
          },
          error: "Listing location not specified",
        })
      })

      // If no valid listings, return early
      if (validListings.length === 0) {
        setDistances(distanceMap)
        setLoading(false)
        return
      }

      console.log(`Calculating distances from "${userLocation}" to ${validListings.length} valid listings`)

      // Batch the API calls to avoid rate limiting
      const batchSize = 10 // Adjust the batch size as needed
      const batchedListings = []
      for (let i = 0; i < validListings.length; i += batchSize) {
        batchedListings.push(validListings.slice(i, i + batchSize))
      }

      let allResults: any[] = []

      for (const batch of batchedListings) {
        const response = await fetch("/api/distance/batch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userLocation,
            listings: batch,
            units: "imperial",
          }),
        })

        if (!response.ok) {
          console.warn(`Distance API HTTP error: ${response.status}`)
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (!data.success) {
          console.warn("Distance API returned error:", data.error, data.errorDetail)
          throw new Error(data.error || "Failed to calculate distances")
        }

        allResults = allResults.concat(data.results)
      }

      // Add valid results to the map
      allResults.forEach((result: any) => {
        distanceMap.set(result.listingId, {
          listingId: result.listingId,
          distance: result.distance,
          duration: result.duration,
          error: result.error,
        })
      })

      setDistances(distanceMap)
      console.log(`Successfully calculated distances for ${allResults.length} valid listings`)
    } catch (err) {
      console.error("Distance calculation error:", err)
      setError(err instanceof Error ? err.message : "Failed to calculate distances")

      // Create fallback distances for all listings
      const fallbackMap = new Map<string, DistanceData>()
      listings.forEach((listing) => {
        const locationString = memoizedBuildLocationString(listing)
        fallbackMap.set(listing.id, {
          listingId: listing.id,
          distance: {
            text: locationString ? "Distance unavailable" : "Location not available",
            value: 0,
            miles: 0,
          },
          duration: {
            text: locationString ? "Time unavailable" : "Time not available",
            value: 0,
          },
          error: locationString ? "Distance calculation temporarily unavailable" : "Listing location not specified",
        })
      })

      setDistances(fallbackMap)
    } finally {
      setLoading(false)
    }
  }, [apiAvailable])

  // useEffect to trigger distance calculation when userLocation or listings change
  useEffect(() => {
    calculateDistances()
  }, [calculateDistances])

  // Function to get distance data for a specific listing
  const getDistance = useCallback(
    (listingId: string): DistanceData | null => {
      return distances.get(listingId) || null
    },
    [distances],
  )

  // Function to clear the cache and reset API availability
  const clearCache = useCallback(() => {
    distanceCache.clear()
    setDistances(new Map())
    setApiAvailable(true) // Reset API availability status
  }, [])

  return {
    distances,
    loading,
    error,
    apiAvailable,
    getDistance,
    clearCache,
  }
}
