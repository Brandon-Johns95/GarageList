"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  Heart,
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
  Eye,
  Reply,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"
import { ReviewForm } from "@/components/rating/review-form"
import { SellerReputation } from "@/components/rating/seller-reputation"
import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { MessagingInterface } from "@/components/messaging/messaging-interface"
import { SignInModal } from "@/components/auth/sign-in-modal"
import { SignUpModal } from "@/components/auth/sign-up-modal"

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

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
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
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [showSignUpModal, setShowSignUpModal] = useState(false)

  const incrementViewCount = async () => {
    try {
      // First get current view count
      const { data: currentListing } = await supabase.from("listings").select("view_count").eq("id", params.id).single()

      const newViewCount = (currentListing?.view_count || 0) + 1

      // Update view count in database
      await supabase.from("listings").update({ view_count: newViewCount }).eq("id", params.id)

      setViewCount(newViewCount)
    } catch (error) {
      console.error("Error updating view count:", error)
    }
  }

  const loadStatistics = async () => {
    try {
      // Load view count and favorite count
      const { data: listingStats } = await supabase
        .from("listings")
        .select("view_count, favorite_count")
        .eq("id", params.id)
        .single()

      if (listingStats) {
        setViewCount(listingStats.view_count || 0)
        setFavoriteCount(listingStats.favorite_count || 0)
      }

      // Load Q&A - Use separate queries to avoid relationship issues
      const { data: qaData } = await supabase
        .from("listing_questions")
        .select("*")
        .eq("listing_id", params.id)
        .order("created_at", { ascending: false })

      // Get user profiles for each question
      const questionsWithProfiles = []
      if (qaData && qaData.length > 0) {
        for (const question of qaData) {
          const { data: userProfile } = await supabase
            .from("user_profiles")
            .select("first_name, last_name, avatar_url")
            .eq("id", question.user_id)
            .single()

          questionsWithProfiles.push({
            ...question,
            user_profiles: userProfile,
          })
        }
      }

      setQuestions(questionsWithProfiles || [])
    } catch (error) {
      console.error("Error loading statistics:", error)
    }
  }

  const handleFavoriteToggle = async () => {
    try {
      const newFavoriteState = !isFavorited
      setIsFavorited(newFavoriteState)

      // Update favorite count
      const increment = newFavoriteState ? 1 : -1
      const newFavoriteCount = Math.max(0, favoriteCount + increment)
      setFavoriteCount(newFavoriteCount)

      // Update in database
      await supabase.from("listings").update({ favorite_count: newFavoriteCount }).eq("id", params.id)

      // In a real app, you'd also track user favorites in a separate table
    } catch (error) {
      console.error("Error updating favorite:", error)
      // Revert on error
      setIsFavorited(!isFavorited)
      setFavoriteCount(favoriteCount)
    }
  }

  const handleQuestionSubmit = async (e) => {
    e.preventDefault()
    if (!newQuestion.trim()) return

    setIsSubmittingQuestion(true)
    try {
      if (!user) {
        alert("Please sign in to ask a question")
        return
      }

      const { data, error } = await supabase
        .from("listing_questions")
        .insert({
          listing_id: listing.id,
          user_id: user.id,
          question: newQuestion.trim(),
        })
        .select("*")
        .single()

      if (error) throw error

      // Get user profile separately
      const { data: userProfile } = await supabase
        .from("user_profiles")
        .select("first_name, last_name, avatar_url")
        .eq("id", user.id)
        .single()

      const questionWithProfile = {
        ...data,
        user_profiles: userProfile,
      }

      setQuestions([questionWithProfile, ...questions])
      setNewQuestion("")
    } catch (error) {
      console.error("Error submitting question:", error)
      alert("Failed to submit question. Please try again.")
    } finally {
      setIsSubmittingQuestion(false)
    }
  }

  const handleReplySubmit = async (questionId: number) => {
    if (!replyText.trim()) return

    setIsSubmittingReply(true)
    try {
      const { error } = await supabase
        .from("listing_questions")
        .update({
          answer: replyText.trim(),
          answered_at: new Date().toISOString(),
        })
        .eq("id", questionId)

      if (error) throw error

      // Update the questions list
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, answer: replyText.trim(), answered_at: new Date().toISOString() } : q,
        ),
      )

      setReplyText("")
      setReplyingTo(null)
      alert("Reply sent successfully!")
    } catch (error) {
      console.error("Error sending reply:", error)
      alert("Failed to send reply. Please try again.")
    } finally {
      setIsSubmittingReply(false)
    }
  }

  const handleStartConversation = async () => {
    if (!user) {
      alert("Please sign in to send a message")
      return
    }

    if (!seller || !seller.id) {
      alert("Seller information not available")
      return
    }

    if (isSellerViewing) {
      alert("You cannot message yourself")
      return
    }

    setIsCreatingConversation(true)
    try {
      console.log("Creating conversation with:", {
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: seller.id,
      })

      // Check if conversation already exists
      const { data: existingConversation, error: findError } = await supabase
        .from("conversations")
        .select("*")
        .eq("listing_id", listing.id)
        .eq("buyer_id", user.id)
        .eq("seller_id", seller.id)
        .maybeSingle()

      if (findError) {
        console.error("Error finding existing conversation:", findError)
        throw new Error(`Failed to check existing conversations: ${findError.message}`)
      }

      if (existingConversation) {
        console.log("Found existing conversation:", existingConversation)
        setConversation(existingConversation)
        setShowMessaging(true)
        return
      }

      // Create new conversation
      console.log("Creating new conversation...")
      const { data: newConversation, error: createError } = await supabase
        .from("conversations")
        .insert({
          listing_id: Number.parseInt(listing.id),
          buyer_id: user.id,
          seller_id: seller.id,
          status: "active",
        })
        .select("*")
        .single()

      if (createError) {
        console.error("Error creating conversation:", createError)
        throw new Error(`Failed to create conversation: ${createError.message}`)
      }

      console.log("Created new conversation:", newConversation)
      setConversation(newConversation)
      setShowMessaging(true)
    } catch (error) {
      console.error("Error in handleStartConversation:", error)
      alert(`Failed to start conversation: ${error.message || "Unknown error"}`)
    } finally {
      setIsCreatingConversation(false)
    }
  }

  // Redirect countdown effect for broken links
  useEffect(() => {
    if (error && !listing && !isLoading) {
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            router.push("/")
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [error, listing, isLoading, router])

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
          // No rows returned
          throw new Error("Listing not found")
        } else {
          throw new Error(`Failed to load listing: ${listingError.message}`)
        }
      }

      if (!listingData) {
        throw new Error("Listing not found")
      }

      // Fetch seller information
      const { data: sellerData, error: sellerError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", listingData.seller_id)
        .single()

      if (sellerError) {
        console.error("Error loading seller:", sellerError)
        // Continue without seller data
      }

      // Transform the listing data
      const transformedListing = {
        id: listingData.id.toString(), // Ensure ID is a string for consistency
        title: listingData.title,
        price: listingData.price,
        year: listingData.year,
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
        sellerId: listingData.seller_id,
      }

      // Transform seller data
      const transformedSeller = sellerData
        ? {
            id: sellerData.id,
            name: `${sellerData.first_name || ""} ${sellerData.last_name || ""}`.trim() || "Seller",
            firstName: sellerData.first_name || "",
            lastName: sellerData.last_name || "",
            email: sellerData.email || "",
            phone: sellerData.phone || "",
            city: sellerData.city || "",
            state: sellerData.state || "",
            rating: sellerData.average_rating || 5.0,
            reviewCount: sellerData.total_reviews || 0,
            avatar: sellerData.avatar_url || "/placeholder.svg?height=40&width=40",
            memberSince: sellerData.created_at,
            isVerified: sellerData.is_verified || false,
          }
        : {
            id: "",
            name: "Seller",
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            city: "",
            state: "",
            rating: 5.0,
            reviewCount: 0,
            avatar: "/placeholder.svg?height=40&width=40",
            memberSince: new Date().toISOString(),
            isVerified: false,
          }

      setListing(transformedListing)
      setSeller(transformedSeller)
    } catch (error) {
      console.error("Error loading listing:", error)
      setError(error instanceof Error ? error.message : "Failed to load listing")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (params.id) {
      loadListing()
      incrementViewCount()
      loadStatistics()
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

  const handleCall = () => {
    if (!seller?.phone) {
      return
    }

    const phoneLink = createPhoneLink(seller.phone)
    if (phoneLink) {
      window.location.href = phoneLink
    }
  }

  const handleEmail = () => {
    if (!seller?.email) {
      return
    }

    const subject = encodeURIComponent(`Inquiry about ${listing.title}`)
    const body = encodeURIComponent(`Hi ${seller.firstName || seller.name},

I'm interested in your ${listing.title} listed for $${safeToLocaleString(listing.price)}.

Could you please provide more information?

Thank you!`)

    // Try multiple approaches for better compatibility
    const mailtoLink = `mailto:${seller.email}?subject=${subject}&body=${body}`

    try {
      // First try: Direct window.location
      window.location.href = mailtoLink
    } catch (error) {
      try {
        // Second try: Create and click a temporary link
        const tempLink = document.createElement("a")
        tempLink.href = mailtoLink
        tempLink.target = "_blank"
        tempLink.rel = "noopener noreferrer"
        document.body.appendChild(tempLink)
        tempLink.click()
        document.body.removeChild(tempLink)
      } catch (linkError) {
        // Fallback: Copy email to clipboard and show instructions
        navigator.clipboard
          .writeText(seller.email)
          .then(() => {
            alert(
              `Email address copied to clipboard: ${seller.email}\n\nPlease paste this into your email client to contact the seller about: ${listing.title}`,
            )
          })
          .catch(() => {
            // Final fallback: Show email address
            alert(`Please email the seller at: ${seller.email}\n\nRegarding: ${listing.title}`)
          })
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

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || "The listing you're looking for doesn't exist or has been removed."}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 mb-2">
              You will be automatically redirected to the homepage in {redirectCountdown} seconds.
            </p>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((5 - redirectCountdown) / 5) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="space-x-4">
            <Button asChild>
              <Link href="/">Go to Homepage Now</Link>
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Check if current user is the seller
  const isSellerViewing = user && seller && user.id === seller.id

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

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

            {/* Listing Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Listing Statistics</span>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {viewCount.toLocaleString()} views
                    </div>
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {favoriteCount.toLocaleString()} favorites
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Eye className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{viewCount.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Views</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <Heart className="h-6 w-6 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-600">{favoriteCount.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Favorites</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{questions.length}</div>
                    <div className="text-sm text-gray-600">Questions</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Calendar className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">
                      {listing.publishedAt
                        ? Math.floor((new Date() - new Date(listing.publishedAt)) / (1000 * 60 * 60 * 24))
                        : 0}
                    </div>
                    <div className="text-sm text-gray-600">Days Listed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Q&A Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Questions & Answers ({questions.length})</span>
                  <Button variant="outline" size="sm" onClick={() => setShowQA(!showQA)}>
                    {showQA ? "Hide" : "Show"} Q&A
                  </Button>
                </CardTitle>
              </CardHeader>
              {showQA && (
                <CardContent className="space-y-6">
                  {/* Ask Question Form - Only show if not the seller */}
                  {!isSellerViewing && (
                    <div className="border-b pb-4">
                      <h4 className="font-medium mb-3">Ask a Question</h4>
                      <form onSubmit={handleQuestionSubmit} className="space-y-3">
                        <Textarea
                          value={newQuestion}
                          onChange={(e) => setNewQuestion(e.target.value)}
                          placeholder="Ask the seller a question about this vehicle..."
                          rows={3}
                          maxLength={500}
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">{newQuestion.length}/500 characters</span>
                          <Button type="submit" disabled={!newQuestion.trim() || isSubmittingQuestion}>
                            {isSubmittingQuestion ? "Submitting..." : "Ask Question"}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Questions List */}
                  <div className="space-y-4">
                    {questions.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No questions yet. Be the first to ask!</p>
                      </div>
                    ) : (
                      questions.map((qa) => (
                        <div key={qa.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="h-8 w-8">
                              <Image
                                src={qa.user_profiles?.avatar_url || "/placeholder.svg"}
                                alt="User Avatar"
                                width={32}
                                height={32}
                                className="rounded-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm">
                                    {qa.user_profiles?.first_name} {qa.user_profiles?.last_name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(qa.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                {/* Reply button for sellers */}
                                {isSellerViewing && !qa.answer && (
                                  <Button variant="outline" size="sm" onClick={() => setReplyingTo(qa.id)}>
                                    <Reply className="h-4 w-4 mr-1" />
                                    Reply
                                  </Button>
                                )}
                              </div>
                              <p className="text-gray-700">{qa.question}</p>
                            </div>
                          </div>

                          {/* Reply form for sellers */}
                          {isSellerViewing && replyingTo === qa.id && (
                            <div className="ml-11 space-y-3 bg-blue-50 p-3 rounded-lg">
                              <Textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Type your reply..."
                                rows={3}
                                maxLength={500}
                              />
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">{replyText.length}/500 characters</span>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setReplyingTo(null)
                                      setReplyText("")
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleReplySubmit(qa.id)}
                                    disabled={!replyText.trim() || isSubmittingReply}
                                  >
                                    {isSubmittingReply ? "Sending..." : "Send Reply"}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Existing answer */}
                          {qa.answer && (
                            <div className="ml-11 pl-4 border-l-2 border-blue-200 bg-blue-50 rounded-r-lg p-3">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-sm text-blue-800">Seller Response</span>
                                <span className="text-xs text-blue-600">
                                  {new Date(qa.answered_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-blue-900">{qa.answer}</p>
                            </div>
                          )}

                          {!qa.answer && !isSellerViewing && (
                            <div className="ml-11 text-sm text-gray-500">Waiting for seller response...</div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              )}
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
                  <>
                    <div className="space-y-3">
                      <Button
                        className="w-full"
                        size="lg"
                        onClick={handleStartConversation}
                        disabled={isCreatingConversation || isSellerViewing}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        {isCreatingConversation ? "Starting..." : "Message Seller"}
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => setShowContactForm(true)}>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCall}
                          disabled={!seller?.phone}
                          title={
                            seller?.phone ? `Call ${formatPhoneNumber(seller.phone)}` : "Phone number not available"
                          }
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleEmail}
                          disabled={!seller?.email}
                          title={seller?.email ? `Email ${seller.email}` : "Email not available"}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </Button>
                      </div>
                    </div>

                    {/* Contact Info Display - Only for signed in users */}
                    {(seller?.phone || seller?.email) && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
                        {seller.phone && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{formatPhoneNumber(seller.phone)}</span>
                          </div>
                        )}
                        {seller.email && (
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium text-xs">{seller.email}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">Sign in to contact the seller</p>
                    <Button onClick={() => setShowSignInModal(true)} className="w-full bg-blue-600 hover:bg-blue-700">
                      Contact Seller
                    </Button>
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
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-12 w-12">
                    <Image
                      src={seller?.avatar || "/placeholder.svg"}
                      alt="Seller Avatar"
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{seller?.name || "Seller"}</h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">
                        {seller?.rating || 5.0} ({seller?.reviewCount || 0} reviews)
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
                  {seller?.isVerified && (
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-green-500" />
                      <span>Identity verified</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                    <span>Responsive seller</span>
                  </div>
                  {seller?.memberSince && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Member since {new Date(seller.memberSince).getFullYear()}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href={`/seller/${seller?.id}`}>View Seller Profile</Link>
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setShowReviewForm(true)}>
                    <Star className="h-4 w-4 mr-2" />
                    Write Review
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seller Reputation */}
            <SellerReputation sellerId={seller?.id || ""} />

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

      {/* Review Form Modal */}
      {showReviewForm && seller && (
        <ReviewForm
          sellerId={seller.id}
          sellerName={seller.name}
          listingId={listing.id}
          listingTitle={listing.title}
          onClose={() => setShowReviewForm(false)}
          onSubmit={() => {
            // Refresh the page or update the reviews
            window.location.reload()
          }}
        />
      )}

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

      {/* Messaging Modal */}
      {showMessaging && conversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Image
                    src={seller?.avatar || "/placeholder.svg"}
                    alt="Seller Avatar"
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <div>
                    <CardTitle className="text-lg">Message {seller?.name}</CardTitle>
                    <p className="text-sm text-gray-600">About: {listing.title}</p>
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setShowMessaging(false)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <MessagingInterface
                conversationId={conversation.id}
                currentUserId={user.id}
                otherUser={seller}
                listing={listing}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sign-in/Sign-up Modals */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSwitchToSignUp={() => {
          setShowSignInModal(false)
          setShowSignUpModal(true)
        }}
      />
      <SignUpModal
        isOpen={showSignUpModal}
        onClose={() => setShowSignUpModal(false)}
        onSwitchToSignIn={() => {
          setShowSignUpModal(false)
          setShowSignInModal(true)
        }}
      />
    </div>
  )
}
