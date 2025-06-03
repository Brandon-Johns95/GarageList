"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Heart,
  Share2,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  Users,
  Cog,
  Star,
  Shield,
  CheckCircle,
  AlertTriangle,
  Camera,
  ChevronLeft,
  ChevronRight,
  Flag,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { GarageListLogo } from "@/components/garage-list-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Helper function to safely format numbers
const safeToLocaleString = (value: any): string => {
  const num = Number(value)
  return !isNaN(num) && isFinite(num) ? num.toLocaleString() : "0"
}

// Helper function to safely get string values
const safeString = (value: any): string => {
  return value && typeof value === "string" ? value : ""
}

// Helper function to validate and clean listing data
const validateListing = (listing: any) => {
  if (!listing) return null

  return {
    ...listing,
    id: listing.id || Date.now(),
    title: safeString(listing.title) || "Unknown Vehicle",
    price: Number(listing.price) || 0,
    year: Number(listing.year) || new Date().getFullYear(),
    mileage: Number(listing.mileage) || 0,
    location: safeString(listing.location) || "Unknown Location",
    images: Array.isArray(listing.images) ? listing.images : ["/placeholder.svg?height=400&width=600"],
    seller: {
      name: safeString(listing.seller?.name) || "Unknown Seller",
      rating: Number(listing.seller?.rating) || 5.0,
      reviews: Number(listing.seller?.reviews) || 0,
      avatar: safeString(listing.seller?.avatar) || "/placeholder.svg?height=40&width=40",
    },
    features: Array.isArray(listing.features) ? listing.features : [],
    fuelType: safeString(listing.fuelType) || "Gasoline",
    transmission: safeString(listing.transmission) || "Automatic",
    bodyType: safeString(listing.bodyType) || "Sedan",
    condition: safeString(listing.condition) || "Good",
    description: safeString(listing.description) || "No description provided.",
    exteriorColor: safeString(listing.exteriorColor) || "Unknown",
    interiorColor: safeString(listing.interiorColor) || "Unknown",
    vin: safeString(listing.vin) || "",
    negotiable: Boolean(listing.negotiable),
    tradeConsidered: Boolean(listing.tradeConsidered),
    financingAvailable: Boolean(listing.financingAvailable),
  }
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [listing, setListing] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactMessage, setContactMessage] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")

  useEffect(() => {
    const loadListing = () => {
      try {
        const userListingsData = localStorage.getItem("userListings")
        if (userListingsData) {
          const userListings = JSON.parse(userListingsData)
          if (Array.isArray(userListings)) {
            const foundListing = userListings.find((listing) => listing.id.toString() === params.id)
            if (foundListing) {
              setListing(validateListing(foundListing))
            }
          }
        }
      } catch (error) {
        console.error("Error loading listing:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      loadListing()
    }
  }, [params.id])

  const nextImage = () => {
    if (listing && listing.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length)
    }
  }

  const prevImage = () => {
    if (listing && listing.images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length)
    }
  }

  const handleContactSubmit = (e) => {
    e.preventDefault()
    // In a real app, this would send the message to the seller
    console.log("Contact form submitted:", {
      listingId: listing.id,
      name: contactName,
      email: contactEmail,
      phone: contactPhone,
      message: contactMessage,
    })
    alert("Your message has been sent to the seller!")
    setShowContactForm(false)
    setContactMessage("")
    setContactName("")
    setContactEmail("")
    setContactPhone("")
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Check out this ${listing.title} for $${safeToLocaleString(listing.price)}`,
          url: url,
        })
      } catch (error) {
        console.log("Error sharing:", error)
      }
    } else {
      // Fallback to copying URL
      try {
        await navigator.clipboard.writeText(url)
        alert("Link copied to clipboard!")
      } catch (error) {
        console.log("Error copying to clipboard:", error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing...</p>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-2">
                <GarageListLogo />
                <span className="text-2xl font-bold text-blue-600">GarageList</span>
              </Link>
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h1>
          <p className="text-gray-600 mb-6">The listing you're looking for doesn't exist or has been removed.</p>
          <div className="space-x-4">
            <Button onClick={() => router.back()} variant="outline">
              Go Back
            </Button>
            <Button asChild>
              <Link href="/">Browse All Listings</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <GarageListLogo />
                <span className="text-2xl font-bold text-blue-600">GarageList</span>
              </Link>
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Listings
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setIsFavorited(!isFavorited)}>
                <Heart className={`h-4 w-4 mr-2 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                {isFavorited ? "Saved" : "Save"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Flag className="h-4 w-4 mr-2" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={listing.images[currentImageIndex] || "/placeholder.svg"}
                    alt={listing.title}
                    width={800}
                    height={500}
                    className="w-full h-96 object-cover rounded-t-lg"
                  />

                  {listing.images.length > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    <Camera className="h-3 w-3 inline mr-1" />
                    {currentImageIndex + 1} / {listing.images.length}
                  </div>
                </div>

                {/* Image Thumbnails */}
                {listing.images.length > 1 && (
                  <div className="p-4">
                    <div className="flex space-x-2 overflow-x-auto">
                      {listing.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-20 h-16 rounded border-2 overflow-hidden ${
                            index === currentImageIndex ? "border-blue-500" : "border-gray-200"
                          }`}
                        >
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`${listing.title} ${index + 1}`}
                            width={80}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Vehicle Details</span>
                  <Badge className="bg-green-100 text-green-800">{listing.condition}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Year</p>
                      <p className="font-medium">{listing.year}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Gauge className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Mileage</p>
                      <p className="font-medium">{safeToLocaleString(listing.mileage)} mi</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Fuel className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Fuel Type</p>
                      <p className="font-medium">{listing.fuelType}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Transmission</p>
                      <p className="font-medium">{listing.transmission}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Cog className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Body Type</p>
                      <p className="font-medium">{listing.bodyType}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-medium">{listing.location}</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Exterior Color</p>
                    <p className="font-medium capitalize">{listing.exteriorColor}</p>
                  </div>
                  {listing.interiorColor && (
                    <div>
                      <p className="text-sm text-gray-600">Interior Color</p>
                      <p className="font-medium capitalize">{listing.interiorColor}</p>
                    </div>
                  )}
                  {listing.vin && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600">VIN</p>
                      <p className="font-medium font-mono text-sm">{listing.vin}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            {listing.features && listing.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Features & Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {listing.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              </CardContent>
            </Card>

            {/* Additional Options */}
            {(listing.negotiable || listing.tradeConsidered || listing.financingAvailable) && (
              <Card>
                <CardHeader>
                  <CardTitle>Additional Options</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {listing.negotiable && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Price is negotiable</span>
                      </div>
                    )}
                    {listing.tradeConsidered && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Trade-in considered</span>
                      </div>
                    )}
                    {listing.financingAvailable && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Financing available</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price & Contact */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-blue-600">${safeToLocaleString(listing.price)}</p>
                  {listing.negotiable && <p className="text-sm text-gray-600 mt-1">Price negotiable</p>}
                </div>

                <div className="space-y-3">
                  <Button className="w-full" size="lg" onClick={() => setShowContactForm(true)}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Seller
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={listing.seller.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {listing.seller.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{listing.seller.name}</h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {listing.seller.rating} ({listing.seller.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2 text-green-500" />
                    <span>Identity verified</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Responsive seller</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  View Seller Profile
                </Button>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-blue-600" />
                  Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Meet in a public place</li>
                  <li>• Bring a friend if possible</li>
                  <li>• Inspect the vehicle thoroughly</li>
                  <li>• Verify ownership documents</li>
                  <li>• Use secure payment methods</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Contact Seller</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="contact-name">Your Name</Label>
                  <Input
                    id="contact-name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contact-phone">Phone (Optional)</Label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder={`Hi, I'm interested in your ${listing.title}. Is it still available?`}
                    rows={4}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1">
                    Send Message
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowContactForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
