import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    // Call Google Maps Geocoding API
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`)

    if (!response.ok) {
      throw new Error("Failed to fetch from Google Maps API")
    }

    const data = await response.json()

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return NextResponse.json({ error: "No location found for these coordinates" }, { status: 404 })
    }

    // Extract city and state from the first result
    const result = data.results[0]
    let city = ""
    let state = ""

    for (const component of result.address_components) {
      if (component.types.includes("locality")) {
        city = component.long_name
      } else if (component.types.includes("administrative_area_level_1")) {
        state = component.long_name
      }
    }

    if (!city || !state) {
      return NextResponse.json({ error: "Could not determine city and state from location" }, { status: 404 })
    }

    return NextResponse.json({ city, state })
  } catch (error) {
    console.error("Geocoding error:", error)
    return NextResponse.json({ error: "Failed to get location details" }, { status: 500 })
  }
}
