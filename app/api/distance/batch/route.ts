import { type NextRequest, NextResponse } from "next/server"
import { distanceCache } from "@/lib/distance-utils"

interface BatchDistanceRequest {
  userLocation: string
  listings: {
    id: string
    location: string
  }[]
  units?: "imperial" | "metric"
}

interface Coordinates {
  lat: number
  lng: number
}

// Function to validate location strings
function isValidLocationForGeocoding(location: string): boolean {
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

// Haversine formula to calculate distance between two points
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Geocode an address using OpenStreetMap Nominatim (free service) with improved error handling
async function geocodeAddress(address: string, retries = 3): Promise<Coordinates | null> {
  // Validate address before attempting geocoding
  if (!isValidLocationForGeocoding(address)) {
    console.warn(`Skipping geocoding for invalid address: "${address}"`)
    return null
  }

  // Clean and normalize the address
  const cleanAddress = address.trim().replace(/\s+/g, " ")

  // Common location fallbacks for known cities
  const locationFallbacks: Record<string, Coordinates> = {
    "st. cloud, florida": { lat: 28.2489, lng: -81.2811 },
    "saint cloud, florida": { lat: 28.2489, lng: -81.2811 },
    "orlando, florida": { lat: 28.5383, lng: -81.3792 },
    "miami, florida": { lat: 25.7617, lng: -80.1918 },
    "tampa, florida": { lat: 27.9506, lng: -82.4572 },
    "jacksonville, florida": { lat: 30.3322, lng: -81.6557 },
    "new york, new york": { lat: 40.7128, lng: -74.006 },
    "los angeles, california": { lat: 34.0522, lng: -118.2437 },
    "chicago, illinois": { lat: 41.8781, lng: -87.6298 },
    "houston, texas": { lat: 29.7604, lng: -95.3698 },
    "phoenix, arizona": { lat: 33.4484, lng: -112.074 },
    "philadelphia, pennsylvania": { lat: 39.9526, lng: -75.1652 },
    "san antonio, texas": { lat: 29.4241, lng: -98.4936 },
    "san diego, california": { lat: 32.7157, lng: -117.1611 },
    "dallas, texas": { lat: 32.7767, lng: -96.797 },
    "san jose, california": { lat: 37.3382, lng: -121.8863 },
  }

  // Check for fallback coordinates first
  const normalizedAddress = cleanAddress.toLowerCase()
  if (locationFallbacks[normalizedAddress]) {
    console.log(`Using fallback coordinates for "${address}"`)
    return locationFallbacks[normalizedAddress]
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const encodedAddress = encodeURIComponent(cleanAddress)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1&countrycodes=us`,
        {
          headers: {
            "User-Agent": "CarMarketplace/1.0 (contact@example.com)",
            Accept: "application/json",
          },
          signal: controller.signal,
        },
      )

      clearTimeout(timeoutId)

      if (!response.ok) {
        console.error(`Geocoding attempt ${attempt + 1} failed: ${response.status} ${response.statusText}`)
        if (attempt === retries) {
          console.warn(`All geocoding attempts failed for "${address}", checking fallbacks...`)
          return null
        }
        await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1))) // Longer backoff
        continue
      }

      const data = await response.json()
      if (data && data.length > 0 && data[0].lat && data[0].lon) {
        const lat = Number.parseFloat(data[0].lat)
        const lng = Number.parseFloat(data[0].lon)

        // Validate coordinates are reasonable for US
        if (lat >= 24 && lat <= 71 && lng >= -180 && lng <= -66) {
          console.log(`Successfully geocoded "${address}" to ${lat}, ${lng}`)
          return { lat, lng }
        } else {
          console.warn(`Invalid coordinates for "${address}": ${lat}, ${lng}`)
        }
      } else {
        console.warn(`No geocoding results for "${address}"`)
      }

      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)))
      }
    } catch (error) {
      console.error(`Geocoding attempt ${attempt + 1} error for "${address}":`, error)

      // If this is a network error and we have retries left, continue
      if (attempt < retries) {
        console.log(`Retrying geocoding for "${address}" in ${2000 * (attempt + 1)}ms...`)
        await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)))
        continue
      }

      // On final attempt, log the error but don't throw
      console.error(`Final geocoding attempt failed for "${address}":`, error)
    }
  }

  console.warn(`Could not geocode "${address}" after ${retries + 1} attempts`)
  return null
}

// Try Google Routes API first, fallback to free calculation
async function calculateDistanceWithFallback(
  userLocation: string,
  destination: string,
  apiKey: string | null,
): Promise<any> {
  // Validate both locations before processing
  if (!isValidLocationForGeocoding(userLocation)) {
    throw new Error(`Invalid origin address: "${userLocation}"`)
  }

  if (!isValidLocationForGeocoding(destination)) {
    throw new Error(`Invalid destination address: "${destination}"`)
  }

  // Try Google Routes API if available
  if (apiKey) {
    try {
      const routesUrl = "https://routes.googleapis.com/directions/v2:computeRoutes"

      const requestBody = {
        origin: { address: userLocation },
        destination: { address: destination },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_UNAWARE",
        computeAlternativeRoutes: false,
        units: "IMPERIAL",
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch(routesUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "routes.duration,routes.distanceMeters",
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0]
          const distanceMeters = route.distanceMeters || 0
          const durationSeconds = route.duration ? Number.parseInt(route.duration.replace("s", "")) : 0
          const miles = Math.round(distanceMeters * 0.000621371 * 10) / 10

          const hours = Math.floor(durationSeconds / 3600)
          const minutes = Math.floor((durationSeconds % 3600) / 60)
          const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

          const distanceText = miles < 1 ? "< 1 mile" : miles < 10 ? `${miles} miles` : `${Math.round(miles)} miles`

          return {
            distance: {
              text: distanceText,
              value: distanceMeters,
              miles: miles,
            },
            duration: {
              text: durationText,
              value: durationSeconds,
            },
            source: "google",
          }
        }
      }
    } catch (error) {
      console.log("Google Routes API failed, falling back to free calculation:", error)
    }
  }

  // Fallback to free geocoding + Haversine calculation
  try {
    console.log(`Using fallback calculation for "${userLocation}" to "${destination}"`)

    const [originCoords, destCoords] = await Promise.all([geocodeAddress(userLocation), geocodeAddress(destination)])

    if (!originCoords) {
      console.warn(`Could not geocode origin address: "${userLocation}"`)
      return {
        distance: {
          text: "Origin location unavailable",
          value: 0,
          miles: 0,
        },
        duration: {
          text: "Time unavailable",
          value: 0,
        },
        source: "geocoding_failed",
        error: `Could not locate: ${userLocation}`,
      }
    }

    if (!destCoords) {
      console.warn(`Could not geocode destination address: "${destination}"`)
      return {
        distance: {
          text: "Destination location unavailable",
          value: 0,
          miles: 0,
        },
        duration: {
          text: "Time unavailable",
          value: 0,
        },
        source: "geocoding_failed",
        error: `Could not locate: ${destination}`,
      }
    }

    const straightLineDistance = calculateHaversineDistance(
      originCoords.lat,
      originCoords.lng,
      destCoords.lat,
      destCoords.lng,
    )

    // Estimate driving distance (typically 1.2-1.4x straight line distance)
    const drivingDistance = Math.round(straightLineDistance * 1.3 * 10) / 10

    // Estimate driving time (assuming average 35 mph in mixed driving)
    const drivingTimeMinutes = Math.round((drivingDistance / 35) * 60)
    const hours = Math.floor(drivingTimeMinutes / 60)
    const minutes = drivingTimeMinutes % 60
    const durationText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

    const distanceText =
      drivingDistance < 1
        ? "< 1 mile"
        : drivingDistance < 10
          ? `${drivingDistance} miles`
          : `${Math.round(drivingDistance)} miles`

    // Add small delay to be respectful to free service
    await new Promise((resolve) => setTimeout(resolve, 300))

    return {
      distance: {
        text: distanceText,
        value: Math.round(drivingDistance * 1609.34), // Convert to meters
        miles: drivingDistance,
      },
      duration: {
        text: durationText,
        value: drivingTimeMinutes * 60, // Convert to seconds
      },
      source: "estimated",
    }
  } catch (error) {
    console.error("Fallback calculation failed:", error)

    // Return a default "unknown" result instead of throwing
    return {
      distance: {
        text: "Distance unavailable",
        value: 0,
        miles: 0,
      },
      duration: {
        text: "Time unavailable",
        value: 0,
      },
      source: "error",
      error: error instanceof Error ? error.message : "Network or geocoding error",
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userLocation, listings, units = "imperial" }: BatchDistanceRequest = await request.json()

    if (!userLocation || !listings || listings.length === 0) {
      return NextResponse.json({ error: "User location and listings are required" }, { status: 400 })
    }

    // Validate user location
    if (!isValidLocationForGeocoding(userLocation)) {
      return NextResponse.json({ error: "Invalid user location provided" }, { status: 400 })
    }

    // Filter out listings with invalid locations
    const validListings = listings.filter((listing) => isValidLocationForGeocoding(listing.location))
    const invalidListings = listings.filter((listing) => !isValidLocationForGeocoding(listing.location))

    console.log(
      `Processing ${validListings.length} valid listings, skipping ${invalidListings.length} invalid locations`,
    )

    const apiKey = process.env.GOOGLE_MAPS_API_KEY || null

    // Check cache first for valid listings
    const results = []
    const uncachedListings = []

    // Add invalid listings to results immediately
    invalidListings.forEach((listing) => {
      results.push({
        listingId: listing.id,
        origin: userLocation,
        destination: listing.location,
        distance: {
          text: "Location not available",
          value: 0,
          miles: 0,
        },
        duration: {
          text: "Time not available",
          value: 0,
        },
        source: "invalid",
        error: "Invalid or missing location data",
      })
    })

    // Check cache for valid listings
    for (const listing of validListings) {
      const cached = distanceCache.get(userLocation, listing.location)
      if (cached) {
        results.push({
          listingId: listing.id,
          ...cached,
        })
      } else {
        uncachedListings.push(listing)
      }
    }

    // If all valid results are cached, return immediately
    if (uncachedListings.length === 0) {
      return NextResponse.json({
        success: true,
        userLocation,
        results,
        cached: validListings.length,
        calculated: 0,
        invalid: invalidListings.length,
      })
    }

    // Process uncached listings with rate limiting
    const maxConcurrent = 3 // Reduced for free services
    const batches = []

    for (let i = 0; i < uncachedListings.length; i += maxConcurrent) {
      const batch = uncachedListings.slice(i, i + maxConcurrent)
      batches.push(batch)
    }

    for (const batch of batches) {
      const promises = batch.map(async (listing) => {
        try {
          const distanceData = await calculateDistanceWithFallback(userLocation, listing.location, apiKey)

          const result = {
            listingId: listing.id,
            origin: userLocation,
            destination: listing.location,
            ...distanceData,
          }

          // Cache the result
          distanceCache.set(userLocation, listing.location, {
            origin: result.origin,
            destination: result.destination,
            distance: result.distance,
            duration: result.duration,
          })

          return result
        } catch (error) {
          console.error(`Error calculating distance for listing ${listing.id}:`, error)
          return {
            listingId: listing.id,
            origin: userLocation,
            destination: listing.location,
            error: error instanceof Error ? error.message : "Unknown error",
            distance: {
              text: "Unknown",
              value: 0,
              miles: 0,
            },
            duration: {
              text: "Unknown",
              value: 0,
            },
            source: "error",
          }
        }
      })

      const batchResults = await Promise.all(promises)
      results.push(...batchResults)

      // Add delay between batches to be respectful to free services
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    return NextResponse.json({
      success: true,
      userLocation,
      results,
      cached: validListings.length - uncachedListings.length,
      calculated: uncachedListings.length,
      invalid: invalidListings.length,
      apiUsed: apiKey ? "google_with_fallback" : "free_only",
    })
  } catch (error) {
    console.error("Batch distance calculation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate distances",
        errorDetail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
