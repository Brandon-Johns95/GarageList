"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Heart, MapPin, Calendar, Gauge, Fuel, Users, Phone, Mail, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { GarageListLogo } from "@/components/garage-list-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
  return {
    ...listing,
    id: listing.id || Date.now(),
    title: safeString(listing.title) || "Unknown Vehicle",
    price: Number(listing.price) || 0,
    year: Number(listing.year) || new Date().getFullYear(),
    mileage: Number(listing.mileage) || 0,
    location: safeString(listing.location) || "Unknown Location",
    images: Array.isArray(listing.images) ? listing.images : ["/placeholder.svg?height=200&width=300"],
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
  }
}

export default function CarMarketplace() {
  const [searchTerm, setSearchTerm] = useState("")
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [selectedMake, setSelectedMake] = useState("any")
  const [selectedBodyType, setSelectedBodyType] = useState("any")
  const [showFilters, setShowFilters] = useState(false)
  const [carListings, setCarListings] = useState([])

  // Load user listings from localStorage on component mount
  useEffect(() => {
    try {
      const userListingsData = localStorage.getItem("userListings")
      if (userListingsData) {
        const userListings = JSON.parse(userListingsData)
        if (Array.isArray(userListings)) {
          // Validate and clean each listing
          const validatedListings = userListings.map(validateListing)
          setCarListings(validatedListings)
        }
      }
    } catch (error) {
      console.error("Error loading user listings:", error)
      setCarListings([])
    }
  }, [])

  const filteredCars = carListings.filter((car) => {
    const matchesSearch = car.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPrice = car.price >= priceRange[0] && car.price <= priceRange[1]
    const matchesMake = selectedMake === "any" || car.title.toLowerCase().includes(selectedMake.toLowerCase())
    const matchesBodyType = selectedBodyType === "any" || car.bodyType.toLowerCase() === selectedBodyType.toLowerCase()

    return matchesSearch && matchesPrice && matchesMake && matchesBodyType
  })

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
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link href="/messages" className="text-gray-700 hover:text-blue-600">
                  Messages
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">Sign In</Button>
              <Button asChild>
                <Link href="/sell">List Your Vehicle</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Vehicle</h1>
          <p className="text-xl mb-8 text-blue-100">Your trusted garage-to-garage marketplace</p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
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
              <Button variant="secondary" size="lg" onClick={() => setShowFilters(!showFilters)} className="h-12">
                <Filter className="h-5 w-5 mr-2" />
                Filters
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
                <div>
                  <label className="text-sm font-medium mb-3 block">Price Range</label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={50000}
                    min={0}
                    step={1000}
                    className="mb-2"
                  />
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
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredCars.length} {filteredCars.length === 1 ? "Vehicle" : "Vehicles"} Available
              </h2>
              <Select defaultValue="newest">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="mileage">Lowest Mileage</SelectItem>
                  <SelectItem value="year">Newest Year</SelectItem>
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
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-white/80 hover:bg-white">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Badge className="absolute top-2 left-2 bg-green-600">{car.condition}</Badge>
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
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={car.seller.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {car.seller.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{car.seller.name}</p>
                              <div className="flex items-center">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                <span className="text-xs text-gray-600">
                                  {car.seller.rating} ({car.seller.reviews})
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
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
                    ? "No vehicles have been listed yet. Be the first to list your vehicle!"
                    : "Try adjusting your search criteria or filters"}
                </p>
                <Button asChild>
                  <Link href="/sell">List Your Vehicle</Link>
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
