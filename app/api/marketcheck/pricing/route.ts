import { NextResponse } from "next/server"

interface VehicleData {
  make: string
  model: string
  year: number
  mileage: number
  condition?: string
  zipCode: string
  trim?: string
  bodyType?: string
  drivetrain?: string
  fuelType?: string
  transmission?: string
  vin?: string
  locationData?: {
    city: string
    state: string
    zipCode: string
    lat: number
    lng: number
  }
}

export async function POST(request: Request) {
  try {
    const vehicleData: VehicleData = await request.json()

    // Enhanced pricing calculation
    const basePrice = calculateEnhancedBasePrice(vehicleData)
    const mileageAdjustment = calculateMileageAdjustment(vehicleData.mileage, vehicleData.year)
    const locationAdjustment = calculateLocationAdjustment(vehicleData.zipCode)
    const trimAdjustment = vehicleData.trim ? calculateTrimAdjustment(vehicleData.trim, basePrice) : 0
    const marketConditionAdjustment = calculateMarketConditionAdjustment(vehicleData)

    const adjustedPrice = Math.max(
      basePrice + mileageAdjustment + locationAdjustment + trimAdjustment + marketConditionAdjustment,
      3000,
    )

    const conditionAdjusted = {
      excellent: Math.round(adjustedPrice * 1.18),
      good: Math.round(adjustedPrice * 1.02),
      fair: Math.round(adjustedPrice * 0.82),
      poor: Math.round(adjustedPrice * 0.58),
    }

    const saleTypeAdjusted = {
      dealer: Math.round(adjustedPrice * 1.12),
      private: Math.round(adjustedPrice * 0.94),
      auction: Math.round(adjustedPrice * 0.78),
    }

    const comparableVehicles = generateLocationBasedComparableVehicles(vehicleData, adjustedPrice)
    const trends = generateRealisticTrends(vehicleData)

    const pricingResponse = {
      vehicleId: `enhanced-${vehicleData.make}-${vehicleData.model}-${vehicleData.year}`,
      pricing: {
        averagePrice: adjustedPrice,
        medianPrice: Math.round(adjustedPrice * 0.97),
        priceRange: {
          min: Math.round(adjustedPrice * 0.72),
          max: Math.round(adjustedPrice * 1.28),
          q1: Math.round(adjustedPrice * 0.86),
          q3: Math.round(adjustedPrice * 1.14),
        },
        conditionAdjusted,
        saleTypeAdjusted,
      },
      marketData: {
        totalListings: calculateRealisticListingCount(vehicleData),
        averageDaysOnMarket: calculateAverageDaysOnMarket(vehicleData),
        priceDistribution: generateRealisticPriceDistribution(adjustedPrice),
        geographicData: {
          localAverage: adjustedPrice,
          nationalAverage: Math.round(adjustedPrice * (0.96 + Math.random() * 0.08)),
          regionPremium: Math.round(adjustedPrice * (Math.random() * 0.08 - 0.04)),
        },
        trends,
      },
      comparableVehicles,
    }

    return NextResponse.json({
      pricing: pricingResponse,
      fallback: true,
      message: "Using enhanced pricing algorithm with location data",
    })
  } catch (error) {
    console.error("Error in pricing API:", error)

    return NextResponse.json(
      {
        error: "Failed to calculate pricing",
        message: "Please check your vehicle data and try again",
      },
      { status: 500 },
    )
  }
}

// Helper functions
function calculateEnhancedBasePrice(vehicleData: VehicleData): number {
  const currentYear = new Date().getFullYear()
  const age = currentYear - vehicleData.year

  // Brand value mapping
  const brandValues: { [key: string]: { base: number; depreciation: number } } = {
    toyota: { base: 33000, depreciation: 0.11 },
    honda: { base: 31000, depreciation: 0.12 },
    ford: { base: 30000, depreciation: 0.16 },
    chevrolet: { base: 29000, depreciation: 0.17 },
    bmw: { base: 58000, depreciation: 0.22 },
    "mercedes-benz": { base: 65000, depreciation: 0.24 },
    audi: { base: 52000, depreciation: 0.21 },
    lexus: { base: 48000, depreciation: 0.14 },
    tesla: { base: 68000, depreciation: 0.28 },
    nissan: { base: 27000, depreciation: 0.17 },
    hyundai: { base: 26000, depreciation: 0.18 },
    kia: { base: 25000, depreciation: 0.17 },
  }

  const makeKey = vehicleData.make.toLowerCase().replace(/\s+/g, "-")
  const brandData = brandValues[makeKey] || { base: 28000, depreciation: 0.16 }

  let basePrice = brandData.base

  // Model-specific adjustments
  const modelMultiplier = getModelMultiplier(vehicleData.make, vehicleData.model)
  basePrice *= modelMultiplier

  // Apply depreciation
  const depreciatedPrice = basePrice * Math.pow(1 - brandData.depreciation, age)

  return Math.max(depreciatedPrice, 3000)
}

