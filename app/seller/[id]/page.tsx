"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Star,
  Shield,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Car,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertTriangle,
  Grid,
  List,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { GarageListLogo } from "@/components/garage-list-logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { SellerReputation } from "@/components/rating/seller-reputation"
import { ReviewsList } from "@/components/rating/reviews-list"
import { ReviewForm } from "@/components/rating/review-form"
import { SellerReputationCompact } from "@/components/rating/seller-reputation-compact"

interface SellerProfile {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  state: string
  avatar: string
  memberSince: string
  isVerified: boolean
  bio: string
  businessName: string
  businessType: string
}

interface SellerListing {
  id: number
  title: string
  price: number
  year: number
  mileage: number
  location: string
  condition: string
  vehicleCategory: string
  mainPhoto: string
  publishedAt: string
  status: string
}

interface SellerStats {
  totalListings: number
  activeListings: number
  soldListings: number
  avgResponseTime: number
  responseRate: number
  joinDate: string
}

export default function SellerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [seller, setSeller] = useState<SellerProfile | null>(null)
  const [listings, setListings] = useState<SellerListing[]>([])
  const [stats, setStats] = useState<SellerStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [listingsView, setListingsView] = useState<"grid" | "list">("grid")
  const [listingsFilter, setListingsFilter] = useState("all")
  const [listingsSort, setListingsSort] = useState("newest")
  const [redirectCountdown, setRedirectCountdown] = useState(5)

  useEffect(() => {
    if (params.id) {
      loadSellerProfile()
    }
  }, [params.id])

  // Redirect countdown effect for broken links
  useEffect(() => {
    if (error && !seller && !isLoading) {
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
  }, [error, seller, isLoading, router])

  const loadSellerProfile = async () => {
    try {
      setIsLoading(true)
      setError("")

      // Validate ID format
      if (!params.id || typeof params.id !== "string") {
        throw new Error("Invalid seller ID")
      }

      // Fetch seller profile
      const { data: sellerData, error: sellerError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", params.id)
        .single()

      if (sellerError) {
        if (sellerError.code === "PGRST116") {
          throw new Error("Seller not found")
        } else {
          throw new Error(`Failed to load seller: ${sellerError.message}`)
        }
      }

      if (!sellerData) {
        throw new Error("Seller not found")
      }

      // Fetch seller's reputation
      const { data: reputationData } = await supabase
        .from("seller_reputation")
        .select("*")
        .eq("seller_id", params.id)
        .single()

      // Fetch seller's listings with photos
      const { data: listingsData, error: listingsError } = await supabase
        .from("listings")
        .select(`
        id,
        title,
        price,
        year,
        make,
        model,
        mileage,
        location,
        condition,
        vehicle_category,
        published_at,
        listing_photos (
          photo_url,
          is_main_photo
        )
      `)
        .eq("seller_id", params.id)
        .order("published_at", { ascending: false })

      if (listingsError) {
        console.error("Error loading listings:", listingsError)
        // Continue without listings
      }

      // Transform seller data
      const transformedSeller: SellerProfile = {
        id: sellerData.id,
        name: `${sellerData.first_name || ""} ${sellerData.last_name || ""}`.trim() || "Seller",
        firstName: sellerData.first_name || "",
        lastName: sellerData.last_name || "",
        email: sellerData.email || "",
        phone: sellerData.phone || "",
        city: sellerData.city || "",
        state: sellerData.state || "",
        avatar: sellerData.avatar_url || "/placeholder.svg?height=120&width=120",
        memberSince: sellerData.created_at,
        isVerified: sellerData.is_verified || false,
        bio: sellerData.bio || "",
        businessName: sellerData.business_name || "",
        businessType: sellerData.business_type || "",
      }

      // Transform listings data
      const transformedListings: SellerListing[] =
        listingsData?.map((listing) => ({
          id: listing.id,
          title: listing.title,
          price: listing.price,
          year: listing.year,
          mileage: listing.mileage,
          location: listing.location,
          condition: listing.condition,
          vehicleCategory: listing.vehicle_category,
          mainPhoto:
            listing.listing_photos?.find((p) => p.is_main_photo)?.photo_url ||
            listing.listing_photos?.[0]?.photo_url ||
            "/placeholder.svg?height=200&width=300",
          publishedAt: listing.published_at,
          status: "active", // Default to active since status column doesn't exist
        })) || []

      // Calculate stats
      const totalListings = transformedListings.length
      const activeListings = transformedListings.length // All listings are considered active
      const soldListings = 0 // No sold listings since we don't have status column

      const transformedStats: SellerStats = {
        totalListings,
        activeListings,
        soldListings,
        avgResponseTime: reputationData?.response_time_hours || 24,
        responseRate: reputationData?.response_rate || 0,
        joinDate: sellerData.created_at,
      }

      setSeller(transformedSeller)
      setListings(transformedListings)
      setStats(transformedStats)
    } catch (error) {
      console.error("Error loading seller profile:", error)
      setError(error instanceof Error ? error.message : "Failed to load seller profile")
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return ""
    const cleaned = phone.replace(/\D/g, "")
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const handleCall = () => {
    if (!seller?.phone) {
      return
    }
    const phoneLink = `tel:${seller.phone.replace(/[^\d+]/g, "")}`
    window.location.href = phoneLink
  }

  const handleEmail = () => {
    if (!seller?.email) {
      return
    }

    const subject = encodeURIComponent(`Inquiry about your vehicle listing - GarageList`)
    const body = encodeURIComponent(`Hi ${seller.firstName || seller.name},

I found your profile on GarageList and I'm interested in learning more about your vehicle listings.

Could you please provide more details about any available vehicles you have for sale?

Thank you for your time!

Best regards`)

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
              `Email address copied to clipboard: ${seller.email}\n\nPlease paste this into your email client to contact the seller.`,
            )
          })
          .catch(() => {
            // Final fallback: Show email address
            alert(`Please email the seller at: ${seller.email}`)
          })
      }
    }
  }

  const filteredListings = listings.filter((listing) => {
    if (listingsFilter === "all") return true
    if (listingsFilter === "active") return listing.status === "active"
    if (listingsFilter === "sold") return listing.status === "sold"
    return listing.vehicleCategory === listingsFilter
  })

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (listingsSort) {
      case "newest":
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      case "oldest":
        return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "mileage-low":
        return a.mileage - b.mileage
      case "mileage-high":
        return b.mileage - a.mileage
      default:
        return 0
    }
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seller profile...</p>
        </div>
      </div>
    )
  }

  if (error || !seller) {
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
              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Seller Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || "The seller profile you're looking for doesn't exist or has been removed."}
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
                Back
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Seller Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              <Avatar className="h-32 w-32">
                <AvatarImage src={seller.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">
                  {seller.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{seller.name}</h1>
                    {seller.businessName && <p className="text-lg text-gray-600 mb-2">{seller.businessName}</p>}

                    {/* Add seller rating display here */}
                    <div className="mb-3">
                      <SellerReputationCompact sellerId={seller.id} />
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {seller.city && seller.state && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {seller.city}, {seller.state}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Member since {new Date(seller.memberSince).getFullYear()}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4 sm:mt-0">
                    <Button onClick={() => setShowReviewForm(true)}>
                      <Star className="h-4 w-4 mr-2" />
                      Write Review
                    </Button>
                    <Button variant="outline" onClick={handleCall} disabled={!seller.phone}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" onClick={handleEmail} disabled={!seller.email}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {seller.isVerified && (
                    <Badge className="bg-green-100 text-green-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified Seller
                    </Badge>
                  )}
                  {seller.businessType && (
                    <Badge variant="secondary">
                      <Award className="h-3 w-3 mr-1" />
                      {seller.businessType}
                    </Badge>
                  )}
                  {stats && stats.responseRate >= 90 && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Responsive Seller
                    </Badge>
                  )}
                </div>

                {seller.bio && <p className="text-gray-700 leading-relaxed">{seller.bio}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Car className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.totalListings}</p>
                <p className="text-sm text-gray-600">Total Listings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
                <p className="text-sm text-gray-600">Active Listings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.soldListings}</p>
                <p className="text-sm text-gray-600">Sold</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{stats.avgResponseTime}h</p>
                <p className="text-sm text-gray-600">Avg Response</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listings">Listings ({listings.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="reputation">Reputation</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-6">
            {/* Listings Controls */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <Select value={listingsFilter} onValueChange={setListingsFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Listings</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="cars">Cars</SelectItem>
                        <SelectItem value="trucks">Trucks</SelectItem>
                        <SelectItem value="motorcycles">Motorcycles</SelectItem>
                        <SelectItem value="rvs">RVs</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={listingsSort} onValueChange={setListingsSort}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="mileage-low">Mileage: Low to High</SelectItem>
                        <SelectItem value="mileage-high">Mileage: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant={listingsView === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setListingsView("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={listingsView === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setListingsView("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Listings Grid/List */}
            {sortedListings.length > 0 ? (
              <div
                className={
                  listingsView === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"
                }
              >
                {sortedListings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <Link href={`/listing/${listing.id}`}>
                      <div className={listingsView === "grid" ? "" : "flex"}>
                        <div className={listingsView === "grid" ? "aspect-video" : "w-48 h-32 flex-shrink-0"}>
                          <Image
                            src={listing.mainPhoto || "/placeholder.svg"}
                            alt={listing.title}
                            width={listingsView === "grid" ? 400 : 200}
                            height={listingsView === "grid" ? 250 : 130}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className={`p-4 ${listingsView === "list" ? "flex-1" : ""}`}>
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg line-clamp-2">{listing.title}</h3>
                            <Badge
                              className={
                                listing.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : listing.status === "sold"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                              }
                            >
                              {listing.status}
                            </Badge>
                          </div>
                          <p className="text-2xl font-bold text-blue-600 mb-2">${listing.price.toLocaleString()}</p>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              {listing.year} • {listing.mileage.toLocaleString()} miles
                            </p>
                            <p className="capitalize">{listing.vehicleCategory}</p>
                            {listing.location && <p>{listing.location}</p>}
                            <p className="capitalize">{listing.condition} condition</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Listed {new Date(listing.publishedAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
                  <p className="text-gray-600">
                    {listingsFilter === "all"
                      ? "This seller hasn't posted any listings yet."
                      : "No listings match the selected filter."}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            <ReviewsList sellerId={seller.id} />
          </TabsContent>

          <TabsContent value="reputation">
            <SellerReputation sellerId={seller.id} showDetailed={true} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          sellerId={seller.id}
          sellerName={seller.name}
          onClose={() => setShowReviewForm(false)}
          onSubmit={() => {
            setShowReviewForm(false)
            // Refresh reviews
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
