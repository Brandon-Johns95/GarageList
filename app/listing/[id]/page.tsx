"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import {
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
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { supabase } from "@/lib/supabase"
import { SellerReputation } from "@/components/rating/seller-reputation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import React from "react"
import ErrorBoundary from "@/components/error-boundary" // Import ErrorBoundary component

// Helper function to safely format numbers
const safeToLocaleString = (value: any): string => {
  const num = Number(value)
  return !isNaN(num) && isFinite(num) ? num.toLocaleString() : "0"
}

// Helper function to safely get string values
const safeString = (value: any): string => {
  return value && typeof value === "string" ? value : ""
}

// Helper function to format phone number for display
const formatPhoneNumber = (phone: string): string => {
  if (!phone) return ""

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, "")

  // Format as (XXX) XXX-XXXX for US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }

  // Return original if not a standard format
  return phone
}

// Helper function to create phone call link
const createPhoneLink = (phone: string): string => {
  if (!phone) return ""

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, "")
  return `tel:${cleaned}`
}

// Helper function to extract make from title
const extractMakeFromTitle = (title: string): string => {
  if (!title) return "Unknown"
  const parts = title.split(" ")
  // Assuming format like "2020 Honda Civic" - make is the second part
  return parts[1] || "Unknown"
}

// Helper function to extract model from title
const extractModelFromTitle = (title: string): string => {
  if (!title) return "Unknown"
  const parts = title.split(" ")
  // Everything after year and make
  return parts.slice(2).join(" ") || "Unknown"
}