function getModelMultiplier(make: string, model: string): number {
  const modelAdjustments: { [key: string]: { [key: string]: number } } = {
    Toyota: {
      "4Runner": 1.25,
      Tacoma: 1.18,
      RAV4: 1.08,
      Camry: 1.0,
      Corolla: 0.92,
    },
    Honda: {
      "CR-V": 1.08,
      Pilot: 1.12,
      Accord: 1.0,
      Civic: 0.95,
    },
    Ford: {
      "F-150": 1.25,
      Mustang: 1.1,
      Explorer: 1.05,
      Escape: 0.98,
    },
    BMW: {
      "3 Series": 1.0,
      "5 Series": 1.15,
      X5: 1.18,
      X3: 1.08,
    },
    Tesla: {
      "Model Y": 1.08,
      "Model S": 1.25,
      "Model 3": 0.95,
    },
  }

  return modelAdjustments[make]?.[model] || 1.0
}

function calculateMileageAdjustment(mileage: number, year: number): number {
  const currentYear = new Date().getFullYear()
  const age = currentYear - year
  const expectedMileage = age * 12000
  const mileageDifference = mileage - expectedMileage

  const adjustment = -mileageDifference * 0.12
  return Math.round(Math.max(Math.min(adjustment, 5000), -12000))
}

function calculateLocationAdjustment(zipCode: string): number {
  const locationAdjustments: { [key: string]: number } = {
    "90": 4500, // CA
    "10": 3800, // NY
    "94": 5200, // SF
    "02": 3200, // Boston
    "20": 2800, // DC
    "33": 2200, // Miami
    "60": 1500, // Chicago
    "77": 800, // Houston
    "98": 2800, // Seattle
    "30": 1200, // Atlanta
    "85": 600, // Phoenix
    "80": 2000, // Denver
  }

  if (!zipCode || zipCode.length < 2) return 0

  const zipPrefix = zipCode.substring(0, 2)
  return locationAdjustments[zipPrefix] || 0
}

function calculateTrimAdjustment(trim: string, basePrice: number): number {
  const trimMultipliers: { [key: string]: number } = {
    base: 0.88,
    l: 0.9,
    le: 0.94,
    se: 0.98,
    xle: 1.04,
    limited: 1.12,
    platinum: 1.18,
    premium: 1.15,
    sport: 1.05,
    touring: 1.14,
    performance: 1.2,
    m: 1.35,
    amg: 1.4,
    raptor: 1.35,
    "trd pro": 1.25,
  }

  const trimKey = trim.toLowerCase().replace(/\s+/g, " ").trim()
  let multiplier = trimMultipliers[trimKey] || 1.0

  // Check for partial matches
  if (multiplier === 1.0) {
    for (const [key, value] of Object.entries(trimMultipliers)) {
      if (trimKey.includes(key) || key.includes(trimKey)) {
        multiplier = value
        break
      }
    }
  }

  return Math.round(basePrice * (multiplier - 1))
}

function calculateMarketConditionAdjustment(vehicleData: VehicleData): number {
  const currentYear = new Date().getFullYear()
  const age = currentYear - vehicleData.year

  if (vehicleData.make === "Tesla" || vehicleData.fuelType === "electric") {
    return Math.round((Math.random() - 0.5) * 2000)
  }

  const luxuryBrands = ["BMW", "Mercedes-Benz", "Audi", "Lexus", "Cadillac"]
  if (luxuryBrands.includes(vehicleData.make)) {
    return Math.round((Math.random() - 0.5) * 1500)
  }

  if (age > 10) {
    return Math.round((Math.random() - 0.5) * 500)
  }

  return Math.round((Math.random() - 0.5) * 1000)
}

