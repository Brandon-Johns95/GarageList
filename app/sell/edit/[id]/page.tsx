"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

export default function EditListingRedirect() {
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    // Redirect to sell page with edit mode and listing ID
    router.replace(`/sell?edit=${params.id}`)
  }, [router, params.id])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to edit mode...</p>
      </div>
    </div>
  )
}
