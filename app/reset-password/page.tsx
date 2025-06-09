"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { updateUser, user, setNeedsPasswordReset } = useAuth()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [hasToken, setHasToken] = useState(false)

  // Check for token in URL
  useEffect(() => {
    const token = searchParams.get("access_token") || searchParams.get("token")
    const type = searchParams.get("type")

    console.log("Reset password page - checking token:", { hasToken: !!token, type })

    if (token && type === "recovery") {
      setHasToken(true)
    } else {
      setError("Invalid or missing reset token. Please request a new password reset.")
    }
  }, [searchParams])

  useEffect(() => {
    // If user is authenticated (came from reset link), mark them as needing password reset
    if (user) {
      setNeedsPasswordReset(true)
      // Redirect to home page where the modal will show
      router.push("/")
    } else {
      // If no user, redirect to sign in
      router.push("/")
    }
  }, [user, setNeedsPasswordReset, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await updateUser({ password })

      if (error) {
        throw new Error(error.message)
      }

      setSuccess(true)
    } catch (err) {
      console.error("Error updating password:", err)
      setError(err instanceof Error ? err.message : "Failed to update password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Password Updated!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/">Go to Home</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/?signin=true">Sign In Now</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processing password reset...</p>
      </div>
    </div>
  )
}
