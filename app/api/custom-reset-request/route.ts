import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // For testing purposes, we'll just validate the email format
    // and return success without actually sending an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Log the reset request for testing
    console.log(`Password reset requested for: ${email}`)

    // Return success - user can now go to the direct reset page
    return NextResponse.json({
      success: true,
      message: "Reset request processed. You can now reset your password directly.",
    })
  } catch (error) {
    console.error("Custom reset request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
