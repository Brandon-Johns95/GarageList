"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Calendar, Gauge, Fuel, Users, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { LocationSelector } from "@/components/location-selector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"

import { useAuth } from "@/lib/auth-context"
import { useLocation } from "@/lib/location-context"
import { SignInModal } from "@/components/auth/sign-in-modal"
import { SignUpModal } from "@/components/auth/sign-up-modal"
import { VehiclePreferenceSelector } from "@/components/vehicle-preference-selector"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { GarageListLogo } from "@/components/garage-list-logo"
import { FavoriteButton } from "@/components/favorites/favorite-button"

// Helper function to safely format numbers
const safeToLocaleString = (value: any): string => {
  const num = Number(value)
  return !isNaN(num) && isFinite(num) ? num.toLocaleString() : "0"
}

// Helper function to safely get string values
const safeString = (value: any): string => {
  return value && typeof value === "string" ? value : ""
}

const bodyTypes = [
  { value: "any", label: "Any Type" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "pickup", label: "Pickup" },
  { value: "coupe", label: "Coupe" },
  { value: "hatchback", label: "Hatchback" },
  { value: "rv-trailer", label: "RVs/Travel Trailers" },
  { value: "motorcycle", label: "Motorcycle" },
  { value: "boat", label: "Boat" },
  { value: "atv", label: "ATV" },
]

