import { type NextRequest, NextResponse } from "next/server"
import { distanceCache } from "@/lib/distance-utils"

interface Coordinates {
  lat: number
  lng: number
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

// Geocode an address using OpenStreetMap Nominatim (free service)
async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    const encodedAddress = encodeURIComponent(address)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`,
      {
        headers: {
          "User-Agent": "CarMarketplace/1.0",
        },
      },
    )

    if (!response.ok) {
      console.error(`Geocoding failed: ${response.status}`)
      return null
    }

    const data = await response.json()
    if (data && data.length > 0) {
      return {
        lat: Number.parseFloat(data[0].lat),
        lng: Number.parseFloat(data[0].lon),
      }
    }

    return null
  } catch (error) {
    console.error("Geocoding error:", error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const origin = searchParams.get("origin")
    const destination = searchParams.get("destination")
    const units = searchParams.get("units") || "imperial"

    if (!origin || !destination) {
      return NextResponse.json({ error: "Origin and destination are required" }, { status: 400 })
    }

    // Check cache first
    const cached = distanceCache.get(origin, destination)
    if (cached) {
      return NextResponse.json({
        success: true,
        cached: true,
        ...cached,
      })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    // Try Google Routes API first if available
    if (apiKey) {
      try {
        const routesUrl = "https://routes.googleapis.com/directions/v2:computeRoutes"

        const requestBody = {
          origin: { address: origin },
          destination: { address: destination },
          travelMode: "DRIVE",
          routingPreference: "TRAFFIC_UNAWARE",
          computeAlternativeRoutes: false,
          units: units.toUpperCase(),
        }

        const response = await fetch(routesUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "routes.duration,routes.distanceMeters",
          },
          body: JSON.stringify(requestBody),
        })

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

            const result = {
              success: true,
              cached: false,
              origin: origin,
              destination: destination,
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

            // Cache the result
            distanceCache.set(origin, destination, {
              origin: result.origin,
              destination: result.destination,
              distance: result.distance,
              duration: result.duration,
            })

            return NextResponse.json(result)
          }
        }
      } catch (error) {
        console.log("Google Routes API failed, using fallback calculation")
      }
    }

    // Fallback to free geocoding + Haversine calculation
    console.log(`Using fallback calculation for ${origin} to ${destination}`)

    const [originCoords, destCoords] = await Promise.all([geocodeAddress(origin), geocodeAddress(destination)])

    if (!originCoords || !destCoords) {
      return NextResponse.json({ error: "Could not geocode one or both addresses" }, { status: 400 })
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

    const result = {
      success: true,
      cached: false,
      origin: origin,
      destination: destination,
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

    // Cache the result
    distanceCache.set(origin, destination, {
      origin: result.origin,
      destination: result.destination,
      distance: result.distance,
      duration: result.duration,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Distance calculation error:", error)
    return NextResponse.json({ error: "Failed to calculate distance" }, { status: 500 })
  }
}
