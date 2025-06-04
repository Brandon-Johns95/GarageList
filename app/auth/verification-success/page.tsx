"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SignInModal } from "@/components/auth/sign-in-modal"
import { SignUpModal } from "@/components/auth/sign-up-modal"
import { supabase } from "@/lib/supabase"
import { CheckCircle, Mail, ArrowRight } from "lucide-react"

export default function VerificationSuccessPage() {
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [verificationError, setVerificationError] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Check if this is an email verification callback
        const type = searchParams.get("type")
        const accessToken = searchParams.get("access_token")
        const refreshToken = searchParams.get("refresh_token")

        if (type === "signup" && accessToken && refreshToken) {
          // Set the session with the tokens from the email link
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            console.error("Error setting session:", error)
            setVerificationError("There was an error verifying your email. Please try again.")
          } else {
            // Sign out immediately after verification to ensure clean sign-in
            await supabase.auth.signOut()
          }
        }
      } catch (error) {
        console.error("Verification error:", error)
        setVerificationError("An unexpected error occurred during verification.")
      } finally {
        setIsVerifying(false)
      }
    }

    handleEmailVerification()
  }, [searchParams])

  const handleSignInSuccess = () => {
    setShowSignIn(false)
    router.push("/dashboard")
  }

  const handleBrowseAsGuest = () => {
    router.push("/")
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Verifying your email...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">🎉 Congratulations!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {verificationError ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{verificationError}</AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center space-x-2 text-green-600">
                  <Mail className="h-5 w-5" />
                  <span className="font-medium">Email Verified Successfully!</span>
                </div>
                <p className="text-gray-600">
                  Your email has been verified and your account is now active. You can now sign in to access all
                  features of GarageList.
                </p>
              </div>

              <div className="space-y-3">
                <Button onClick={() => setShowSignIn(true)} className="w-full" size="lg">
                  Sign In to Your Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button variant="outline" onClick={handleBrowseAsGuest} className="w-full">
                  Browse as Guest
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>Welcome to GarageList! We're excited to have you on board.</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={() => {
          setShowSignIn(false)
          setShowSignUp(true)
        }}
        onSignInSuccess={handleSignInSuccess}
      />

      <SignUpModal
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={() => {
          setShowSignUp(false)
          setShowSignIn(true)
        }}
      />
    </div>
  )
}
