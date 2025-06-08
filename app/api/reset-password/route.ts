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
    console.log("Token first 20 chars:", token?.substring(0, 20))
    console.log("Token last 20 chars:", token?.substring(token?.length - 20))
    console.log("Password received:", !!password)
    console.log("Password length:", password?.length)
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("Service role key configured:", !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log("Anon key configured:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    if (!token || !password) {
      console.log("Missing token or password")
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      console.log("Password too short")
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Method 1: Try the recovery endpoint with the exact token format
    console.log("=== Method 1: Direct Recovery Endpoint ===")
    try {
      const recoveryUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/recover`
      console.log("Recovery URL:", recoveryUrl)

      const recoveryPayload = {
        token: token,
        password: password,
        type: "recovery",
      }
      console.log("Recovery payload:", recoveryPayload)

      const recoveryResponse = await fetch(recoveryUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify(recoveryPayload),
      })

      console.log("Recovery response status:", recoveryResponse.status)
      console.log("Recovery response headers:", Object.fromEntries(recoveryResponse.headers.entries()))

      if (recoveryResponse.ok) {
        const recoveryData = await recoveryResponse.json()
        console.log("Password recovery successful via direct method")
        console.log("Recovery response data:", recoveryData)
        return NextResponse.json({ success: true })
      } else {
        const errorData = await recoveryResponse.text()
        console.log("Recovery method failed with response:", errorData)

        try {
          const parsedError = JSON.parse(errorData)
          console.log("Parsed error:", parsedError)
        } catch (e) {
          console.log("Could not parse error as JSON")
        }
      }
    } catch (recoveryError) {
      console.error("Recovery method error:", recoveryError)
    }

    // Method 2: Try using the token as an access token
    console.log("=== Method 2: Token as Access Token ===")
    try {
      const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token)
      console.log("getUser result:", { userData: !!userData?.user, userError })

      if (userData?.user && !userError) {
        console.log("User found via access token, updating password for user:", userData.user.id)

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userData.user.id, {
          password: password,
        })

        if (updateError) {
          console.error("Failed to update password via admin:", updateError)
        } else {
          console.log("Password updated successfully via admin method")
          return NextResponse.json({ success: true })
        }
      }
    } catch (accessTokenError) {
      console.error("Access token method error:", accessTokenError)
    }

    // Method 3: Try the user endpoint directly
    console.log("=== Method 3: Direct User Endpoint ===")
    try {
      const userUpdateResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({
          password: password,
        }),
      })

      console.log("User update response status:", userUpdateResponse.status)

      if (userUpdateResponse.ok) {
        const updateData = await userUpdateResponse.json()
        console.log("Password updated successfully via user endpoint")
        console.log("Update response data:", updateData)
        return NextResponse.json({ success: true })
      } else {
        const errorData = await userUpdateResponse.text()
        console.log("User endpoint failed with response:", errorData)
      }
    } catch (userEndpointError) {
      console.error("User endpoint method error:", userEndpointError)
    }

    // Method 4: Try password recovery with different payload format
    console.log("=== Method 4: Alternative Recovery Format ===")
    try {
      const altRecoveryResponse = await fetch(
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

      console.log("Alternative recovery response status:", altRecoveryResponse.status)

      if (altRecoveryResponse.ok) {
        const altData = await altRecoveryResponse.json()
        console.log("Password updated successfully via alternative recovery")
        console.log("Alternative recovery data:", altData)
        return NextResponse.json({ success: true })
      } else {
        const errorData = await altRecoveryResponse.text()
        console.log("Alternative recovery failed with response:", errorData)
      }
    } catch (altRecoveryError) {
      console.error("Alternative recovery method error:", altRecoveryError)
    }

    console.log("All methods failed")
    return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 400 })
  } catch (error) {
    console.error("Password reset API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