const ListingDetailPageContent = React.memo(function ListingDetailPageContent() {
  // ========================= HOOKS =========================
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()

  // ========================= STATE =========================
  const [listing, setListing] = useState(null)
  const [seller, setSeller] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isFavorited, setIsFavorited] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactMessage, setContactMessage] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [redirectCountdown, setRedirectCountdown] = useState(5)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [viewCount, setViewCount] = useState(0)
  const [favoriteCount, setFavoriteCount] = useState(0)
  const [showQA, setShowQA] = useState(false)
  const [questions, setQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState("")
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [showMessaging, setShowMessaging] = useState(false)
  const [conversation, setConversation] = useState(null)
  const [isCreatingConversation, setIsCreatingConversation] = useState(false)

  // ========================= DATA FETCHING =========================
  const loadListing = async () => {
    try {
      setIsLoading(true)
      setError("")

      // Validate ID format
      if (!params.id || typeof params.id !== "string") {
        throw new Error("Invalid listing ID")
      }

      // Fetch listing with photos and features
      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select(`
         *,
         listing_photos (
           photo_url,
           is_main_photo,
           sort_order
         ),
         listing_features (
           feature_name
         )
       `)
        .eq("id", params.id)
        .single()

      if (listingError) {
        if (listingError.code === "PGRST116") {
          throw new Error("Listing not found")
        } else {
          throw new Error(`Failed to load listing: ${listingError.message}`)
        }
      }

      if (!listingData) {
        throw new Error("Listing not found")
      }

      // Fetch seller information using seller_id or user_id
      const sellerId = listingData.seller_id || listingData.user_id
      if (sellerId) {
        const { data: sellerData, error: sellerError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("id", sellerId)
          .single()

        if (sellerError) {
          console.error("Error loading seller:", sellerError)
          // Continue without seller data
        } else {
          setSeller(sellerData)
        }
      }

      // Transform the listing data
      const transformedListing = {
        id: listingData.id.toString(),
        title: listingData.title,
        price: listingData.price,
        year: listingData.year,
        make: listingData.make || extractMakeFromTitle(listingData.title),
        model: listingData.model || extractModelFromTitle(listingData.title),
        mileage: listingData.mileage,
        location: listingData.location,
        images: listingData.listing_photos
          ?.sort((a, b) => a.sort_order - b.sort_order)
          ?.map((photo) => photo.photo_url) || ["/placeholder.svg?height=400&width=600"],
        features: listingData.listing_features?.map((feature) => feature.feature_name) || [],
        fuelType: listingData.fuel_type || "Gasoline",
        transmission: listingData.transmission || "Automatic",
        bodyType: listingData.body_type || "Sedan",
        condition: listingData.condition || "Good",
        description: listingData.description || "No description provided.",
        exteriorColor: listingData.exterior_color || "Unknown",
        interiorColor: listingData.interior_color || "Unknown",
        vin: listingData.vin || "",
        negotiable: Boolean(listingData.negotiable),
        tradeConsidered: Boolean(listingData.trade_considered),
        financingAvailable: Boolean(listingData.financing_available),
        publishedAt: listingData.published_at,
        sellerId: sellerId,
        trim: listingData.trim || "",
        tradePreferences:
          typeof listingData.trade_preferences === "string"
            ? listingData.trade_preferences
            : listingData.trade_preferences
              ? JSON.stringify(listingData.trade_preferences)
              : "",
      }

      setListing(transformedListing)
    } catch (error) {
      console.error("Error loading listing:", error)
      setError(error instanceof Error ? error.message : "Failed to load listing")
    } finally {
      setIsLoading(false)
    }
  }

  // ========================= SIDE EFFECTS =========================
  useEffect(() => {
    if (params.id) {
      loadListing()
    }
  }, [params.id])

  // ========================= MEMOIZED VALUES =========================
  const isSellerViewing = useMemo(() => user && seller && user.id === seller.id, [user, seller])

  // ========================= HANDLERS =========================
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

  const handleStartConversation = async () => {
    if (!user || !listing?.sellerId) return

    setIsCreatingConversation(true)
    try {
      // Check if a conversation already exists between the current user and the seller
      const { data: existingConversation, error: existingConversationError } = await supabase
        .from("conversations")
        .select("*")
        .eq("listing_id", listing.id)
        .eq("buyer_id", user.id)
        .eq("seller_id", listing.sellerId)
        .limit(1)
        .single()

      if (existingConversationError && existingConversationError.code !== "PGRST116") {
        console.error("Error checking for existing conversation:", existingConversationError)
        // Handle error appropriately, maybe show a message to the user
        return
      }

      if (existingConversation) {
        // Conversation already exists, redirect to messages page
        router.push("/messages")
        return
      }

      // No existing conversation, create a new one
      const { data: newConversation, error: newConversationError } = await supabase
        .from("conversations")
        .insert([
          {
            buyer_id: user.id,
            seller_id: listing.sellerId,
            listing_id: listing.id,
            status: "active",
          },
        ])
        .select()
        .single()

      if (newConversationError) {
        console.error("Error creating conversation:", newConversationError)
        alert("Failed to start conversation. Please try again.")
        return
      }

      // Redirect to messages page where the new conversation will appear
      router.push("/messages")
    } finally {
      setIsCreatingConversation(false)
    }
  }

  // ========================= RENDER =========================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading listing...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || "The listing you're looking for doesn't exist or has been removed."}
          </p>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/">Go to Homepage</Link>
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
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
                  <Cog className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Make</p>
                    <p className="font-medium">{listing.make}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Cog className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Model</p>
                    <p className="font-medium">{listing.model}</p>
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

              {user ? (
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleStartConversation}
                    disabled={isCreatingConversation || isSellerViewing}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {isCreatingConversation ? "Starting..." : isSellerViewing ? "Your Listing" : "Message Seller"}
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!seller?.phone}
                      title={seller?.phone ? `Call ${formatPhoneNumber(seller.phone)}` : "Phone number not available"}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!seller?.email}
                      title={seller?.email ? `Email ${seller.email}` : "Email not available"}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-blue-800 font-medium mb-2">Sign in to contact seller</p>
                  <p className="text-blue-600 text-sm">
                    Create an account or sign in to message, call, or email the seller
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent>
              {seller ? (
                <>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-12 w-12">
                      <Image
                        src={seller?.avatar_url || "/placeholder.svg"}
                        alt="Seller Avatar"
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {seller?.first_name && seller?.last_name
                          ? `${seller.first_name} ${seller.last_name}`
                          : seller?.business_name || "Seller"}
                      </h3>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-600">
                          {seller?.average_rating || 5.0} ({seller?.total_reviews || 0} reviews)
                        </span>
                      </div>
                      {seller?.city && seller?.state && (
                        <p className="text-sm text-gray-600">
                          {seller.city}, {seller.state}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    {seller?.is_verified && (
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-green-500" />
                        <span>Identity verified</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      <span>Responsive seller</span>
                    </div>
                    {seller?.created_at && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Member since {new Date(seller.created_at).getFullYear()}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full mt-4" asChild>
                      <Link href={`/seller/${seller?.id}`}>View Seller Profile</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <p className="text-blue-800 font-medium mb-2">Seller information protected</p>
                  <p className="text-blue-600 text-sm">
                    Sign in to view seller details, ratings, and contact information
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seller Reputation */}
          {listing.sellerId && <SellerReputation sellerId={listing.sellerId} />}

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
  )
})

function ListingDetailPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <ErrorBoundary>
        <ListingDetailPageContent />
      </ErrorBoundary>
    </div>
  )
}

export default ListingDetailPage
