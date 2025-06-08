"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { X, Eye, EyeOff } from "lucide-react"

type SignInModalProps = {
  isOpen: boolean
  onClose: () => void
  onSwitchToSignUp: () => void
}

export function SignInModal({ isOpen, onClose, onSwitchToSignUp }: SignInModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)

  // TEMPORARILY DISABLED FOR TESTING
  // const [cooldownActive, setCooldownActive] = useState(false)
  // const [cooldownTime, setCooldownTime] = useState(0)
  // const [rateLimited, setRateLimited] = useState(false)

  const { signIn, resetPassword, user } = useAuth()

  // Load remember me preference on mount
  useEffect(() => {
    try {
      const remembered = localStorage.getItem("garage_list_remember_me") === "true"
      setRememberMe(remembered)
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [])

  useEffect(() => {
    if (user && isOpen) {
      // User is now authenticated, close the modal and reset loading
      setLoading(false)
      onClose()
    }
  }, [user, isOpen, onClose])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      // Reset form state when modal closes
      setShowForgotPassword(false)
      setResetSuccess(false)
      setError("")
      // setRateLimited(false) // TEMPORARILY DISABLED FOR TESTING
    }
  }, [isOpen])

  // TEMPORARILY DISABLED FOR TESTING
  /*
  // Check for existing rate limit on mount
  useEffect(() => {
    try {
      const lastResetTime = localStorage.getItem("garage_list_last_reset_time")
      if (lastResetTime) {
        const timeSinceLastReset = Date.now() - Number.parseInt(lastResetTime)
        const rateLimitDuration = 300000 // 5 minutes

        if (timeSinceLastReset < rateLimitDuration) {
          setRateLimited(true)
          const remainingTime = Math.ceil((rateLimitDuration - timeSinceLastReset) / 1000)
          setCooldownTime(remainingTime)
          setCooldownActive(true)

          const timer = setInterval(() => {
            setCooldownTime((prev) => {
              if (prev <= 1) {
                clearInterval(timer)
                setCooldownActive(false)
                setRateLimited(false)
                return 0
              }
              return prev - 1
            })
          }, 1000)
        }
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [])
  */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error } = await signIn(email, password, rememberMe)

      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        // Reset form on success
        setEmail("")
        setPassword("")
        setError("")
        // Don't set loading to false here - let the auth state change handle it
      }
    } catch (error) {
      console.error("Unexpected error during sign in:", error)
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setError("")

    // TEMPORARILY DISABLED FOR TESTING
    /*
    if (cooldownActive) {
      setError(`Please wait ${cooldownTime} seconds before requesting another reset email.`)
      setResetLoading(false)
      return
    }
    */

    if (!resetEmail || resetEmail.trim() === "") {
      setError("Please enter your email address")
      setResetLoading(false)
      return
    }

    try {
      const { error } = await resetPassword(resetEmail)

      if (error) {
        console.error("Password reset error:", error)

        // TEMPORARILY MODIFIED FOR TESTING
        // Just show the error message directly without rate limiting
        if (
          error.message.toLowerCase().includes("rate limit") ||
          error.message.toLowerCase().includes("too many requests") ||
          error.message.toLowerCase().includes("email rate limit exceeded")
        ) {
          // Show error but don't enforce cooldown
          setError(
            "Email rate limit exceeded. This would normally require waiting, but rate limiting is disabled for testing.",
          )

          // Clear any stored rate limit timestamp
          try {
            localStorage.removeItem("garage_list_last_reset_time")
          } catch (e) {
            // Ignore localStorage errors
          }
        } else {
          setError(error.message)
        }
      } else {
        setResetSuccess(true)
        // Clear any previous errors
        setError("")

        // TEMPORARILY DISABLED FOR TESTING
        /*
        // Store the timestamp for rate limiting
        try {
          localStorage.setItem("garage_list_last_reset_time", Date.now().toString())
        } catch (e) {
          // Ignore localStorage errors
        }

        // Set normal cooldown for successful request
        setCooldownActive(true)
        setCooldownTime(10) // 10 seconds for normal cooldown

        // Start cooldown timer
        const timer = setInterval(() => {
          setCooldownTime((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              setCooldownActive(false)
              return 0
            }
            return prev - 1
          })
        }, 1000)
        */
      }
    } catch (error) {
      console.error("Unexpected error during password reset:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setResetLoading(false)
    }
  }

  const resetForgotPasswordForm = () => {
    setShowForgotPassword(false)
    setResetEmail("")
    setResetSuccess(false)
    setError("")
  }

  const showForgotPasswordForm = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent default link behavior
    setShowForgotPassword(true)
    setError("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{showForgotPassword ? "Reset Password" : "Sign In"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForgotPassword ? (
            // Forgot Password Form
            <div className="space-y-4">
              {resetSuccess ? (
                <div className="text-center space-y-4">
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                      Password reset email sent! Check your inbox and follow the instructions to reset your password.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={resetForgotPasswordForm} className="w-full">
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">
                        {error}
                        {/* TEMPORARILY DISABLED FOR TESTING
                        {rateLimited && (
                          <div className="mt-2 text-sm space-y-1">
                            <div>
                              <strong>What you can do:</strong>
                            </div>
                            <div>• Check your email inbox (including spam folder) for existing reset emails</div>
                            <div>• Wait {Math.ceil(cooldownTime / 60)} minutes before trying again</div>
                            <div>• Contact support if you continue having issues</div>
                          </div>
                        )}
                        */}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <Label htmlFor="reset-email">Email Address</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      disabled={resetLoading}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={resetLoading}>
                    {resetLoading ? "Sending..." : "Send Reset Email"}
                  </Button>

                  <Button type="button" variant="outline" onClick={resetForgotPasswordForm} className="w-full">
                    Back to Sign In
                  </Button>
                </form>
              )}
            </div>
          ) : (
            // Sign In Form
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <Label htmlFor="remember-me" className="text-sm text-gray-600">
                  Keep me signed in
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>

              <div className="text-center space-y-2">
                <Button type="button" variant="link" className="p-0 h-auto text-sm" onClick={showForgotPasswordForm}>
                  Forgot your password?
                </Button>
                <div>
                  <span className="text-sm text-gray-600">Don't have an account? </span>
                  <Button type="button" variant="link" className="p-0 h-auto" onClick={onSwitchToSignUp}>
                    Sign Up
                  </Button>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* TESTING MODE INDICATOR */}
      <div className="fixed bottom-2 left-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
        Testing Mode: Rate Limiting Disabled
      </div>
    </div>
  )
}
