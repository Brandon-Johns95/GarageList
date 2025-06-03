import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const zipCode = searchParams.get("zip")

    console.log("ZIP lookup request for:", zipCode)

    if (!zipCode) {
      return NextResponse.json({ error: "ZIP code is required" }, { status: 400 })
    }

    // Clean the ZIP code (remove spaces, ensure 5 digits)
    const cleanZip = zipCode.trim().replace(/\D/g, "").slice(0, 5)

    if (cleanZip.length !== 5) {
      return NextResponse.json(
        {
          error: "Invalid ZIP code format",
          details: `Expected 5 digits, got: ${cleanZip}`,
        },
        { status: 400 },
      )
    }

    // Use Google Maps Geocoding API to get location data
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY

    if (googleMapsApiKey) {
      try {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${cleanZip}&components=country:US&key=${googleMapsApiKey}`

        console.log("Making Google Maps API request for ZIP:", cleanZip)

        const response = await fetch(geocodeUrl)
        const data = await response.json()

        console.log("Google Maps API response status:", data.status)
        console.log("Google Maps API results count:", data.results?.length || 0)

        if (data.status === "OK" && data.results.length > 0) {
          const result = data.results[0]
          const addressComponents = result.address_components

          let city = ""
          let state = ""

          // Extract city and state from address components
          for (const component of addressComponents) {
            if (component.types.includes("locality")) {
              city = component.long_name
            }
            if (component.types.includes("administrative_area_level_1")) {
              state = component.short_name
            }
          }

          if (city && state) {
            const location = result.geometry.location

            const locationData = {
              city,
              state,
              zipCode: cleanZip,
              lat: location.lat,
              lng: location.lng,
            }

            console.log("Successfully found location:", locationData)

            return NextResponse.json({
              success: true,
              location: locationData,
              source: "google_maps",
            })
          }
        }
      } catch (error) {
        console.error("Google Maps API error:", error)
      }
    }

    // Fallback to comprehensive ZIP code database
    const zipDatabase: { [key: string]: { city: string; state: string; lat: number; lng: number } } = {
      // Major cities and common ZIP codes
      "10001": { city: "New York", state: "NY", lat: 40.7505, lng: -73.9934 },
      "10002": { city: "New York", state: "NY", lat: 40.7156, lng: -73.9877 },
      "10003": { city: "New York", state: "NY", lat: 40.7316, lng: -73.9893 },
      "10004": { city: "New York", state: "NY", lat: 40.6892, lng: -74.0165 },
      "10005": { city: "New York", state: "NY", lat: 40.7061, lng: -74.0087 },

      "90210": { city: "Beverly Hills", state: "CA", lat: 34.0901, lng: -118.4065 },
      "90211": { city: "Beverly Hills", state: "CA", lat: 34.0836, lng: -118.4006 },
      "90212": { city: "Beverly Hills", state: "CA", lat: 34.0669, lng: -118.4017 },

      "60601": { city: "Chicago", state: "IL", lat: 41.8825, lng: -87.6441 },
      "60602": { city: "Chicago", state: "IL", lat: 41.8796, lng: -87.6355 },
      "60603": { city: "Chicago", state: "IL", lat: 41.8781, lng: -87.6298 },

      "77001": { city: "Houston", state: "TX", lat: 29.7749, lng: -95.3895 },
      "77002": { city: "Houston", state: "TX", lat: 29.7604, lng: -95.3698 },
      "77003": { city: "Houston", state: "TX", lat: 29.7633, lng: -95.3432 },

      "85001": { city: "Phoenix", state: "AZ", lat: 33.4734, lng: -112.0964 },
      "85002": { city: "Phoenix", state: "AZ", lat: 33.4255, lng: -112.0373 },
      "85003": { city: "Phoenix", state: "AZ", lat: 33.4484, lng: -112.074 },

      "33101": { city: "Miami", state: "FL", lat: 25.7839, lng: -80.2102 },
      "33102": { city: "Miami", state: "FL", lat: 25.7753, lng: -80.1901 },
      "33103": { city: "Miami", state: "FL", lat: 25.7617, lng: -80.1918 },

      "94101": { city: "San Francisco", state: "CA", lat: 37.7849, lng: -122.4094 },
      "94102": { city: "San Francisco", state: "CA", lat: 37.7749, lng: -122.4194 },
      "94103": { city: "San Francisco", state: "CA", lat: 37.7716, lng: -122.4135 },

      "30301": { city: "Atlanta", state: "GA", lat: 33.7627, lng: -84.3931 },
      "30302": { city: "Atlanta", state: "GA", lat: 33.749, lng: -84.388 },
      "30303": { city: "Atlanta", state: "GA", lat: 33.7537, lng: -84.3901 },

      "75201": { city: "Dallas", state: "TX", lat: 32.7767, lng: -96.797 },
      "75202": { city: "Dallas", state: "TX", lat: 32.7831, lng: -96.8067 },
      "75203": { city: "Dallas", state: "TX", lat: 32.7668, lng: -96.8236 },

      "20001": { city: "Washington", state: "DC", lat: 38.9072, lng: -77.0369 },
      "20002": { city: "Washington", state: "DC", lat: 38.8973, lng: -76.9951 },
      "20003": { city: "Washington", state: "DC", lat: 38.8814, lng: -76.9947 },

      "98101": { city: "Seattle", state: "WA", lat: 47.6097, lng: -122.3331 },
      "98102": { city: "Seattle", state: "WA", lat: 47.6205, lng: -122.3212 },
      "98103": { city: "Seattle", state: "WA", lat: 47.6693, lng: -122.3414 },

      "02101": { city: "Boston", state: "MA", lat: 42.3584, lng: -71.0598 },
      "02102": { city: "Boston", state: "MA", lat: 42.3467, lng: -71.0567 },
      "02103": { city: "Boston", state: "MA", lat: 42.3601, lng: -71.0589 },

      "80201": { city: "Denver", state: "CO", lat: 39.7547, lng: -104.9962 },
      "80202": { city: "Denver", state: "CO", lat: 39.7392, lng: -104.9903 },
      "80203": { city: "Denver", state: "CO", lat: 39.7294, lng: -104.9533 },

      "97201": { city: "Portland", state: "OR", lat: 45.5152, lng: -122.6784 },
      "97202": { city: "Portland", state: "OR", lat: 45.4978, lng: -122.6442 },
      "97203": { city: "Portland", state: "OR", lat: 45.5428, lng: -122.7664 },

      "89101": { city: "Las Vegas", state: "NV", lat: 36.1699, lng: -115.1398 },
      "89102": { city: "Las Vegas", state: "NV", lat: 36.1672, lng: -115.1905 },
      "89103": { city: "Las Vegas", state: "NV", lat: 36.1447, lng: -115.1728 },

      // Additional ZIP codes
      "19101": { city: "Philadelphia", state: "PA", lat: 39.9526, lng: -75.1652 },
      "28201": { city: "Charlotte", state: "NC", lat: 35.2271, lng: -80.8431 },
      "37201": { city: "Nashville", state: "TN", lat: 36.1627, lng: -86.7816 },
      "43201": { city: "Columbus", state: "OH", lat: 39.9612, lng: -82.9988 },
      "46201": { city: "Indianapolis", state: "IN", lat: 39.7684, lng: -86.1581 },
      "53201": { city: "Milwaukee", state: "WI", lat: 43.0389, lng: -87.9065 },
      "55401": { city: "Minneapolis", state: "MN", lat: 44.9778, lng: -93.265 },
      "63101": { city: "St. Louis", state: "MO", lat: 38.627, lng: -90.1994 },
      "64108": { city: "Kansas City", state: "MO", lat: 39.0997, lng: -94.5786 },
      "70112": { city: "New Orleans", state: "LA", lat: 29.9511, lng: -90.0715 },
      "73101": { city: "Oklahoma City", state: "OK", lat: 35.4676, lng: -97.5164 },
      "84101": { city: "Salt Lake City", state: "UT", lat: 40.7608, lng: -111.891 },
    }

    const locationData = zipDatabase[cleanZip]

    if (locationData) {
      console.log("Found fallback data:", locationData)
      return NextResponse.json({
        success: true,
        location: {
          ...locationData,
          zipCode: cleanZip,
        },
        source: "fallback_database",
      })
    }

    // If not found in database, return error
    console.log("ZIP code not found in fallback database:", cleanZip)
    return NextResponse.json(
      {
        error: "ZIP code not found",
        details: `ZIP code ${cleanZip} not found in database. Please try a major city ZIP code.`,
        suggestion: "Try: 90210 (Beverly Hills), 10001 (NYC), 75201 (Dallas), or 33101 (Miami)",
      },
      { status: 404 },
    )
  } catch (error) {
    console.error("Error in ZIP lookup:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
