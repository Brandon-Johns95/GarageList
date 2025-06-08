"use client"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

// Create Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const processResetLink = async () => {
      try {
        const fullUrl = window.location.href
        const url = new URL(fullUrl)

        // Get tokens from URL
        const accessToken = url.searchParams.get("access_token")
        const refreshToken = url.searchParams.get("refresh_token")
        const type = url.searchParams.get("type")

        // Also check hash parameters
        const hash = url.hash
        let hashAccessToken = null
        let hashRefreshToken = null
        if (hash) {
          const hashParams = new URLSearchParams(hash.substring(1))
          hashAccessToken = hashParams.get("access_token")
          hashRefreshToken = hashParams.get("refresh_token")
        }

        const finalAccessToken = accessToken || hashAccessToken
        const finalRefreshToken = refreshToken || hashRefreshToken

        console.log("Processing reset link...")
        console.log("Has access token:", !!finalAccessToken)
        console.log("Has refresh token:", !!finalRefreshToken)
        console.log("Type:", type)

        if (finalAccessToken && finalRefreshToken) {
          // Set the session to sign the user in
          const { data, error } = await supabase.auth.setSession({
            access_token: finalAccessToken,
            refresh_token: finalRefreshToken,
          })

          if (error) {
            console.error("Failed to set session:", error)
            setError("Invalid or expired reset link. Please request a new password reset.")
          } else if (data.session) {
            console.log("User signed in successfully, redirecting to homepage...")
            // Redirect to homepage with a flag to show password change modal
            router.push("/?changePassword=true")
          } else {
            setError("Failed to sign in. Please request a new password reset.")
          }
        } else {
          setError("Invalid reset link format. Please request a new password reset.")
        }
      } catch (err) {
        console.error("Error processing reset link:", err)
        setError("Error processing reset link. Please request a new password reset.")
      } finally {
        setIsProcessing(false)
      }
    }

    processResetLink()
  }, [searchParams, router])

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your password reset link...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Reset Link Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="/?forgotPassword=true"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Request New Reset Link
          </a>
        </div>
      </div>
    )
  }

  return null
}
