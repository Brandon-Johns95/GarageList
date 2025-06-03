import { NextResponse } from "next/server"

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    const results = {
      googleMapsAvailable: false,
      fallbackAvailable: false,
      recommendedService: "fallback",
      details: {} as any,
    }

    // Test Google Routes API if key is available
    if (apiKey) {
      try {
        const routesUrl = "https://routes.googleapis.com/directions/v2:computeRoutes"

        const testRequestBody = {
          origin: { address: "New York, NY" },
          destination: { address: "Philadelphia, PA" },
          travelMode: "DRIVE",
          routingPreference: "TRAFFIC_UNAWARE",
          computeAlternativeRoutes: false,
          units: "IMPERIAL",
        }

        const response = await fetch(routesUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "routes.duration,routes.distanceMeters",
          },
          body: JSON.stringify(testRequestBody),
        })

        if (response.ok) {
          const data = await response.json()
          if (data.routes && data.routes.length > 0) {
            results.googleMapsAvailable = true
            results.recommendedService = "google"
            results.details.google = {
              status: "working",
              message: "Google Routes API is functioning correctly",
            }
          }
        } else {
          results.details.google = {
            status: "error",
            code: response.status,
            message: `Google Routes API returned ${response.status}`,
          }
        }
      } catch (error) {
        results.details.google = {
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        }
      }
    } else {
      results.details.google = {
        status: "not_configured",
        message: "Google Maps API key not found in environment variables",
      }
    }

    // Test fallback geocoding service
    try {
      const response = await fetch("https://nominatim.openstreetmap.org/search?format=json&q=New+York,+NY&limit=1", {
        headers: {
          "User-Agent": "CarMarketplace/1.0",
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          results.fallbackAvailable = true
          results.details.fallback = {
            status: "working",
            message: "OpenStreetMap Nominatim geocoding service is available",
          }
        }
      } else {
        results.details.fallback = {
          status: "error",
          code: response.status,
          message: `Nominatim service returned ${response.status}`,
        }
      }
    } catch (error) {
      results.details.fallback = {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: results.googleMapsAvailable
        ? "Google Routes API is working - using premium service"
        : results.fallbackAvailable
          ? "Using free fallback distance calculation service"
          : "No distance calculation services available",
    })
  } catch (error) {
    console.error("API verification error:", error)
    return NextResponse.json({
      success: false,
      error: "VERIFICATION_FAILED",
      message: error instanceof Error ? error.message : "Unknown error during verification",
    })
  }
}
