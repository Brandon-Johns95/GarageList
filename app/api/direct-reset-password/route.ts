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
    const { email, password } = await request.json()

    console.log("=== Direct Password Reset API Called ===")
    console.log("Email:", email)
    console.log("Password provided:", !!password)
    console.log("Password length:", password?.length)

    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      console.log("Password too short")
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // First, find the user by email
    console.log("Looking up user by email...")
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers()

    if (userError) {
      console.error("Error listing users:", userError)
      return NextResponse.json({ error: "Failed to find user" }, { status: 500 })
    }

    const user = userData.users.find((u) => u.email === email)

    if (!user) {
      console.log("User not found with email:", email)
      // For security reasons, don't reveal that the user doesn't exist
      return NextResponse.json(
        { error: "If your email exists in our system, a password reset has been processed" },
        { status: 400 },
      )
    }

    console.log("User found, updating password for user ID:", user.id)

    // Update the user's password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: password,
    })

    if (updateError) {
      console.error("Failed to update password:", updateError)
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    console.log("Password updated successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Direct password reset API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
