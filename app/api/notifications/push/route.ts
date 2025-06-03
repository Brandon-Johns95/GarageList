import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // For now, return a simple response indicating push notifications are not configured
    // This prevents the build error while maintaining the API endpoint
    return NextResponse.json(
      {
        success: false,
        message: "Push notifications not configured",
      },
      { status: 501 },
    )
  } catch (error) {
    console.error("Push notification error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Push notifications service not configured",
    configured: false,
  })
}
