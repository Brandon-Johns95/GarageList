"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, Edit, Trash2, Calendar, MapPin, Phone, UserIcon, Car, Truck, Bike, Ship } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { GarageListLogo } from "@/components/garage-list-logo"
import { FavoritesSection } from "@/components/favorites/favorites-section"

interface Listing {
  id: number
  title: string
  price: number
  year: number
  mileage: number
  condition: string
  vehicle_category: string
  body_type: string
  fuel_type: string
  transmission: string
  exterior_color: string
  interior_color: string
  description: string
  negotiable: boolean
  trade_considered: boolean
  financing_available: boolean
  status: string | null
  sold_at: string | null
  created_at: string
  updated_at: string
  published_at: string
  expires_at: string
  listing_photos: { photo_url: string; is_main_photo: boolean }[]
}

interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  avatar_url: string | null
  bio: string | null
  rating: number
  review_count: number
  member_since: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

const categoryIcons = {
  cars: Car,
  trucks: Truck,
  motorcycles: Bike,
  rvs: Ship,
  boats: Ship,
  atvs: Bike,
  commercial: Truck,
}

export default function Dashboard() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [conditionFilter, setConditionFilter] = useState("all")
  const router = useRouter()

  const [statusUpdateLoading, setStatusUpdateLoading] = useState<number | null>(null)

  useEffect(() => {
    checkUser()
    fetchListings()
  }, [])

  useEffect(() => {
    filterListings()
  }, [listings, searchTerm, statusFilter, categoryFilter, conditionFilter])

  const checkUser = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      router.push("/")
      return
    }

    // Fetch user profile
    const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", authUser.id).single()

    if (profile) {
      setUser({
        id: profile.id,
        email: authUser.email || "",
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        city: profile.city,
        state: profile.state,
        zip_code: profile.zip_code,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        rating: profile.rating || 5.0,
        review_count: profile.review_count || 0,
        member_since: profile.member_since || profile.created_at,
        is_verified: profile.is_verified || false,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      })
    }
  }

  const fetchListings = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) return

    const { data, error } = await supabase
      .from("listings")
      .select(`
        *,
        listing_photos (
          photo_url,
          is_main_photo
        )
      `)
      .eq("seller_id", authUser.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching listings:", error)
    } else {
      setListings(data || [])
    }
    setLoading(false)
  }

  const filterListings = () => {
    let filtered = listings

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.vehicle_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.body_type.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((listing) => {
        const status = getListingStatus(listing)
        return status === statusFilter
      })
    }

    // Category filter - Updated to include all categories
    if (categoryFilter !== "all") {
      filtered = filtered.filter((listing) => listing.vehicle_category.toLowerCase() === categoryFilter.toLowerCase())
    }

    // Condition filter
    if (conditionFilter !== "all") {
      filtered = filtered.filter((listing) => listing.condition.toLowerCase() === conditionFilter.toLowerCase())
    }

    setFilteredListings(filtered)
  }

  const deleteListing = async (id: number) => {
    if (!confirm("Are you sure you want to delete this listing?")) return

    const { error } = await supabase.from("listings").delete().eq("id", id)

    if (error) {
      console.error("Error deleting listing:", error)
    } else {
      fetchListings()
    }
  }

  const updateListingStatus = async (listingId: number, newStatus: string) => {
    setStatusUpdateLoading(listingId)

    try {
      const updates: any = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      }

      // If marking as sold, set sold_at timestamp
      if (newStatus === "sold") {
        updates.sold_at = new Date().toISOString()
      }

      const { error } = await supabase.from("listings").update(updates).eq("id", listingId).eq("seller_id", user?.id)

      if (error) throw error

      // Refresh listings to show updated status
      fetchListings()
    } catch (error) {
      console.error("Error updating listing status:", error)
      alert("Failed to update listing status")
    } finally {
      setStatusUpdateLoading(null)
    }
  }

  const getListingStatus = (listing: Listing) => {
    // Check if listing has a manual status set
    if (listing.status) {
      return listing.status
    }

    // Fall back to time-based status
    if (!listing.published_at) return "draft"
    const now = new Date()
    const expiresAt = new Date(listing.expires_at)
    return expiresAt > now ? "active" : "expired"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "sold":
        return <Badge className="bg-blue-100 text-blue-800">Sold</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "draft":
        return <Badge variant="secondary">Draft</Badge>
      case "expired":
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    const IconComponent = categoryIcons[category.toLowerCase() as keyof typeof categoryIcons] || Car
    return <IconComponent className="h-4 w-4" />
  }

  const stats = {
    total: listings.length,
    active: listings.filter((l) => getListingStatus(l) === "active").length,
    sold: listings.filter((l) => getListingStatus(l) === "sold").length,
    pending: listings.filter((l) => getListingStatus(l) === "pending").length,
    draft: listings.filter((l) => getListingStatus(l) === "draft").length,
    expired: listings.filter((l) => getListingStatus(l) === "expired").length,
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <GarageListLogo />
                <span className="text-2xl font-bold text-blue-600">GarageList</span>
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-700 hover:text-blue-600">
                  Buy
                </Link>
                <Link href="/sell" className="text-gray-700 hover:text-blue-600">
                  Sell
                </Link>
                <Link href="/dashboard" className="text-blue-600 font-medium">
                  Dashboard
                </Link>
                <Link href="/messages" className="text-gray-700 hover:text-blue-600">
                  Messages
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {/* Add notification bell */}
              <NotificationBell />
              <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user?.first_name || "User"}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage src={user?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {user?.first_name && user?.last_name
                        ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
                        : user?.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/")}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {user?.first_name || "User"}</p>
          </div>
          <Link href="/sell">
            <Button>Create New Listing</Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sold</CardTitle>
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.sold}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.expired}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="listings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="listings" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Input
                    placeholder="Search listings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="cars">Cars</SelectItem>
                      <SelectItem value="trucks">Trucks</SelectItem>
                      <SelectItem value="motorcycles">Motorcycles</SelectItem>
                      <SelectItem value="rvs">RVs</SelectItem>
                      <SelectItem value="boats">Boats</SelectItem>
                      <SelectItem value="atvs">ATVs</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={conditionFilter} onValueChange={setConditionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Conditions</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                      setCategoryFilter("all")
                      setConditionFilter("all")
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Listings Grid */}
            {filteredListings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {listings.length === 0 ? "No listings yet" : "No listings match your filters"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {listings.length === 0
                      ? "Create your first listing to get started selling your vehicle."
                      : "Try adjusting your search criteria or clearing the filters."}
                  </p>
                  {listings.length === 0 && (
                    <Link href="/sell">
                      <Button>Create Your First Listing</Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => {
                  const mainPhoto = listing.listing_photos?.find((p) => p.is_main_photo)?.photo_url
                  const status = getListingStatus(listing)

                  return (
                    <Card key={listing.id} className="overflow-hidden">
                      <div className="aspect-video relative bg-gray-100">
                        {mainPhoto ? (
                          <img
                            src={mainPhoto || "/placeholder.svg"}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {getCategoryIcon(listing.vehicle_category)}
                          </div>
                        )}
                        <div className="absolute top-2 right-2">{getStatusBadge(status)}</div>
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(listing.vehicle_category)}
                          <span className="text-sm text-gray-600 capitalize">{listing.vehicle_category}</span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{listing.title}</h3>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-green-600">${listing.price.toLocaleString()}</span>
                          <div className="text-sm text-gray-500">
                            {listing.year} • {listing.mileage?.toLocaleString()} mi
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/listing/${listing.id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>

                          {status !== "sold" && (
                            <Link href={`/sell/edit/${listing.id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full">
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                          )}

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" disabled={statusUpdateLoading === listing.id}>
                                {statusUpdateLoading === listing.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                ) : (
                                  "Status"
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {status !== "active" && (
                                <DropdownMenuItem onClick={() => updateListingStatus(listing.id, "active")}>
                                  Mark as Active
                                </DropdownMenuItem>
                              )}
                              {status !== "pending" && (
                                <DropdownMenuItem onClick={() => updateListingStatus(listing.id, "pending")}>
                                  Mark as Pending
                                </DropdownMenuItem>
                              )}
                              {status !== "sold" && (
                                <DropdownMenuItem onClick={() => updateListingStatus(listing.id, "sold")}>
                                  Mark as Sold
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => deleteListing(listing.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            <FavoritesSection />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url || "/placeholder.svg"}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">
                        {user?.first_name || user?.last_name
                          ? `${user?.first_name || ""} ${user?.last_name || ""}`.trim()
                          : "No name set"}
                      </h3>
                      <p className="text-gray-600">{user?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{user?.phone || "No phone number"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>
                        {user?.city && user?.state
                          ? `${user.city}, ${user.state}`
                          : user?.city || user?.state || "No location set"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Member since {new Date(user?.created_at || "").toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link href="/profile">
                    <Button className="w-full">Edit Profile</Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                      <div className="text-sm text-gray-600">Total Listings</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.active}</div>
                      <div className="text-sm text-gray-600">Active Listings</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Profile Completion</span>
                      <span className="font-semibold">
                        {Math.round(
                          (((user?.first_name ? 1 : 0) +
                            (user?.last_name ? 1 : 0) +
                            (user?.phone ? 1 : 0) +
                            (user?.city && user?.state ? 1 : 0) +
                            (user?.avatar_url ? 1 : 0)) /
                            5) *
                            100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.round(
                            (((user?.first_name ? 1 : 0) +
                              (user?.last_name ? 1 : 0) +
                              (user?.phone ? 1 : 0) +
                              (user?.city && user?.state ? 1 : 0) +
                              (user?.avatar_url ? 1 : 0)) /
                              5) *
                              100,
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
