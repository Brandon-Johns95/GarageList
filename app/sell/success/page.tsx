"use client"

import { useState, useEffect } from "react"
import { Check, Share2, Edit, Eye, MessageCircle, Calendar, Copy, Facebook, Twitter, Mail, Phone } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { GarageListLogo } from "@/components/garage-list-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Helper function to safely format numbers
const safeToLocaleString = (value: any): string => {
  const num = Number(value)
  return !isNaN(num) && isFinite(num) ? num.toLocaleString() : "0"
}

// Helper function to safely get string values
const safeString = (value: any): string => {
  return value && typeof value === "string" ? value : ""
}

export default function ListingSuccessPage() {
  const [copied, setCopied] = useState(false)
  const [publishedListing, setPublishedListing] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get the most recently published listing
    try {
      const userListingsData = localStorage.getItem("userListings")
      if (userListingsData) {
        const userListings = JSON.parse(userListingsData)
        if (Array.isArray(userListings) && userListings.length > 0) {
          // Get the most recent listing (first in array since we unshift new listings)
          const latestListing = userListings[0]
          setPublishedListing(latestListing)
        }
      }
    } catch (error) {
      console.error("Error loading published listing:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const copyListingUrl = async () => {
    if (!publishedListing) return

    const listingUrl = `${window.location.origin}/listing/${publishedListing.id}`
    try {
      await navigator.clipboard.writeText(listingUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy URL:", err)
    }
  }

  const shareOnFacebook = () => {
    if (!publishedListing) return

    const listingUrl = `${window.location.origin}/listing/${publishedListing.id}`
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(listingUrl)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const shareOnTwitter = () => {
    if (!publishedListing) return

    const listingUrl = `${window.location.origin}/listing/${publishedListing.id}`
    const text = `Check out my ${publishedListing.title} for sale on GarageList!`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(listingUrl)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const shareViaEmail = () => {
    if (!publishedListing) return

    const listingUrl = `${window.location.origin}/listing/${publishedListing.id}`
    const subject = `${publishedListing.title} for Sale`
    const body = `Hi,\n\nI'm selling my ${publishedListing.title} and thought you might be interested.\n\nPrice: $${safeToLocaleString(publishedListing.price)}\nMileage: ${safeToLocaleString(publishedListing.mileage)} miles\nCondition: ${publishedListing.condition}\nLocation: ${publishedListing.location}\n\nView the full listing here: ${listingUrl}\n\nThanks!`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your listing...</p>
        </div>
      </div>
    )
  }

  if (!publishedListing) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link href="/" className="flex items-center space-x-2">
                  <GarageListLogo />
                  <span className="text-2xl font-bold text-blue-600">GarageList</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" asChild>
                  <Link href="/">Browse Listings</Link>
                </Button>
                <Button asChild>
                  <Link href="/sell">List Another Vehicle</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">No Listing Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find your published listing. Please try listing your vehicle again.
          </p>
          <Button asChild>
            <Link href="/sell">Create New Listing</Link>
          </Button>
        </div>
      </div>
    )
  }

  const listingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/listing/${publishedListing.id}`
  const listingId = `GL-${publishedListing.id}`
  const publishedDate = publishedListing.publishedAt ? new Date(publishedListing.publishedAt) : new Date()
  const expiresDate = new Date(publishedDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days from published date

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <GarageListLogo />
                <span className="text-2xl font-bold text-blue-600">GarageList</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/">Browse Listings</Link>
              </Button>
              <Button asChild>
                <Link href="/sell">List Another Vehicle</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Listing Published Successfully!</h1>
          <p className="text-lg text-gray-600">Your {publishedListing.title} is now live on GarageList</p>
        </div>

        {/* Listing Preview */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Your Listing Preview</CardTitle>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Image
                  src={publishedListing.images?.[0] || "/placeholder.svg?height=300&width=400"}
                  alt={publishedListing.title}
                  width={400}
                  height={300}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{publishedListing.title}</h3>
                  <p className="text-3xl font-bold text-blue-600">${safeToLocaleString(publishedListing.price)}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Year:</span>
                    <p className="font-medium">{publishedListing.year}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Mileage:</span>
                    <p className="font-medium">{safeToLocaleString(publishedListing.mileage)} mi</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Condition:</span>
                    <p className="font-medium">{publishedListing.condition}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Location:</span>
                    <p className="font-medium">{publishedListing.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Fuel Type:</span>
                    <p className="font-medium">{publishedListing.fuelType}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Transmission:</span>
                    <p className="font-medium">{publishedListing.transmission}</p>
                  </div>
                </div>

                {/* Additional Details */}
                {(publishedListing.exteriorColor || publishedListing.bodyType) && (
                  <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                    {publishedListing.exteriorColor && (
                      <div>
                        <span className="text-gray-600">Exterior Color:</span>
                        <p className="font-medium capitalize">{publishedListing.exteriorColor}</p>
                      </div>
                    )}
                    {publishedListing.bodyType && (
                      <div>
                        <span className="text-gray-600">Body Type:</span>
                        <p className="font-medium">{publishedListing.bodyType}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Features Preview */}
                {publishedListing.features && publishedListing.features.length > 0 && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-600 text-sm">Features:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {publishedListing.features.slice(0, 4).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {publishedListing.features.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{publishedListing.features.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button asChild className="flex-1">
                    <Link href={`/listing/${publishedListing.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Listing
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/sell/edit/${publishedListing.id}`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Listing Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Listing Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Listing ID</Label>
                <p className="font-mono text-sm">{listingId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Published</Label>
                <p className="text-sm">{publishedDate.toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Expires</Label>
                <p className="text-sm">{expiresDate.toLocaleDateString()}</p>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-gray-600 mb-2 block">Listing URL</Label>
                <div className="flex space-x-2">
                  <Input value={listingUrl} readOnly className="text-sm" />
                  <Button variant="outline" size="sm" onClick={copyListingUrl}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                {copied && <p className="text-sm text-green-600 mt-1">URL copied to clipboard!</p>}
              </div>
            </CardContent>
          </Card>

          {/* Share Your Listing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="h-5 w-5 mr-2" />
                Share Your Listing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">Spread the word about your listing to reach more potential buyers</p>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={shareOnFacebook} className="justify-start">
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button variant="outline" onClick={shareOnTwitter} className="justify-start">
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button variant="outline" onClick={shareViaEmail} className="justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" onClick={copyListingUrl} className="justify-start">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle Description Preview */}
        {publishedListing.description && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap line-clamp-4">{publishedListing.description}</p>
              {publishedListing.description.length > 200 && (
                <Button variant="link" className="p-0 h-auto mt-2" asChild>
                  <Link href={`/listing/${publishedListing.id}`}>Read full description</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Additional Options Display */}
        {(publishedListing.negotiable || publishedListing.tradeConsidered || publishedListing.financingAvailable) && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Additional Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {publishedListing.negotiable && (
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Price is negotiable</span>
                  </div>
                )}
                {publishedListing.tradeConsidered && (
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Trade-in considered</span>
                  </div>
                )}
                {publishedListing.financingAvailable && (
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Financing available</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Respond to Inquiries</h3>
                <p className="text-sm text-gray-600">Check your email and phone for messages from interested buyers</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Schedule Viewings</h3>
                <p className="text-sm text-gray-600">Arrange safe meetups in public places for test drives</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Monitor Performance</h3>
                <p className="text-sm text-gray-600">Track views and engagement on your listing dashboard</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Tips */}
        <Alert className="mt-8">
          <Phone className="h-4 w-4" />
          <AlertDescription>
            <strong>Safety Reminder:</strong> Always meet potential buyers in public places, bring a friend if possible,
            and trust your instincts. Never share personal financial information or accept unusual payment methods.
          </AlertDescription>
        </Alert>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button asChild className="flex-1">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/sell">List Another Vehicle</Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href="/">Browse Marketplace</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
