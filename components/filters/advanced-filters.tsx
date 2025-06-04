"use client"

import { useState, useCallback } from "react"
import { Filter, X, ChevronDown, ChevronUp, MapPin, Gauge, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useLocation } from "@/lib/location-context"

interface FilterOptions {
  // Basic filters
  searchTerm: string
  priceRange: [number, number]
  yearRange: [number, number]
  mileageRange: [number, number]
  radius: number

  // Vehicle details
  makes: string[]
  models: string[]
  bodyTypes: string[]
  fuelTypes: string[]
  transmissions: string[]
  drivetrains: string[]

  // Condition and features
  conditions: string[]
  colors: string[]
  features: string[]

  // Location and distance
  location: string
  distanceSort?: string
  showDistance?: boolean

  // Seller preferences
  sellerTypes: string[]
  negotiable: boolean | null
  tradeConsidered: boolean | null
  financingAvailable: boolean | null

  // Advanced options
  engineSizeRange: [number, number]
  doors: string[]
  seatingCapacity: string[]
  safetyRating: string[]

  // Listing specific
  listingAge: string
  photoCount: string
  verifiedSellers: boolean

  // RV specific
  rvLength: [number, number]
  rvClass: string[]
  slideOuts: string[]

  // Motorcycle specific
  engineCC: [number, number]
  motorcycleType: string[]

  // Boat specific
  boatLength: [number, number]
  boatType: string[]
  engineType: string[]
}

interface AdvancedFiltersProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  vehicleCategory?: string
  className?: string
  showMobileToggle?: boolean
}

const currentYear = new Date().getFullYear()

const makes = [
  "Acura",
  "Audi",
  "BMW",
  "Buick",
  "Cadillac",
  "Chevrolet",
  "Chrysler",
  "Dodge",
  "Ford",
  "GMC",
  "Honda",
  "Hyundai",
  "Infiniti",
  "Jeep",
  "Kia",
  "Lexus",
  "Lincoln",
  "Mazda",
  "Mercedes-Benz",
  "Mitsubishi",
  "Nissan",
  "Ram",
  "Subaru",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
]

const bodyTypes = {
  "cars-trucks": ["Sedan", "SUV", "Hatchback", "Coupe", "Convertible", "Pickup Truck", "Wagon", "Minivan", "Crossover"],
  motorcycles: ["Cruiser", "Sport", "Touring", "Standard", "Dual Sport", "Dirt Bike", "Scooter", "Chopper"],
  rvs: ["Class A", "Class B", "Class C", "Travel Trailer", "Fifth Wheel", "Toy Hauler", "Pop-up Camper"],
  boats: ["Bowrider", "Pontoon", "Bass Boat", "Ski Boat", "Fishing Boat", "Sailboat", "Yacht", "Jet Ski"],
  offroad: ["ATV", "Side-by-Side (UTV)", "Dirt Bike", "Dune Buggy", "Go-Kart", "Sand Rail"],
}