function calculateRealisticListingCount(vehicleData: VehicleData): number {
  const popularMakes = ["Toyota", "Honda", "Ford", "Chevrolet"]
  const luxuryMakes = ["BMW", "Mercedes-Benz", "Audi", "Lexus"]

  let baseCount = 30

  if (popularMakes.includes(vehicleData.make)) {
    baseCount = 45
  } else if (luxuryMakes.includes(vehicleData.make)) {
    baseCount = 20
  }

  const currentYear = new Date().getFullYear()
  const age = currentYear - vehicleData.year

  if (age <= 3) baseCount *= 1.5
  else if (age <= 7) baseCount *= 1.2
  else if (age > 15) baseCount *= 0.6

  return Math.floor(baseCount + Math.random() * 20)
}

function calculateAverageDaysOnMarket(vehicleData: VehicleData): number {
  const luxuryBrands = ["BMW", "Mercedes-Benz", "Audi", "Porsche", "Jaguar"]
  const popularBrands = ["Toyota", "Honda", "Ford"]

  let baseDays = 35

  if (luxuryBrands.includes(vehicleData.make)) {
    baseDays = 45
  } else if (popularBrands.includes(vehicleData.make)) {
    baseDays = 28
  }

  return Math.floor(baseDays + Math.random() * 20)
}

function generateRealisticTrends(vehicleData: VehicleData) {
  const currentYear = new Date().getFullYear()
  const age = currentYear - vehicleData.year

  if (vehicleData.make === "Tesla" || vehicleData.fuelType === "electric") {
    return {
      priceChange30Days: Math.round((Math.random() - 0.3) * 2000),
      priceChange90Days: Math.round((Math.random() - 0.4) * 4000),
      inventoryChange: Math.round((Math.random() - 0.2) * 30),
    }
  }

  return {
    priceChange30Days: Math.round((Math.random() - 0.5) * 1000),
    priceChange90Days: Math.round((Math.random() - 0.5) * 2000),
    inventoryChange: Math.round((Math.random() - 0.5) * 20),
  }
}

function generateLocationBasedComparableVehicles(vehicleData: VehicleData, basePrice: number) {
  const comparables = []

  for (let i = 0; i < 10; i++) {
    const priceVariation = 0.75 + Math.random() * 0.5
    const mileageVariation = 0.6 + Math.random() * 0.8
    const yearVariation = Math.floor(Math.random() * 4) - 2

    const adjustedYear = Math.max(vehicleData.year + yearVariation, 2000)
    const adjustedMileage = Math.max(Math.round(vehicleData.mileage * mileageVariation), 1000)
    const distance = Math.floor(Math.random() * 75) + 3

    comparables.push({
      id: `comparable-${i}`,
      price: Math.round(basePrice * priceVariation),
      mileage: adjustedMileage,
      year: adjustedYear,
      daysOnMarket: Math.floor(Math.random() * 80) + 5,
      location: `City ${i + 1}, ${vehicleData.locationData?.state || "CA"}`,
      dealer: Math.random() > 0.4 ? "Private Seller" : `${vehicleData.make} Dealer`,
      distance: distance,
    })
  }

  return comparables.sort((a, b) => a.distance - b.distance)
}

function generateRealisticPriceDistribution(adjustedPrice: number) {
  return [
    {
      priceRange: `$${Math.round((adjustedPrice * 0.72) / 1000)}k - $${Math.round((adjustedPrice * 0.82) / 1000)}k`,
      count: Math.floor(Math.random() * 8) + 3,
      percentage: 12,
    },
    {
      priceRange: `$${Math.round((adjustedPrice * 0.82) / 1000)}k - $${Math.round((adjustedPrice * 0.92) / 1000)}k`,
      count: Math.floor(Math.random() * 12) + 8,
      percentage: 22,
    },
    {
      priceRange: `$${Math.round((adjustedPrice * 0.92) / 1000)}k - $${Math.round((adjustedPrice * 1.08) / 1000)}k`,
      count: Math.floor(Math.random() * 18) + 12,
      percentage: 32,
    },
    {
      priceRange: `$${Math.round((adjustedPrice * 1.08) / 1000)}k - $${Math.round((adjustedPrice * 1.18) / 1000)}k`,
      count: Math.floor(Math.random() * 12) + 8,
      percentage: 24,
    },
    {
      priceRange: `$${Math.round((adjustedPrice * 1.18) / 1000)}k - $${Math.round((adjustedPrice * 1.28) / 1000)}k`,
      count: Math.floor(Math.random() * 8) + 3,
      percentage: 10,
    },
  ]
}
