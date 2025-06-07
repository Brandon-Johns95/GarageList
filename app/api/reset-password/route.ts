import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create admin client with service role key
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    console.log("=== Password Reset API Called ===")
    console.log("Token received:", !!token)
    console.log("Token length:", token?.length)
    console.log("Password received:", !!password)
    console.log("Password length:", password?.length)
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("Service role key configured:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    if (!token || !password) {
      console.log("Missing token or password")
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      console.log("Password too short")
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Try to verify and use the token to get user info
    console.log("Attempting to verify token...")

    // Method 1: Try to get user from token
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !userData.user) {
      console.error("Failed to get user from token:", userError)

      // Method 2: Try to exchange the token
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password_recovery`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            },
            body: JSON.stringify({
              token: token,
              password: password,
            }),
          },
        )

        if (response.ok) {
          console.log("Password updated successfully via token exchange")
          return NextResponse.json({ success: true })
        }

        console.error("Token exchange failed:", response.status)
      } catch (exchangeError) {
        console.error("Token exchange error:", exchangeError)
      }

      return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
    }

    console.log("User found, updating password for user:", userData.user.id)

    // Update the user's password using admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userData.user.id, {
      password: password,
    })

    if (updateError) {
      console.error("Failed to update password:", updateError)
      return NextResponse.json({ error: "Failed to update password: " + updateError.message }, { status: 500 })
    }

    console.log("Password updated successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Password reset API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