export default function CarMarketplace() {
  const {
    selectedLocation,
    setSelectedLocation,
    hasSelectedLocation,
    vehiclePreferences,
    setVehiclePreferences,
    hasSelectedPreferences,
  } = useLocation()
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [showVehiclePreferences, setShowVehiclePreferences] = useState(!hasSelectedPreferences && hasSelectedLocation)

  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState([0, 500000])
  const [selectedMake, setSelectedMake] = useState("any")
  const [selectedBodyType, setSelectedBodyType] = useState("any")
  const [showFilters, setShowFilters] = useState(false)
  const [carListings, setCarListings] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [sortBy, setSortBy] = useState("newest")

  const { user, profile, signOut } = useAuth()
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

  const [distanceRadius, setDistanceRadius] = useState(25) // miles
  const [userLocation, setUserLocation] = useState(null)

  // Load listings when component mounts or location changes
  useEffect(() => {
    loadListings()
  }, [selectedLocation, vehiclePreferences])

  const handleLocationSelect = (state: string, city: string) => {
    setSelectedLocation({ state, city })
    setShowLocationSelector(false)
    if (!hasSelectedPreferences) {
      setShowVehiclePreferences(true)
    }
  }

  const handleSkipLocation = () => {
    setSelectedLocation(null)
    setShowLocationSelector(false)
  }

  const handleChangeLocation = () => {
    setShowLocationSelector(true)
  }

  const handleVehiclePreferencesSelect = (preferences: any) => {
    setVehiclePreferences(preferences)
    setShowVehiclePreferences(false)
  }

  const handleSkipPreferences = () => {
    setShowVehiclePreferences(false)
  }

  const handleChangePreferences = () => {
    setShowVehiclePreferences(true)
  }

  const loadListings = async () => {
    try {
      setIsLoading(true)
      setError("")

      // Fetch listings with photos and features only
      let query = supabase
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
        .or("status.eq.active,status.eq.pending,status.is.null")
        .not("status", "eq", "sold")
        .not("status", "eq", "draft")
        .not("status", "eq", "expired")
        .not("published_at", "is", null)

      // Filter by location if selected
      if (selectedLocation && selectedLocation.state !== "Current Location") {
        query = query.or(`location.ilike.%${selectedLocation.city}%,location.ilike.%${selectedLocation.state}%`)
      }

      const { data: listings, error: listingsError } = await query.order("created_at", { ascending: false }).limit(50)

      if (listingsError) {
        throw new Error(`Failed to load listings: ${listingsError.message}`)
      }

      // Get unique user IDs from listings
      const userIds = [...new Set(listings?.map((listing) => listing.user_id).filter(Boolean))]

      // Fetch all user profiles in a single query - try 'profiles' table instead
      const { data: userProfiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url, phone")
        .in("id", userIds)

      // Create a map for quick profile lookup
      const profileMap = new Map()
      userProfiles?.forEach((profile) => {
        profileMap.set(profile.id, profile)
      })

      // Transform the data with the user profiles
      const transformedListings =
        listings?.map((listing) => {
          const userProfile = profileMap.get(listing.user_id)

          return {
            id: listing.id,
            title: listing.title,
            price: listing.price,
            year: listing.year,
            mileage: listing.mileage,
            location: listing.location,
            status: listing.status,
            vehicleCategory: listing.vehicle_category || "cars",
            images: listing.listing_photos
              ?.sort((a, b) => a.sort_order - b.sort_order)
              ?.map((photo) => photo.photo_url) || ["/placeholder.svg?height=200&width=300"],
            seller: {
              id: listing.user_id,
              name: userProfile
                ? `${userProfile.first_name || ""} ${userProfile.last_name || ""}`.trim() || "Anonymous Seller"
                : "Anonymous Seller",
              rating: 0, // Default since we removed non-existent columns
              reviews: 0, // Default since we removed non-existent columns
              avatar: userProfile?.avatar_url || "/placeholder.svg?height=40&width=40",
              phone: userProfile?.phone,
            },
            features: listing.listing_features?.map((feature) => feature.feature_name) || [],
            fuelType: listing.fuel_type || "Gasoline",
            transmission: listing.transmission || "Automatic",
            bodyType: listing.body_type || "Sedan",
            condition: listing.condition || "Good",
            description: listing.description || "",
            exteriorColor: listing.exterior_color || "",
            interiorColor: listing.interior_color || "",
            vin: listing.vin || "",
            negotiable: listing.negotiable || false,
            tradeConsidered: listing.trade_considered || false,
            financingAvailable: listing.financing_available || false,
            publishedAt: listing.published_at,
          }
        }) || []

      setCarListings(transformedListings)
    } catch (error) {
      console.error("Error loading listings:", error)
      setError(error instanceof Error ? error.message : "Failed to load listings")
    } finally {
      setIsLoading(false)
    }
  }

  // Show location selector if user hasn't selected a location
  if (showLocationSelector) {
    return <LocationSelector onLocationSelect={handleLocationSelect} onSkip={handleSkipLocation} />
  }

  // Show vehicle preference selector after location is selected
  if (showVehiclePreferences && selectedLocation) {
    return (
      <VehiclePreferenceSelector
        selectedLocation={selectedLocation}
        onPreferencesSelect={handleVehiclePreferencesSelect}
        onSkip={handleSkipPreferences}
      />
    )
  }

  const filteredCars = carListings
    .filter((car) => {
      const matchesSearch =
        car.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.bodyType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.vehicleCategory?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPrice = car.price >= priceRange[0] && car.price <= priceRange[1]
      const matchesMake = selectedMake === "any" || car.title.toLowerCase().includes(selectedMake.toLowerCase())

      // Apply vehicle preferences if they exist
      let matchesPreferences = true
      if (vehiclePreferences) {
        const prefBodyType =
          vehiclePreferences.bodyType !== "any"
            ? (vehiclePreferences.bodyType === "rv-trailer" &&
                (car.vehicleCategory?.toLowerCase() === "rvs" ||
                  car.bodyType?.toLowerCase() === "travel trailer" ||
                  car.bodyType?.toLowerCase().includes("class") ||
                  car.bodyType?.toLowerCase().includes("fifth wheel") ||
                  car.bodyType?.toLowerCase().includes("motorhome"))) ||
              car.bodyType?.toLowerCase().includes(vehiclePreferences.bodyType.toLowerCase())
            : true

        const prefYear = car.year >= vehiclePreferences.yearRange[0] && car.year <= vehiclePreferences.yearRange[1]
        const prefMake =
          vehiclePreferences.make === "any" || car.title.toLowerCase().includes(vehiclePreferences.make.toLowerCase())
        const prefModel =
          !vehiclePreferences.model || car.title.toLowerCase().includes(vehiclePreferences.model.toLowerCase())
        const prefPrice = car.price >= vehiclePreferences.priceRange[0] && car.price <= vehiclePreferences.priceRange[1]

        matchesPreferences = prefBodyType && prefYear && prefMake && prefModel && prefPrice
      }

      // Fix body type filtering to include vehicle category matching
      const matchesBodyType =
        selectedBodyType === "any" ||
        car.bodyType?.toLowerCase().includes(selectedBodyType.toLowerCase()) ||
        (selectedBodyType === "rv-trailer" &&
          (car.vehicleCategory?.toLowerCase() === "rvs" ||
            car.bodyType?.toLowerCase() === "travel trailer" ||
            car.bodyType?.toLowerCase().includes("class") ||
            car.bodyType?.toLowerCase().includes("fifth wheel") ||
            car.bodyType?.toLowerCase().includes("motorhome")))

      return matchesSearch && matchesPrice && matchesMake && matchesBodyType && matchesPreferences
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.publishedAt || b.created_at || 0).getTime() -
            new Date(a.publishedAt || a.created_at || 0).getTime()
          )
        case "price-low":
          return (a.price || 0) - (b.price || 0)
        case "price-high":
          return (b.price || 0) - (a.price || 0)
        case "mileage":
          return (a.mileage || 999999) - (b.mileage || 999999)
        case "year":
          return (b.year || 0) - (a.year || 0)
        case "alphabetical":
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              Loading listings{selectedLocation && ` for ${selectedLocation.city}, ${selectedLocation.state}`}...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadListings}>Try Again</Button>
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
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-blue-600 font-medium">
                  Buy
                </Link>
                <Link href="/sell" className="text-gray-700 hover:text-blue-600">
                  Sell
                </Link>
                {user && (
                  <>
                    <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                      Dashboard
                    </Link>
                    <Link href="/messages" className="text-gray-700 hover:text-blue-600">
                      Messages
                    </Link>
                  </>
                )}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Add notification bell for authenticated users */}
                  <NotificationBell />
                  <span className="text-sm text-gray-600 hidden sm:block">
                    Welcome, {profile?.first_name || user.email}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="cursor-pointer">
                        <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {profile?.first_name && profile?.last_name
                            ? `${profile.first_name[0]}${profile.last_name[0]}`
                            : user.email?.[0]?.toUpperCase() || "U"}
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
                      <DropdownMenuItem onClick={async () => await signOut()}>Sign Out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setShowSignIn(true)}>
                    Sign In
                  </Button>
                  <Button asChild>
                    <Link href="/sell">List Your Vehicle</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {selectedLocation
              ? `Vehicles in ${selectedLocation.city}, ${selectedLocation.state}`
              : "Browse All Vehicles"}
          </h1>
          <p className="text-xl mb-8 text-blue-100">Your trusted garage-to-garage marketplace</p>

          {vehiclePreferences && (
            <div className="flex justify-center mb-4">
              <div className="flex flex-wrap gap-2">
                {vehiclePreferences.bodyType !== "any" && (
                  <Badge variant="secondary">
                    {bodyTypes.find((t) => t.value === vehiclePreferences.bodyType)?.label}
                  </Badge>
                )}
                {vehiclePreferences.make !== "any" && <Badge variant="secondary">{vehiclePreferences.make}</Badge>}
              </div>
            </div>
          )}

          {/* Location Change and Search Bar */}
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex justify-center gap-3">
              <Button variant="secondary" onClick={handleChangeLocation} className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {selectedLocation
                    ? `Change from ${selectedLocation.city}, ${selectedLocation.state}`
                    : "Set Location"}
                </span>
              </Button>
              {vehiclePreferences && (
                <Button variant="secondary" size="sm" onClick={handleChangePreferences}>
                  Change Preferences
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search by make, model, or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-gray-900"
                />
              </div>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => {
                  // Trigger search functionality - could add search analytics here
                  console.log("Search triggered for:", searchTerm)
                }}
                className="h-12"
              >
                <Search className="h-5 w-5 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className={`w-80 space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Filters</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range */}
                <div className="slider-root">
                  <label className="text-sm font-medium mb-3 block">Price Range</label>
                  {/* Price Range Slider - Filter Controls with dual thumbs */}
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={500000}
                    min={0}
                    step={5000}
                    className="mb-2 relative"
                    minStepsBetweenThumbs={1}
                  />
                  <style jsx>{`
                    :global(.slider-root [data-radix-slider-thumb]) {
                      width: 20px !important;
                      height: 20px !important;
                      background: #2563eb !important;
                      border: 2px solid white !important;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2) !important;
                      cursor: grab !important;
                      display: block !important;
                      opacity: 1 !important;
                    }
                    :global(.slider-root [data-radix-slider-thumb]:hover) {
                      background: #1d4ed8 !important;
                      transform: scale(1.1) !important;
                    }
                    :global(.slider-root [data-radix-slider-thumb]:focus) {
                      outline: 2px solid #3b82f6 !important;
                      outline-offset: 2px !important;
                    }
                    :global(.slider-root [data-radix-slider-thumb]:first-of-type) {
                      background: #dc2626 !important;
                    }
                    :global(.slider-root [data-radix-slider-thumb]:last-of-type) {
                      background: #16a34a !important;
                    }
                  `}</style>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${safeToLocaleString(priceRange[0])}</span>
                    <span>${safeToLocaleString(priceRange[1])}</span>
                  </div>
                </div>

                {/* Make */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Make</label>
                  <Select value={selectedMake} onValueChange={setSelectedMake}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Make" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Make</SelectItem>
                      <SelectItem value="honda">Honda</SelectItem>
                      <SelectItem value="toyota">Toyota</SelectItem>
                      <SelectItem value="ford">Ford</SelectItem>
                      <SelectItem value="tesla">Tesla</SelectItem>
                      <SelectItem value="jeep">Jeep</SelectItem>
                      <SelectItem value="bmw">BMW</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Body Type */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Body Type</label>
                  <Select value={selectedBodyType} onValueChange={setSelectedBodyType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any Type</SelectItem>
                      <SelectItem value="sedan">Sedan</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                      <SelectItem value="pickup">Pickup</SelectItem>
                      <SelectItem value="coupe">Coupe</SelectItem>
                      <SelectItem value="hatchback">Hatchback</SelectItem>
                      <SelectItem value="rv-trailer">RVs/Travel Trailers</SelectItem>
                      <SelectItem value="motorcycle">Motorcycle</SelectItem>
                      <SelectItem value="boat">Boat</SelectItem>
                      <SelectItem value="atv">ATV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Fuel Type</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="gasoline" />
                      <label htmlFor="gasoline" className="text-sm">
                        Gasoline
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="electric" />
                      <label htmlFor="electric" className="text-sm">
                        Electric
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="hybrid" />
                      <label htmlFor="hybrid" className="text-sm">
                        Hybrid
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setPriceRange([0, 500000])
                    setSelectedMake("any")
                    setSelectedBodyType("any")
                    setSortBy("newest")
                  }}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredCars.length} {filteredCars.length === 1 ? "Vehicle" : "Vehicles"} Available
                {selectedLocation && (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    in {selectedLocation.city}, {selectedLocation.state}
                  </span>
                )}
              </h2>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="mileage">Lowest Mileage</SelectItem>
                  <SelectItem value="year">Newest Year</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vehicle Listings Grid */}
            {filteredCars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCars.map((car) => (
                  <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <Image
                        src={car.images[0] || "/placeholder.svg"}
                        alt={car.title}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                      <FavoriteButton
                        listingId={car.id}
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        variant="ghost"
                        size="sm"
                      />
                      <Badge className="absolute top-2 left-2 bg-green-600">{car.condition}</Badge>

                      {/* Add pending status badge */}
                      {car.status === "pending" && (
                        <Badge className="absolute top-12 left-2 bg-yellow-500 text-white text-xs">Pending Sale</Badge>
                      )}
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{car.title}</h3>
                          <p className="text-2xl font-bold text-blue-600">${safeToLocaleString(car.price)}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {car.year}
                          </div>
                          <div className="flex items-center">
                            <Gauge className="h-4 w-4 mr-1" />
                            {safeToLocaleString(car.mileage)} mi
                          </div>
                          <div className="flex items-center">
                            <Fuel className="h-4 w-4 mr-1" />
                            {car.fuelType}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {car.transmission}
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-1" />
                          {car.location}
                        </div>

                        {/* Seller Info */}
                        <div className="flex items-center justify-between pt-3 border-t">
                          {car.seller.id ? (
                            <Link
                              href={`/seller/${car.seller.id}`}
                              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={car.seller.avatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {car.seller.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{car.seller.name}</p>
                                <div className="flex items-center">
                                  {car.seller.rating > 0 ? (
                                    <>
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                      <span className="text-xs text-gray-600">
                                        {car.seller.rating.toFixed(1)} ({car.seller.reviews} reviews)
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-xs text-gray-500">No reviews yet</span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ) : null}
                        </div>

                        <Button className="w-full mt-3" asChild>
                          <Link href={`/listing/${car.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
                <p className="text-gray-600 mb-4">
                  {carListings.length === 0
                    ? selectedLocation
                      ? `No vehicles have been listed in ${selectedLocation.city}, ${selectedLocation.state} yet. Be the first to list your vehicle!`
                      : "No vehicles have been listed yet. Be the first to list your vehicle!"
                    : "Try adjusting your search criteria or filters"}
                </p>
                <div className="space-y-2">
                  <Button asChild>
                    <Link href="/sell">List Your Vehicle</Link>
                  </Button>
                  <br />
                  <Button variant="outline" onClick={handleChangeLocation}>
                    Try Different Location
                  </Button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      {/* Auth Modals */}
      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={() => {
          setShowSignIn(false)
          setShowSignUp(true)
        }}
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