const fuelTypes = ["Gasoline", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"]
const transmissions = ["Automatic", "Manual", "CVT"]
const drivetrains = ["Front-Wheel Drive", "Rear-Wheel Drive", "All-Wheel Drive", "4WD"]
const conditions = ["Excellent", "Very Good", "Good", "Fair", "Poor"]
const colors = [
  "Black",
  "White",
  "Silver",
  "Gray",
  "Red",
  "Blue",
  "Green",
  "Brown",
  "Gold",
  "Beige",
  "Yellow",
  "Orange",
  "Purple",
  "Maroon",
  "Other",
]

const features = {
  "cars-trucks": [
    "Air Conditioning",
    "Heated Seats",
    "Leather Seats",
    "Sunroof",
    "Navigation System",
    "Backup Camera",
    "Bluetooth",
    "Cruise Control",
    "Keyless Entry",
    "Remote Start",
    "Premium Sound",
    "Third Row Seating",
    "All-Wheel Drive",
    "Towing Package",
    "Sport Package",
    "Cold Weather Package",
    "Adaptive Cruise Control",
    "Lane Departure Warning",
    "Blind Spot Monitoring",
    "Parking Sensors",
    "Wireless Charging",
    "Apple CarPlay",
    "Android Auto",
  ],
  motorcycles: [
    "ABS Brakes",
    "Traction Control",
    "Heated Grips",
    "Windshield",
    "Saddlebags",
    "Top Box",
    "Custom Exhaust",
    "LED Lighting",
    "Quick Shifter",
    "Cruise Control",
  ],
  rvs: [
    "Generator",
    "Solar Panels",
    "Slide Outs",
    "Awning",
    "Air Conditioning",
    "Microwave",
    "Refrigerator",
    "TV/Entertainment",
    "Washer/Dryer",
    "Fireplace",
  ],
  boats: [
    "GPS/Fish Finder",
    "Stereo System",
    "Bimini Top",
    "Trailer Included",
    "Outboard Motor",
    "Trolling Motor",
    "Live Well",
    "Rod Holders",
  ],
  offroad: [
    "Winch",
    "LED Light Bar",
    "Roof",
    "Windshield",
    "Doors",
    "Cargo Box",
    "Brush Guards",
    "Skid Plates",
    "Upgraded Suspension",
    "Custom Wheels",
  ],
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  vehicleCategory = "cars-trucks",
  className = "",
  showMobileToggle = true,
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    vehicle: false,
    condition: false,
    location: false,
    seller: false,
    advanced: false,
  })

  const { selectedLocation } = useLocation()

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  // Debounce filter changes to avoid excessive updates
  const debouncedOnFiltersChange = useCallback(
    (newFilters: FilterOptions) => {
      // Simulate API call or complex filtering logic
      setTimeout(() => {
        onFiltersChange(newFilters)
      }, 300) // Adjust delay as needed
    },
    [onFiltersChange],
  )

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    // Update the filter state and trigger the debounced filter change
    debouncedOnFiltersChange({ ...filters, [key]: value })
  }

  const toggleArrayFilter = (key: keyof FilterOptions, value: string) => {
    const currentArray = filters[key] as string[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value]
    updateFilter(key, newArray)
  }

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: "",
      priceRange: [0, 500000],
      yearRange: [1990, currentYear],
      mileageRange: [0, 300000],
      radius: 100, // Changed from 25 to 100
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
      distanceSort: "relevance",
      showDistance: true,
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
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500000) count++
    if (filters.yearRange[0] > 1990 || filters.yearRange[1] < currentYear) count++
    if (filters.mileageRange[0] > 0 || filters.mileageRange[1] < 300000) count++
    if (filters.radius !== 100) count++ // Changed from 25 to 100
    count += filters.makes.length
    count += filters.bodyTypes.length
    count += filters.fuelTypes.length
    count += filters.transmissions.length
    count += filters.conditions.length
    count += filters.colors.length
    count += filters.features.length
    if (filters.location) count++
    if (filters.negotiable !== null) count++
    if (filters.tradeConsidered !== null) count++
    if (filters.financingAvailable !== null) count++
    if (filters.verifiedSellers) count++
    return count
  }

  const getCurrentBodyTypes = () => {
    return bodyTypes[vehicleCategory as keyof typeof bodyTypes] || bodyTypes["cars-trucks"]
  }

  const getCurrentFeatures = () => {
    return features[vehicleCategory as keyof typeof features] || features["cars-trucks"]
  }

  if (showMobileToggle) {
    return (
      <>
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </div>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Filter Panel */}
        {isOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-white overflow-y-auto safe-area-inset">
            <div className="p-4 pb-safe">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <FilterContent
                filters={filters}
                updateFilter={updateFilter}
                toggleArrayFilter={toggleArrayFilter}
                clearAllFilters={clearAllFilters}
                expandedSections={expandedSections}
                toggleSection={toggleSection}
                vehicleCategory={vehicleCategory}
                getCurrentBodyTypes={getCurrentBodyTypes}
                getCurrentFeatures={getCurrentFeatures}
                selectedLocation={selectedLocation}
              />
              <div className="mt-6 flex flex-col sm:flex-row gap-2">
                <Button onClick={() => setIsOpen(false)} className="flex-1">
                  Apply Filters
                </Button>
                <Button variant="outline" onClick={clearAllFilters}>
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Filters */}
        <div className="hidden lg:block">
          <FilterContent
            filters={filters}
            updateFilter={updateFilter}
            toggleArrayFilter={toggleArrayFilter}
            clearAllFilters={clearAllFilters}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
            vehicleCategory={vehicleCategory}
            getCurrentBodyTypes={getCurrentBodyTypes}
            getCurrentFeatures={getCurrentFeatures}
            selectedLocation={selectedLocation}
          />
        </div>
      </>
    )
  }

  return (
    <FilterContent
      filters={filters}
      updateFilter={updateFilter}
      toggleArrayFilter={toggleArrayFilter}
      clearAllFilters={clearAllFilters}
      expandedSections={expandedSections}
      toggleSection={toggleSection}
      vehicleCategory={vehicleCategory}
      getCurrentBodyTypes={getCurrentBodyTypes}
      getCurrentFeatures={getCurrentFeatures}
      selectedLocation={selectedLocation}
    />
  )
}

