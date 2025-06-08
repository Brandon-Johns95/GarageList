"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { Search, MapPin, Calendar, Gauge, Fuel, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { LocationSelector } from "@/components/location-selector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"

import { useAuth } from "@/lib/auth-context"
import { useLocation } from "@/lib/location-context"
import { SignInModal } from "@/components/auth/sign-in-modal"
import { SignUpModal } from "@/components/auth/sign-up-modal"
import { VehiclePreferenceSelector } from "@/components/vehicle-preference-selector"
import { FavoriteButton } from "@/components/favorites/favorite-button"
import { AdvancedFilters } from "@/components/filters/advanced-filters"
import { useDistanceCalculation } from "@/hooks/use-distance-calculation"
import { formatDistance, isWithinRadius } from "@/lib/distance-utils"
import { Header } from "@/components/header"

// PSEUDOCODE: Helper functions for safe data handling
const safeToLocaleString = (value: any): string => {
  const num = Number(value)
  return !isNaN(num) && isFinite(num) ? num.toLocaleString() : "0"
}

const safeString = (value: any): string => {
  return value && typeof value === "string" ? value : ""
}

// PSEUDOCODE: Body type configuration for different vehicle categories
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

// PSEUDOCODE: Memoized vehicle card component for performance - Updated for mobile
const VehicleCard = React.memo(({ car, getDistance, selectedLocation }: any) => {
  // PSEUDOCODE: Calculate distance data for this specific vehicle
  const distanceData = useMemo(() => getDistance(car.id), [car.id, getDistance])

  return (
    <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow w-full h-full">
      <div className="relative">
        <Image
          src={car.images[0] || "/placeholder.svg"}
          alt={car.title}
          width={300}
          height={200}
          className="w-full h-32 sm:h-40 md:h-48 object-cover"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
        <FavoriteButton
          listingId={car.id}
          className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-white/80 hover:bg-white w-6 h-6 sm:w-8 sm:h-8"
          variant="ghost"
          size="sm"
        />
        <Badge className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-green-600 text-xs px-1 py-0.5 sm:px-2 sm:py-1">
          {car.condition}
        </Badge>

        {car.status === "pending" && (
          <Badge className="absolute top-6 left-1 sm:top-10 sm:left-2 bg-yellow-500 text-white text-xs px-1 py-0.5">
            Pending Sale
          </Badge>
        )}
      </div>

      <CardContent className="p-2 sm:p-3 md:p-4">
        <div className="space-y-1 sm:space-y-2 md:space-y-3">
          <div>
            <h3 className="font-semibold text-xs sm:text-sm md:text-lg text-gray-900 line-clamp-2 leading-tight">
              {car.title}
            </h3>
            <p className="text-sm sm:text-lg md:text-2xl font-bold text-blue-600">${safeToLocaleString(car.price)}</p>
          </div>

          <div className="grid grid-cols-2 gap-1 text-xs sm:text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{car.year}</span>
            </div>
            <div className="flex items-center">
              <Gauge className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{safeToLocaleString(car.mileage)} mi</span>
            </div>
            <div className="flex items-center">
              <Fuel className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{car.fuelType}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{car.transmission}</span>
            </div>
          </div>

          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{car.location}</span>
          </div>

          {distanceData?.distance && (
            <div className="flex items-center text-xs sm:text-sm text-blue-600">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">
                {formatDistance(distanceData.distance.miles)}
                {distanceData.duration && ` (${distanceData.duration.text})`}
              </span>
            </div>
          )}

          <Button className="w-full mt-1 sm:mt-2 md:mt-3 text-xs sm:text-sm h-7 sm:h-8 md:h-10" asChild>
            <Link href={`/listing/${car.id}`}>View Details</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

VehicleCard.displayName = "VehicleCard"

export default function CarMarketplace() {
  // PSEUDOCODE: Initialize context hooks for location and authentication
  const {
    selectedLocation,
    setSelectedLocation,
    hasSelectedLocation,
    vehiclePreferences,
    setVehiclePreferences,
    hasSelectedPreferences,
  } = useLocation()

  const { user, profile, signOut } = useAuth()

  // PSEUDOCODE: Component state management
  const [showLocationSelector, setShowLocationSelector] = useState(false)
  const [showVehiclePreferences, setShowVehiclePreferences] = useState(!hasSelectedPreferences && hasSelectedLocation)
  const [carListings, setCarListings] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

  // PSEUDOCODE: Filter state with optimized default values
  const [filters, setFilters] = useState({
    searchTerm: "",
    priceRange: [0, 500000],
    yearRange: [1990, new Date().getFullYear()],
    mileageRange: [0, 300000],
    makes: [],
    models: [],
    bodyTypes: [],
    fuelTypes: [],
    transmissions: [],
    drivetrains: [],
    conditions: [],
    colors: [],
    features: [],
    location: "",
    radius: 100,
    sellerTypes: [],
    negotiable: null,
    tradeConsidered: null,
    financingAvailable: null,
    engineSizeRange: [1.0, 8.0],
    doors: [],
    seatingCapacity: [],
    safetyRating: [],
    listingAge: "",
    photoCount: "",
    verifiedSellers: false,
    rvLength: [10, 45],
    rvClass: [],
    slideOuts: [],
    engineCC: [50, 2000],
    motorcycleType: [],
    boatLength: [10, 100],
    boatType: [],
    engineType: [],
  })

  // PSEUDOCODE: Memoized user location string for distance calculations
  const userLocationString = useMemo(
    () => (selectedLocation ? `${selectedLocation.city}, ${selectedLocation.state}` : null),
    [selectedLocation],
  )

  // PSEUDOCODE: Distance calculation hook with memoized listings
  const {
    distances,
    loading: distancesLoading,
    error: distanceError,
    getDistance,
  } = useDistanceCalculation(userLocationString, carListings)

  // PSEUDOCODE: Optimized listing loader with error handling and caching
  const loadListings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError("")

      console.log("Starting to load listings...")

      // PSEUDOCODE: First, get basic listings data
      let query = supabase.from("listings").select(`
          id,
          title,
          price,
          year,
          mileage,
          location,
          status,
          vehicle_category,
          condition,
          fuel_type,
          transmission,
          body_type,
          description,
          exterior_color,
          interior_color,
          vin,
          negotiable,
          trade_considered,
          financing_available,
          published_at,
          created_at,
          seller_id
        `)

      // PSEUDOCODE: Apply basic filters for active listings
      query = query.or("status.eq.active,status.eq.pending,status.is.null")
      query = query.not("status", "eq", "sold")
      query = query.not("status", "eq", "draft")
      query = query.not("status", "eq", "expired")

      // PSEUDOCODE: Apply location filter if selected
      if (selectedLocation && selectedLocation.state !== "Current Location") {
        query = query.or(`location.ilike.%${selectedLocation.city}%,location.ilike.%${selectedLocation.state}%`)
      }

      const { data: listings, error: listingsError } = await query.order("created_at", { ascending: false }).limit(100)

      if (listingsError) {
        console.error("Listings query error:", listingsError)
        throw new Error(`Failed to load listings: ${listingsError.message}`)
      }

      console.log(`Found ${listings?.length || 0} listings`)

      if (!listings || listings.length === 0) {
        setCarListings([])
        return
      }

      // PSEUDOCODE: Get photos for listings
      const listingIds = listings.map((listing) => listing.id)
      const { data: photos } = await supabase
        .from("listing_photos")
        .select("listing_id, photo_url, is_main_photo, sort_order")
        .in("listing_id", listingIds)

      // PSEUDOCODE: Get features for listings
      const { data: features } = await supabase
        .from("listing_features")
        .select("listing_id, feature_name")
        .in("listing_id", listingIds)

      // PSEUDOCODE: Get seller profiles
      const sellerIds = [...new Set(listings.map((listing) => listing.seller_id).filter(Boolean))]
      const { data: userProfiles } = await supabase
        .from("user_profiles")
        .select("id, first_name, last_name, avatar_url, phone, average_rating, total_reviews")
        .in("id", sellerIds)

      console.log(`Found ${userProfiles?.length || 0} seller profiles`)

      // PSEUDOCODE: Create lookup maps for efficient data access
      const photoMap = new Map()
      photos?.forEach((photo) => {
        if (!photoMap.has(photo.listing_id)) {
          photoMap.set(photo.listing_id, [])
        }
        photoMap.get(photo.listing_id).push(photo)
      })

      const featureMap = new Map()
      features?.forEach((feature) => {
        if (!featureMap.has(feature.listing_id)) {
          featureMap.set(feature.listing_id, [])
        }
        featureMap.get(feature.listing_id).push(feature.feature_name)
      })

      const profileMap = new Map(userProfiles?.map((profile) => [profile.id, profile]) || [])

      // PSEUDOCODE: Transform listings with all related data
      const transformedListings = listings.map((listing) => {
        const listingPhotos = photoMap.get(listing.id) || []
        const listingFeatures = featureMap.get(listing.id) || []
        const profile = profileMap.get(listing.seller_id)

        return {
          id: listing.id,
          title: listing.title || "Untitled Vehicle",
          price: listing.price || 0,
          year: listing.year || new Date().getFullYear(),
          mileage: listing.mileage || 0,
          location: listing.location || "Location not specified",
          status: listing.status,
          vehicleCategory: listing.vehicle_category || "cars",
          images: listingPhotos.sort((a, b) => a.sort_order - b.sort_order).map((photo) => photo.photo_url) || [
            "/placeholder.svg?height=200&width=300",
          ],
          seller: {
            id: listing.seller_id,
            name: profile
              ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Anonymous Seller"
              : "Anonymous Seller",
            rating: profile?.average_rating || 0,
            reviews: profile?.total_reviews || 0,
            avatar: profile?.avatar_url || "/placeholder.svg?height=40&width=40",
            phone: profile?.phone,
          },
          features: listingFeatures,
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
          createdAt: listing.created_at,
        }
      })

      console.log(`Transformed ${transformedListings.length} listings`)
      setCarListings(transformedListings)
    } catch (error) {
      console.error("Error loading listings:", error)
      setError(error instanceof Error ? error.message : "Failed to load listings")
    } finally {
      setIsLoading(false)
    }
  }, [selectedLocation])

  // PSEUDOCODE: Load listings on mount and dependency changes
  useEffect(() => {
    loadListings()
  }, [loadListings])

  // PSEUDOCODE: Memoized filtered and sorted listings for performance
  const filteredCars = useMemo(() => {
    return carListings
      .filter((car) => {
        // PSEUDOCODE: Apply all filters efficiently
        const matchesSearch =
          !filters.searchTerm ||
          car.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          car.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
          car.bodyType?.toLowerCase().includes(filters.searchTerm.toLowerCase())

        const matchesPrice = car.price >= filters.priceRange[0] && car.price <= filters.priceRange[1]
        const matchesYear = car.year >= filters.yearRange[0] && car.year <= filters.yearRange[1]
        const matchesMileage = car.mileage >= filters.mileageRange[0] && car.mileage <= filters.mileageRange[1]

        const matchesMakes =
          filters.makes.length === 0 ||
          filters.makes.some((make) => car.title.toLowerCase().includes(make.toLowerCase()))

        const matchesBodyTypes =
          filters.bodyTypes.length === 0 ||
          filters.bodyTypes.some((type) => car.bodyType?.toLowerCase().includes(type.toLowerCase()))

        const matchesFuelTypes =
          filters.fuelTypes.length === 0 ||
          filters.fuelTypes.some((fuel) => car.fuelType?.toLowerCase().includes(fuel.toLowerCase()))

        const matchesTransmissions =
          filters.transmissions.length === 0 ||
          filters.transmissions.some((trans) => car.transmission?.toLowerCase().includes(trans.toLowerCase()))

        const matchesConditions =
          filters.conditions.length === 0 ||
          filters.conditions.some((condition) => car.condition?.toLowerCase().includes(condition.toLowerCase()))

        const matchesColors =
          filters.colors.length === 0 ||
          filters.colors.some((color) => car.exteriorColor?.toLowerCase().includes(color.toLowerCase()))

        const matchesFeatures =
          filters.features.length === 0 || filters.features.some((feature) => car.features?.includes(feature))

        const matchesNegotiable = filters.negotiable === null || car.negotiable === filters.negotiable
        const matchesTradeConsidered =
          filters.tradeConsidered === null || car.tradeConsidered === filters.tradeConsidered
        const matchesFinancingAvailable =
          filters.financingAvailable === null || car.financingAvailable === filters.financingAvailable

        // PSEUDOCODE: Distance/radius filter with error handling
        let matchesRadius = true
        if (userLocationString && filters.radius) {
          const distanceData = getDistance(car.id)
          if (distanceData && distanceData.distance) {
            matchesRadius = isWithinRadius(distanceData.distance.miles, filters.radius)
          }
        }

        return (
          matchesSearch &&
          matchesPrice &&
          matchesYear &&
          matchesMileage &&
          matchesMakes &&
          matchesBodyTypes &&
          matchesFuelTypes &&
          matchesTransmissions &&
          matchesConditions &&
          matchesColors &&
          matchesFeatures &&
          matchesNegotiable &&
          matchesTradeConsidered &&
          matchesFinancingAvailable &&
          matchesRadius
        )
      })
      .map((car) => {
        // PSEUDOCODE: Add distance data to each car object
        const distanceData = getDistance(car.id)
        return {
          ...car,
          distance: distanceData?.distance?.miles,
          distanceText: distanceData?.distance?.text,
          duration: distanceData?.duration?.text,
          distanceError: distanceData?.error,
        }
      })
      .sort((a, b) => {
        // PSEUDOCODE: Optimized sorting logic
        if (filters.distanceSort === "distance-asc") {
          const distanceA = a.distance || Number.POSITIVE_INFINITY
          const distanceB = b.distance || Number.POSITIVE_INFINITY
          return distanceA - distanceB
        } else if (filters.distanceSort === "distance-desc") {
          const distanceA = a.distance || Number.NEGATIVE_INFINITY
          const distanceB = b.distance || Number.NEGATIVE_INFINITY
          return distanceB - distanceA
        }

        switch (sortBy) {
          case "newest":
            return (
              new Date(b.publishedAt || b.createdAt || 0).getTime() -
              new Date(a.publishedAt || a.createdAt || 0).getTime()
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
  }, [carListings, filters, sortBy, getDistance, userLocationString])

  // PSEUDOCODE: Event handlers with useCallback for performance
  const handleLocationSelect = useCallback(
    (state: string, city: string) => {
      setSelectedLocation({ state, city })
      setShowLocationSelector(false)
      if (!hasSelectedPreferences) {
        setShowVehiclePreferences(true)
      }
    },
    [setSelectedLocation, hasSelectedPreferences],
  )

  const handleSkipLocation = useCallback(() => {
    setSelectedLocation(null)
    setShowLocationSelector(false)
  }, [setSelectedLocation])

  const handleChangeLocation = useCallback(() => {
    setShowLocationSelector(true)
  }, [])

  const handleVehiclePreferencesSelect = useCallback(
    (preferences: any) => {
      setVehiclePreferences(preferences)
      setShowVehiclePreferences(false)
    },
    [setVehiclePreferences],
  )

  const handleSkipPreferences = useCallback(() => {
    setShowVehiclePreferences(false)
  }, [])

  const handleChangePreferences = useCallback(() => {
    setShowVehiclePreferences(true)
  }, [])

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

  // PSEUDOCODE: Loading state with skeleton UI
  if (isLoading || distancesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              {isLoading ? "Loading listings" : "Calculating distances"}
              {selectedLocation && ` for ${selectedLocation.city}, ${selectedLocation.state}`}...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // PSEUDOCODE: Error state with retry option
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
      <Header />

      {/* PSEUDOCODE: Hero section with search and location controls */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 sm:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center">
          <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {selectedLocation
              ? `Vehicles in ${selectedLocation.city}, ${selectedLocation.state}`
              : "Browse All Vehicles"}
          </h1>
          <p className="text-base sm:text-xl mb-6 sm:mb-8 text-blue-100">Your trusted garage-to-garage marketplace</p>

          {vehiclePreferences && (
            <div className="flex justify-center mb-4">
              <div className="flex flex-wrap gap-2 justify-center">
                {vehiclePreferences.bodyType !== "any" && (
                  <Badge variant="secondary" className="text-xs">
                    {bodyTypes.find((t) => t.value === vehiclePreferences.bodyType)?.label}
                  </Badge>
                )}
                {vehiclePreferences.make !== "any" && (
                  <Badge variant="secondary" className="text-xs">
                    {vehiclePreferences.make}
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
              <Button
                variant="secondary"
                onClick={handleChangeLocation}
                className="flex items-center justify-center space-x-2 text-xs sm:text-sm"
              >
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="truncate">
                  {selectedLocation
                    ? `Change from ${selectedLocation.city}, ${selectedLocation.state}`
                    : "Set Location"}
                </span>
              </Button>
              {vehiclePreferences && (
                <Button variant="secondary" size="sm" onClick={handleChangePreferences} className="text-xs sm:text-sm">
                  Change Preferences
                </Button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                <Input
                  placeholder="Search by make, model, or keyword..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
                  className="pl-10 h-10 sm:h-12 text-gray-900 text-sm sm:text-base"
                />
              </div>
              <Button variant="secondary" size="lg" className="h-10 sm:h-12 w-full sm:w-auto">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* PSEUDOCODE: Advanced filters sidebar */}
          <aside className="w-full lg:w-80 space-y-6">
            <AdvancedFilters
              filters={filters}
              onFiltersChange={setFilters}
              vehicleCategory="cars-trucks"
              showMobileToggle={true}
            />
          </aside>

          {/* PSEUDOCODE: Main content area with listings */}
          <main className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900">
                {filteredCars.length} {filteredCars.length === 1 ? "Vehicle" : "Vehicles"} Available
                {selectedLocation && (
                  <span className="block sm:inline text-sm sm:text-lg font-normal text-gray-600 sm:ml-2">
                    in {selectedLocation.city}, {selectedLocation.state}
                  </span>
                )}
              </h2>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-48">
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

            {/* PSEUDOCODE: Vehicle listings grid with mobile-optimized layout */}
            {filteredCars.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
                {filteredCars.map((car) => (
                  <VehicleCard key={car.id} car={car} getDistance={getDistance} selectedLocation={selectedLocation} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12 px-4">
                <div className="text-gray-400 mb-4">
                  <Search className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
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

      {/* PSEUDOCODE: Authentication modals */}
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
