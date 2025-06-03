import { type NextRequest, NextResponse } from "next/server"
import { marketCheckApi } from "@/lib/marketcheck-api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vin = searchParams.get("vin")

    if (!vin) {
      return NextResponse.json({ error: "VIN parameter is required" }, { status: 400 })
    }

    const vinData = await marketCheckApi.lookupVin(vin)

    if (vinData) {
      return NextResponse.json({ vinData })
    } else {
      return NextResponse.json(
        {
          error: "VIN not found",
          fallback: true,
          message: "VIN lookup service temporarily unavailable",
        },
        { status: 404 },
      )
    }
  } catch (error) {
    console.error("Error looking up VIN:", error)

    return NextResponse.json(
      {
        error: "VIN lookup service temporarily unavailable",
        fallback: true,
      },
      { status: 500 },
    )
  }
}