const FilterContent = ({
  filters,
  updateFilter,
  toggleArrayFilter,
  clearAllFilters,
  expandedSections,
  toggleSection,
  vehicleCategory,
  getCurrentBodyTypes,
  getCurrentFeatures,
  selectedLocation,
}: any) => {
  const getActiveFilterCount = () => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500000) count++
    if (filters.yearRange[0] > 1990 || filters.yearRange[1] < 2023) count++
    if (filters.mileageRange[0] > 0 || filters.mileageRange[1] < 300000) count++
    if (filters.radius !== 100) count++ // Changed from 25 to 100
    count += filters.makes.length
    count += filters.bodyTypes.length
    count += filters.fuelTypes.length
    count += filters.transmissions.length
    count += filters.conditions.length
    count += filters.colors.length
    count += filters.features.length
    if (filters.location) count++
    if (filters.negotiable !== null) count++
    if (filters.tradeConsidered !== null) count++
    if (filters.financingAvailable !== null) count++
    if (filters.verifiedSellers) count++
    return count
  }

  return (
    <div className="space-y-4">
      {/* Basic Filters */}
      <Collapsible open={expandedSections.basic} onOpenChange={() => toggleSection("basic")}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Basic Filters
                </div>
                {expandedSections.basic ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Price Range */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Price Range</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Select
                      value={filters.priceRange[0].toString()}
                      onValueChange={(value) =>
                        updateFilter("priceRange", [Number.parseInt(value), filters.priceRange[1]])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Min Price" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No Min</SelectItem>
                        <SelectItem value="5000">$5,000</SelectItem>
                        <SelectItem value="10000">$10,000</SelectItem>
                        <SelectItem value="15000">$15,000</SelectItem>
                        <SelectItem value="20000">$20,000</SelectItem>
                        <SelectItem value="25000">$25,000</SelectItem>
                        <SelectItem value="30000">$30,000</SelectItem>
                        <SelectItem value="40000">$40,000</SelectItem>
                        <SelectItem value="50000">$50,000</SelectItem>
                        <SelectItem value="75000">$75,000</SelectItem>
                        <SelectItem value="100000">$100,000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      value={filters.priceRange[1].toString()}
                      onValueChange={(value) =>
                        updateFilter("priceRange", [filters.priceRange[0], Number.parseInt(value)])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Max Price" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10000">$10,000</SelectItem>
                        <SelectItem value="15000">$15,000</SelectItem>
                        <SelectItem value="20000">$20,000</SelectItem>
                        <SelectItem value="25000">$25,000</SelectItem>
                        <SelectItem value="30000">$30,000</SelectItem>
                        <SelectItem value="40000">$40,000</SelectItem>
                        <SelectItem value="50000">$50,000</SelectItem>
                        <SelectItem value="75000">$75,000</SelectItem>
                        <SelectItem value="100000">$100,000</SelectItem>
                        <SelectItem value="150000">$150,000</SelectItem>
                        <SelectItem value="200000">$200,000</SelectItem>
                        <SelectItem value="500000">No Max</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Year Range */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Year Range</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Select
                      value={filters.yearRange[0].toString()}
                      onValueChange={(value) =>
                        updateFilter("yearRange", [Number.parseInt(value), filters.yearRange[1]])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Min Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1990">1990</SelectItem>
                        <SelectItem value="1995">1995</SelectItem>
                        <SelectItem value="2000">2000</SelectItem>
                        <SelectItem value="2005">2005</SelectItem>
                        <SelectItem value="2010">2010</SelectItem>
                        <SelectItem value="2015">2015</SelectItem>
                        <SelectItem value="2018">2018</SelectItem>
                        <SelectItem value="2020">2020</SelectItem>
                        <SelectItem value="2021">2021</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      value={filters.yearRange[1].toString()}
                      onValueChange={(value) =>
                        updateFilter("yearRange", [filters.yearRange[0], Number.parseInt(value)])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Max Year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2000">2000</SelectItem>
                        <SelectItem value="2005">2005</SelectItem>
                        <SelectItem value="2010">2010</SelectItem>
                        <SelectItem value="2015">2015</SelectItem>
                        <SelectItem value="2018">2018</SelectItem>
                        <SelectItem value="2020">2020</SelectItem>
                        <SelectItem value="2021">2021</SelectItem>
                        <SelectItem value="2022">2022</SelectItem>
                        <SelectItem value="2023">2023</SelectItem>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Mileage Range */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Mileage Range</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <Select
                      value={filters.mileageRange[0].toString()}
                      onValueChange={(value) =>
                        updateFilter("mileageRange", [Number.parseInt(value), filters.mileageRange[1]])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Min Mileage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No Min</SelectItem>
                        <SelectItem value="5000">5,000 mi</SelectItem>
                        <SelectItem value="10000">10,000 mi</SelectItem>
                        <SelectItem value="25000">25,000 mi</SelectItem>
                        <SelectItem value="50000">50,000 mi</SelectItem>
                        <SelectItem value="75000">75,000 mi</SelectItem>
                        <SelectItem value="100000">100,000 mi</SelectItem>
                        <SelectItem value="150000">150,000 mi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select
                      value={filters.mileageRange[1].toString()}
                      onValueChange={(value) =>
                        updateFilter("mileageRange", [filters.mileageRange[0], Number.parseInt(value)])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Max Mileage" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5000">5,000 mi</SelectItem>
                        <SelectItem value="10000">10,000 mi</SelectItem>
                        <SelectItem value="25000">25,000 mi</SelectItem>
                        <SelectItem value="50000">50,000 mi</SelectItem>
                        <SelectItem value="75000">75,000 mi</SelectItem>
                        <SelectItem value="100000">100,000 mi</SelectItem>
                        <SelectItem value="150000">150,000 mi</SelectItem>
                        <SelectItem value="200000">200,000 mi</SelectItem>
                        <SelectItem value="300000">300,000 mi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Search Radius */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Search Radius</Label>
                <Slider
                  value={[filters.radius]}
                  onValueChange={(value) => updateFilter("radius", value[0])}
                  max={500}
                  min={5}
                  step={5}
                  className="mb-2"
                />
                <div className="text-center text-sm text-gray-600">Within {filters.radius} miles</div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Vehicle Details */}
      <Collapsible open={expandedSections.vehicle} onOpenChange={() => toggleSection("vehicle")}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Vehicle Details
                </div>
                {expandedSections.vehicle ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Makes */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Makes</Label>
                <div className="grid grid-cols-1 gap-3 max-h-40 overflow-y-auto">
                  {makes.map((make) => (
                    <div key={make} className="flex items-center space-x-3">
                      <Checkbox
                        id={`make-${make}`}
                        checked={filters.makes.includes(make)}
                        onCheckedChange={() => toggleArrayFilter("makes", make)}
                        className="flex-shrink-0"
                      />
                      <Label htmlFor={`make-${make}`} className="text-sm cursor-pointer flex-1 leading-none">
                        {make}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body Types */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Body Types</Label>
                <div className="grid grid-cols-1 gap-3">
                  {getCurrentBodyTypes().map((type: string) => (
                    <div key={type} className="flex items-center space-x-3">
                      <Checkbox
                        id={`body-${type}`}
                        checked={filters.bodyTypes.includes(type)}
                        onCheckedChange={() => toggleArrayFilter("bodyTypes", type)}
                        className="flex-shrink-0"
                      />
                      <Label htmlFor={`body-${type}`} className="text-sm cursor-pointer flex-1 leading-none">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fuel Types */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Fuel Types</Label>
                <div className="grid grid-cols-1 gap-3">
                  {fuelTypes.map((fuel) => (
                    <div key={fuel} className="flex items-center space-x-3">
                      <Checkbox
                        id={`fuel-${fuel}`}
                        checked={filters.fuelTypes.includes(fuel)}
                        onCheckedChange={() => toggleArrayFilter("fuelTypes", fuel)}
                        className="flex-shrink-0"
                      />
                      <Label htmlFor={`fuel-${fuel}`} className="text-sm cursor-pointer flex-1 leading-none">
                        {fuel}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transmissions */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Transmission</Label>
                <div className="grid grid-cols-1 gap-3">
                  {transmissions.map((trans) => (
                    <div key={trans} className="flex items-center space-x-3">
                      <Checkbox
                        id={`trans-${trans}`}
                        checked={filters.transmissions.includes(trans)}
                        onCheckedChange={() => toggleArrayFilter("transmissions", trans)}
                        className="flex-shrink-0"
                      />
                      <Label htmlFor={`trans-${trans}`} className="text-sm cursor-pointer flex-1 leading-none">
                        {trans}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drivetrains */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Drivetrain</Label>
                <div className="grid grid-cols-1 gap-3">
                  {drivetrains.map((drive) => (
                    <div key={drive} className="flex items-center space-x-3">
                      <Checkbox
                        id={`drive-${drive}`}
                        checked={filters.drivetrains.includes(drive)}
                        onCheckedChange={() => toggleArrayFilter("drivetrains", drive)}
                        className="flex-shrink-0"
                      />
                      <Label htmlFor={`drive-${drive}`} className="text-sm cursor-pointer flex-1 leading-none">
                        {drive}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Condition & Features */}
      <Collapsible open={expandedSections.condition} onOpenChange={() => toggleSection("condition")}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Condition & Features
                </div>
                {expandedSections.condition ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Conditions */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Condition</Label>
                <div className="grid grid-cols-1 gap-3">
                  {conditions.map((condition) => (
                    <div key={condition} className="flex items-center space-x-3">
                      <Checkbox
                        id={`condition-${condition}`}
                        checked={filters.conditions.includes(condition)}
                        onCheckedChange={() => toggleArrayFilter("conditions", condition)}
                        className="flex-shrink-0"
                      />
                      <Label htmlFor={`condition-${condition}`} className="text-sm cursor-pointer flex-1 leading-none">
                        {condition}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Colors</Label>
                <div className="grid grid-cols-1 gap-3 max-h-32 overflow-y-auto">
                  {colors.map((color) => (
                    <div key={color} className="flex items-center space-x-3">
                      <Checkbox
                        id={`color-${color}`}
                        checked={filters.colors.includes(color)}
                        onCheckedChange={() => toggleArrayFilter("colors", color)}
                        className="flex-shrink-0"
                      />
                      <Label htmlFor={`color-${color}`} className="text-sm cursor-pointer flex-1 leading-none">
                        {color}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Features</Label>
                <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
                  {getCurrentFeatures().map((feature: string) => (
                    <div key={feature} className="flex items-center space-x-3">
                      <Checkbox
                        id={`feature-${feature}`}
                        checked={filters.features.includes(feature)}
                        onCheckedChange={() => toggleArrayFilter("features", feature)}
                        className="flex-shrink-0"
                      />
                      <Label htmlFor={`feature-${feature}`} className="text-sm cursor-pointer flex-1 leading-none">
                        {feature}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Location */}
      <Collapsible open={expandedSections.location} onOpenChange={() => toggleSection("location")}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location & Distance
                </div>
                {expandedSections.location ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Location */}
              <div>
                <Label htmlFor="location" className="text-sm font-medium mb-3 block">
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="Enter city, state, or ZIP code"
                  value={
                    filters.location || (selectedLocation ? `${selectedLocation.city}, ${selectedLocation.state}` : "")
                  }
                  onChange={(e) => updateFilter("location", e.target.value)}
                />
                {selectedLocation && !filters.location && (
                  <p className="text-xs text-gray-500 mt-1">
                    Using your selected location: {selectedLocation.city}, {selectedLocation.state}
                  </p>
                )}
              </div>

              {/* Distance Sorting Options */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Sort by Distance</Label>
                <Select
                  value={filters.distanceSort || "relevance"}
                  onValueChange={(value) => updateFilter("distanceSort", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by relevance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Sort by relevance</SelectItem>
                    <SelectItem value="distance-asc">Distance: Nearest first</SelectItem>
                    <SelectItem value="distance-desc">Distance: Farthest first</SelectItem>
                    <SelectItem value="price-asc">Price: Low to high</SelectItem>
                    <SelectItem value="price-desc">Price: High to low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Show Distance on Listings Toggle */}
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="show-distance"
                  checked={filters.showDistance !== false}
                  onCheckedChange={(checked) => updateFilter("showDistance", checked)}
                  className="flex-shrink-0"
                />
                <Label htmlFor="show-distance" className="text-sm cursor-pointer flex-1 leading-none">
                  Show distance on listing cards
                </Label>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Seller Preferences - Updated to remove dealer options */}
      <Collapsible open={expandedSections.seller} onOpenChange={() => toggleSection("seller")}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Seller Preferences
                </div>
                {expandedSections.seller ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Seller Options - No dealer types since this is private party only */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="negotiable"
                    checked={filters.negotiable === true}
                    onCheckedChange={(checked) => updateFilter("negotiable", checked ? true : null)}
                    className="flex-shrink-0"
                  />
                  <Label htmlFor="negotiable" className="text-sm cursor-pointer flex-1 leading-none">
                    Price Negotiable
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="trade"
                    checked={filters.tradeConsidered === true}
                    onCheckedChange={(checked) => updateFilter("tradeConsidered", checked ? true : null)}
                    className="flex-shrink-0"
                  />
                  <Label htmlFor="trade" className="text-sm cursor-pointer flex-1 leading-none">
                    Trade Considered
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="financing"
                    checked={filters.financingAvailable === true}
                    onCheckedChange={(checked) => updateFilter("financingAvailable", checked ? true : null)}
                    className="flex-shrink-0"
                  />
                  <Label htmlFor="financing" className="text-sm cursor-pointer flex-1 leading-none">
                    Financing Available
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="verified"
                    checked={filters.verifiedSellers}
                    onCheckedChange={(checked) => updateFilter("verifiedSellers", checked)}
                    className="flex-shrink-0"
                  />
                  <Label htmlFor="verified" className="text-sm cursor-pointer flex-1 leading-none">
                    Verified Sellers Only
                  </Label>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Advanced Options */}
      <Collapsible open={expandedSections.advanced} onOpenChange={() => toggleSection("advanced")}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Advanced Options
                </div>
                {expandedSections.advanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Listing Age */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Listing Age</Label>
                <Select value={filters.listingAge} onValueChange={(value) => updateFilter("listingAge", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any time</SelectItem>
                    <SelectItem value="1">Last 24 hours</SelectItem>
                    <SelectItem value="7">Last week</SelectItem>
                    <SelectItem value="30">Last month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Photo Count */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Minimum Photos</Label>
                <Select value={filters.photoCount} onValueChange={(value) => updateFilter("photoCount", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any amount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any amount</SelectItem>
                    <SelectItem value="1">At least 1 photo</SelectItem>
                    <SelectItem value="5">At least 5 photos</SelectItem>
                    <SelectItem value="10">At least 10 photos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle Category Specific Filters */}
              {vehicleCategory === "cars-trucks" && (
                <>
                  {/* Engine Size */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Engine Size (L)</Label>
                    <Slider
                      value={filters.engineSizeRange}
                      onValueChange={(value) => updateFilter("engineSizeRange", value)}
                      max={8.0}
                      min={1.0}
                      step={0.1}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{filters.engineSizeRange[0]}L</span>
                      <span>{filters.engineSizeRange[1]}L</span>
                    </div>
                  </div>

                  {/* Doors */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Number of Doors</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {["2", "3", "4", "5+"].map((doors) => (
                        <div key={doors} className="flex items-center space-x-3">
                          <Checkbox
                            id={`doors-${doors}`}
                            checked={filters.doors.includes(doors)}
                            onCheckedChange={() => toggleArrayFilter("doors", doors)}
                            className="flex-shrink-0"
                          />
                          <Label htmlFor={`doors-${doors}`} className="text-sm cursor-pointer flex-1 leading-none">
                            {doors}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seating Capacity */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Seating Capacity</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {["2", "4", "5", "7", "8+"].map((seats) => (
                        <div key={seats} className="flex items-center space-x-3">
                          <Checkbox
                            id={`seats-${seats}`}
                            checked={filters.seatingCapacity.includes(seats)}
                            onCheckedChange={() => toggleArrayFilter("seatingCapacity", seats)}
                            className="flex-shrink-0"
                          />
                          <Label htmlFor={`seats-${seats}`} className="text-sm cursor-pointer flex-1 leading-none">
                            {seats}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {vehicleCategory === "rvs" && (
                <>
                  {/* RV Length */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">RV Length (ft)</Label>
                    <Slider
                      value={filters.rvLength}
                      onValueChange={(value) => updateFilter("rvLength", value)}
                      max={45}
                      min={10}
                      step={1}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{filters.rvLength[0]} ft</span>
                      <span>{filters.rvLength[1]} ft</span>
                    </div>
                  </div>

                  {/* Slide Outs */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Slide Outs</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {["0", "1", "2", "3+"].map((slides) => (
                        <div key={slides} className="flex items-center space-x-3">
                          <Checkbox
                            id={`slides-${slides}`}
                            checked={filters.slideOuts.includes(slides)}
                            onCheckedChange={() => toggleArrayFilter("slideOuts", slides)}
                            className="flex-shrink-0"
                          />
                          <Label htmlFor={`slides-${slides}`} className="text-sm cursor-pointer flex-1 leading-none">
                            {slides}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {vehicleCategory === "motorcycles" && (
                <>
                  {/* Engine CC */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Engine Size (CC)</Label>
                    <Slider
                      value={filters.engineCC}
                      onValueChange={(value) => updateFilter("engineCC", value)}
                      max={2000}
                      min={50}
                      step={25}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{filters.engineCC[0]} CC</span>
                      <span>{filters.engineCC[1]} CC</span>
                    </div>
                  </div>
                </>
              )}

              {vehicleCategory === "boats" && (
                <>
                  {/* Boat Length */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Boat Length (ft)</Label>
                    <Slider
                      value={filters.boatLength}
                      onValueChange={(value) => updateFilter("boatLength", value)}
                      max={100}
                      min={10}
                      step={1}
                      className="mb-2"
                    />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{filters.boatLength[0]} ft</span>
                      <span>{filters.boatLength[1]} ft</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Clear All Filters */}
      <div className="flex justify-between items-center pt-4">
        <div className="text-sm text-gray-600">
          {getActiveFilterCount() > 0 && (
            <span>
              {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? "s" : ""} applied
            </span>
          )}
        </div>
        <Button variant="outline" onClick={clearAllFilters} disabled={getActiveFilterCount() === 0}>
          Clear All Filters
        </Button>
      </div>
    </div>
  )
}

export default AdvancedFilters
