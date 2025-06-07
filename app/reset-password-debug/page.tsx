"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ResetPasswordDebugPage() {
  const searchParams = useSearchParams()

  const allParams: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    allParams[key] = value
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Password Reset Debug Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Current URL:</h3>
              <p className="text-sm bg-gray-100 p-2 rounded">
                {typeof window !== "undefined" ? window.location.href : "Loading..."}
              </p>
            </div>

            <div>
              <h3 className="font-semibold">URL Parameters:</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">{JSON.stringify(allParams, null, 2)}</pre>
            </div>

            <div>
              <h3 className="font-semibold">Expected Parameters:</h3>
              <ul className="text-sm space-y-1">
                <li>
                  • <code>token</code> - Should be present
                </li>
                <li>
                  • <code>type</code> - Should be "recovery"
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
