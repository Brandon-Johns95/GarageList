"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export function DistanceApiStatusChecker() {
  const [status, setStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle")
  const [message, setMessage] = useState("")

  const checkApiStatus = async () => {
    setStatus("checking")

    try {
      const response = await fetch("/api/distance/verify-key")
      const data = await response.json()

      if (data.valid) {
        setStatus("valid")
        setMessage(
          `API key is valid. Geocoding: ${data.geocodingStatus}, Distance Matrix: ${
            data.distanceMatrixEnabled ? "Enabled" : "Disabled"
          }`,
        )
      } else {
        setStatus("invalid")
        setMessage(`API key issue: ${data.error}. ${data.message || ""}`)
      }
    } catch (error) {
      setStatus("invalid")
      setMessage(`Failed to check API status: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  useEffect(() => {
    // Auto-check on mount
    checkApiStatus()
  }, [])

  return (
    <div className="space-y-4">
      {status === "valid" ? (
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Google Maps API is working</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : status === "invalid" ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Google Maps API Error</AlertTitle>
          <AlertDescription>
            {message}
            <div className="mt-2">
              <p className="text-sm">Please check that:</p>
              <ul className="list-disc pl-5 text-sm">
                <li>The Google Maps API key is correctly set in your environment variables</li>
                <li>The Distance Matrix API is enabled in your Google Cloud Console</li>
                <li>There are no billing issues with your Google Cloud account</li>
                <li>The API key doesn't have domain restrictions that prevent server-side usage</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={checkApiStatus} disabled={status === "checking"}>
          {status === "checking" ? "Checking..." : "Check API Status"}
        </Button>
      </div>
    </div>
  )
}
