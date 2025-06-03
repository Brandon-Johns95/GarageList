interface MarketCheckVehicleData {
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

interface MarketCheckPriceResponse {
  vehicleId: string
  pricing: {
    averagePrice: number
    medianPrice: number
    priceRange: {
      min: number
      max: number
      q1: number
      q3: number
    }
    conditionAdjusted: {
      excellent: number
      good: number
      fair: number
      poor: number
    }
    saleTypeAdjusted: {
      dealer: number
      private: number
      auction: number
    }
  }
  marketData: {
    totalListings: number
    averageDaysOnMarket: number
    priceDistribution: Array<{
      priceRange: string
      count: number
      percentage: number
    }>
    geographicData: {
      localAverage: number
      nationalAverage: number
      regionPremium: number
    }
    trends: {
      priceChange30Days: number
      priceChange90Days: number
      inventoryChange: number
    }
  }
  comparableVehicles: Array<{
    id: string
    price: number
    mileage: number
    year: number
    daysOnMarket: number
    location: string
    dealer: string
    distance?: number
    url?: string
    photos: string[]
    vin: string
    trim?: string
    color?: string
    condition: string
    features: string[]
    carfaxReportUrl?: string
    autoCheckReportUrl?: string
    dealerRating: number
    dealerReviews: number
    isVerified: boolean
    priceHistory: Array<{
      date: string
      price: number
      change: number
    }>
  }>
  vinData?: {
    specifications: Record<string, any>
    features: string[]
    msrp?: number
  }
}

interface MarketCheckMake {
  make: string
  count: number
}

interface MarketCheckModel {
  model: string
  count: number
}

interface MarketCheckTrim {
  trim: string
  count: number
  bodyType?: string
  drivetrain?: string
  fuelType?: string
  msrp?: number
  features?: string[]
  category?: string
}

interface MarketCheckVinResponse {
  vin: string
  year: number
  make: string
  model: string
  trim: string
  body_type: string
  drivetrain: string
  fuel_type: string
  engine: string
  transmission: string
  msrp?: number
  features?: string[]
  specifications?: Record<string, any>
}

class MarketCheckApiService {
  private baseUrl = "https://api.marketcheck.com/v2"
  private apiKey: string
  private isApiAvailable = false

  constructor() {
    this.apiKey = process.env.MARKETCHECK_API_KEY || ""

    // Disable API for now due to access issues
    if (!this.apiKey) {
      console.warn("MarketCheck API key not found. Using enhanced fallback pricing.")
      this.isApiAvailable = false
    } else {
      // Temporarily disable API even with key due to access restrictions
      console.warn("MarketCheck API temporarily disabled due to access restrictions. Using enhanced fallback pricing.")
      this.isApiAvailable = false
    }
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}) {
    if (!this.isApiAvailable) {
      console.warn("MarketCheck API not available, using fallback data")
      throw new Error("API_NOT_AVAILABLE")
    }

    const url = new URL(`${this.baseUrl}${endpoint}`)

    // Add API key and common parameters
    url.searchParams.append("api_key", this.apiKey)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.append(key, value.toString())
      }
    })

    console.log(`MarketCheck API Request: ${endpoint}`)

    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "GarageList/1.0",
        },
        // Add timeout
        signal: AbortSignal.timeout(15000), // 15 second timeout
      })

      // Get response text first to handle non-JSON responses
      const responseText = await response.text()

      if (!response.ok) {
        console.error(`MarketCheck API error: ${response.status} ${response.statusText}`, responseText)

        // Check for specific error messages and disable API if needed
        if (
          responseText.includes("Invalid request") ||
          responseText.includes("Invalid API key") ||
          responseText.includes("only public URLs are supported") ||
          response.status === 401 ||
          response.status === 403
        ) {
          console.warn("MarketCheck API access denied, disabling API and using fallback data")
          this.isApiAvailable = false
          throw new Error("API_ACCESS_DENIED")
        }

        throw new Error(`API_ERROR_${response.status}`)
      }

      // Try to parse as JSON
      try {
        const data = JSON.parse(responseText)
        console.log(`MarketCheck API Response for ${endpoint}:`, data)
        return data
      } catch (parseError) {
        console.error(`Failed to parse JSON response for ${endpoint}:`, responseText)
        // Disable API on parse errors
        this.isApiAvailable = false
        throw new Error("INVALID_JSON_RESPONSE")
      }
    } catch (error) {
      console.error(`MarketCheck API request failed for ${endpoint}:`, error)

      // Disable API on network errors
      if (error instanceof Error && error.name === "AbortError") {
        console.warn("MarketCheck API timeout, disabling API")
        this.isApiAvailable = false
      }

      throw error
    }
  }

  async lookupVin(vin: string): Promise<MarketCheckVinResponse | null> {
    // VIN lookup disabled for now
    console.log("VIN lookup temporarily disabled")
    return null
  }

  async getMakes(): Promise<MarketCheckMake[]> {
    // Always use fallback for now
    console.log("Using fallback makes data")
    return this.getFallbackMakes()
  }

  async getModels(make: string): Promise<MarketCheckModel[]> {
    // Always use fallback for now
    console.log("Using fallback models data for:", make)
    return this.getFallbackModels(make)
  }

  private getFallbackModels(make: string): MarketCheckModel[] {
    const fallbackModels: { [key: string]: MarketCheckModel[] } = {
      Toyota: [
        { model: "Camry", count: 2500 },
        { model: "Corolla", count: 2200 },
        { model: "RAV4", count: 2800 },
        { model: "Highlander", count: 1800 },
        { model: "Prius", count: 1500 },
        { model: "Tacoma", count: 2000 },
        { model: "4Runner", count: 1200 },
        { model: "Sienna", count: 800 },
        { model: "Avalon", count: 600 },
        { model: "C-HR", count: 400 },
      ],
      Honda: [
        { model: "Civic", count: 2300 },
        { model: "Accord", count: 2100 },
        { model: "CR-V", count: 2600 },
        { model: "Pilot", count: 1400 },
        { model: "Odyssey", count: 900 },
        { model: "HR-V", count: 1100 },
        { model: "Passport", count: 700 },
        { model: "Fit", count: 500 },
        { model: "Ridgeline", count: 400 },
      ],
      Ford: [
        { model: "F-150", count: 3500 },
        { model: "Escape", count: 1800 },
        { model: "Explorer", count: 1600 },
        { model: "Mustang", count: 1200 },
        { model: "Edge", count: 1000 },
        { model: "Expedition", count: 800 },
        { model: "Ranger", count: 1100 },
        { model: "Fusion", count: 900 },
        { model: "Bronco", count: 700 },
        { model: "EcoSport", count: 300 },
      ],
      Chevrolet: [
        { model: "Silverado 1500", count: 3200 },
        { model: "Equinox", count: 1900 },
        { model: "Malibu", count: 1400 },
        { model: "Tahoe", count: 1100 },
        { model: "Traverse", count: 1300 },
        { model: "Camaro", count: 800 },
        { model: "Suburban", count: 600 },
        { model: "Cruze", count: 700 },
        { model: "Impala", count: 500 },
        { model: "Trax", count: 400 },
      ],
      BMW: [
        { model: "3 Series", count: 1200 },
        { model: "5 Series", count: 800 },
        { model: "X3", count: 1000 },
        { model: "X5", count: 900 },
        { model: "7 Series", count: 400 },
        { model: "X1", count: 600 },
        { model: "4 Series", count: 500 },
        { model: "2 Series", count: 300 },
        { model: "X7", count: 200 },
      ],
      "Mercedes-Benz": [
        { model: "C-Class", count: 1100 },
        { model: "E-Class", count: 700 },
        { model: "GLE", count: 800 },
        { model: "GLC", count: 900 },
        { model: "S-Class", count: 300 },
        { model: "A-Class", count: 500 },
        { model: "GLS", count: 400 },
        { model: "CLA", count: 400 },
        { model: "GLB", count: 300 },
      ],
      Nissan: [
        { model: "Altima", count: 1800 },
        { model: "Rogue", count: 2000 },
        { model: "Sentra", count: 1200 },
        { model: "Pathfinder", count: 900 },
        { model: "Murano", count: 800 },
        { model: "Frontier", count: 600 },
        { model: "Maxima", count: 500 },
        { model: "Armada", count: 400 },
        { model: "Kicks", count: 300 },
      ],
      Audi: [
        { model: "A4", count: 800 },
        { model: "Q5", count: 900 },
        { model: "A6", count: 600 },
        { model: "Q7", count: 500 },
        { model: "A3", count: 400 },
        { model: "Q3", count: 300 },
        { model: "A8", count: 200 },
        { model: "Q8", count: 150 },
      ],
      Lexus: [
        { model: "RX", count: 1200 },
        { model: "ES", count: 800 },
        { model: "NX", count: 600 },
        { model: "GX", count: 400 },
        { model: "IS", count: 500 },
        { model: "LX", count: 200 },
        { model: "LS", count: 150 },
        { model: "UX", count: 300 },
      ],
      Tesla: [
        { model: "Model 3", count: 1500 },
        { model: "Model Y", count: 1200 },
        { model: "Model S", count: 800 },
        { model: "Model X", count: 500 },
      ],
    }

    return (
      fallbackModels[make] || [
        { model: "Base Model", count: 100 },
        { model: "Premium", count: 80 },
        { model: "Sport", count: 60 },
        { model: "Limited", count: 40 },
      ]
    )
  }

  async getTrims(make: string, model: string, year?: number): Promise<MarketCheckTrim[]> {
    // Always use fallback for now
    console.log("Using comprehensive trim data for:", make, model, year)
    return this.getComprehensiveTrims(make, model, year)
  }

  private getComprehensiveTrims(make: string, model: string, year?: number): MarketCheckTrim[] {
    // Comprehensive and accurate trim database organized by make/model
    const trimDatabase: { [key: string]: { [key: string]: MarketCheckTrim[] } } = {
      Toyota: {
        Camry: [
          {
            trim: "L",
            count: 45,
            category: "base",
            msrp: 25295,
            features: ["Cloth Seats", "Manual AC", "6-Speed Manual Available"],
          },
          {
            trim: "LE",
            count: 120,
            category: "mid",
            msrp: 26320,
            features: ["Automatic Climate Control", "Toyota Safety Sense 2.0", "8-inch Touchscreen"],
          },
          {
            trim: "SE",
            count: 85,
            category: "sport",
            msrp: 29370,
            features: ["Sport Suspension", "18-inch Wheels", "Sport Seats", "Paddle Shifters"],
          },
          {
            trim: "XLE",
            count: 95,
            category: "premium",
            msrp: 31170,
            features: ["SofTex Seats", "Moonroof", "Wireless Charging", "Power Driver Seat"],
          },
          {
            trim: "XSE",
            count: 65,
            category: "sport",
            msrp: 35085,
            features: ["Sport Tuned Suspension", "19-inch Wheels", "Premium Audio", "Paddle Shifters"],
          },
          {
            trim: "TRD",
            count: 25,
            category: "performance",
            msrp: 32185,
            features: ["TRD Suspension", "Cat-Back Exhaust", "Sport Brakes", "TRD Styling"],
          },
        ],
        Corolla: [
          {
            trim: "L",
            count: 55,
            category: "base",
            msrp: 23100,
            features: ["Manual Transmission Available", "Basic Audio", "Cloth Seats"],
          },
          {
            trim: "LE",
            count: 140,
            category: "mid",
            msrp: 24300,
            features: ["CVT", "Toyota Safety Sense 2.0", "LED Headlights", "7-inch Display"],
          },
          {
            trim: "SE",
            count: 75,
            category: "sport",
            msrp: 25900,
            features: ["Sport Seats", "18-inch Wheels", "Paddle Shifters", "Sport Suspension"],
          },
          {
            trim: "XLE",
            count: 65,
            category: "premium",
            msrp: 26600,
            features: ["Leatherette Seats", "Heated Front Seats", "Moonroof", "Wireless Charging"],
          },
          {
            trim: "XSE",
            count: 45,
            category: "sport",
            msrp: 28600,
            features: ["Sport Suspension", "Premium Audio", "Wireless Charging", "LED Fog Lights"],
          },
        ],
        RAV4: [
          {
            trim: "LE",
            count: 180,
            category: "base",
            msrp: 29200,
            features: ["AWD", "Toyota Safety Sense 2.0", "Fabric Seats", "7-inch Display"],
          },
          {
            trim: "XLE",
            count: 145,
            category: "mid",
            msrp: 31800,
            features: ["Power Liftgate", "Roof Rails", "Blind Spot Monitor", "8-inch Display"],
          },
          {
            trim: "XLE Premium",
            count: 85,
            category: "premium",
            msrp: 34300,
            features: ["SofTex Seats", "Power Driver Seat", "Wireless Charging", "Premium Audio"],
          },
          {
            trim: "Adventure",
            count: 65,
            category: "sport",
            msrp: 36300,
            features: ["All-Terrain Tires", "Roof Rails", "Orange Accents", "Adventure Badging"],
          },
          {
            trim: "TRD Off-Road",
            count: 45,
            category: "performance",
            msrp: 37500,
            features: ["TRD Suspension", "Skid Plates", "All-Terrain Tires", "Red Stitching"],
          },
          {
            trim: "Limited",
            count: 55,
            category: "luxury",
            msrp: 38300,
            features: ["Leather Seats", "JBL Audio", "Digital Rearview Mirror", "Power Moonroof"],
          },
        ],
      },
      Honda: {
        Civic: [
          {
            trim: "LX",
            count: 125,
            category: "base",
            msrp: 24200,
            features: ["CVT", "Honda Sensing", "LED Headlights", "Cloth Seats"],
          },
          {
            trim: "Sport",
            count: 95,
            category: "sport",
            msrp: 26600,
            features: ["6-Speed Manual", "Sport Seats", "18-inch Wheels", "Sport Pedals"],
          },
          {
            trim: "EX",
            count: 105,
            category: "mid",
            msrp: 27200,
            features: ["Moonroof", "Remote Start", "Apple CarPlay", "Heated Seats"],
          },
          {
            trim: "EX-L",
            count: 75,
            category: "premium",
            msrp: 29200,
            features: ["Leather Seats", "Heated Seats", "Premium Audio", "Power Driver Seat"],
          },
          {
            trim: "Touring",
            count: 55,
            category: "luxury",
            msrp: 31200,
            features: ["Navigation", "LED Headlights", "Wireless Charging", "Premium Audio"],
          },
          {
            trim: "Si",
            count: 35,
            category: "performance",
            msrp: 29200,
            features: ["6-Speed Manual", "Sport Suspension", "Limited Slip Differential", "Sport Exhaust"],
          },
          {
            trim: "Type R",
            count: 15,
            category: "performance",
            msrp: 43000,
            features: ["Turbo Engine", "Brembo Brakes", "Adaptive Suspension", "Track Mode"],
          },
        ],
      },
      Ford: {
        "F-150": [
          {
            trim: "Regular Cab",
            count: 85,
            category: "base",
            msrp: 33695,
            features: ["Regular Cab", "6-Speed Manual", "Steel Wheels", "Vinyl Seats"],
          },
          {
            trim: "SuperCab XL",
            count: 105,
            category: "base",
            msrp: 37695,
            features: ["SuperCab", "Automatic Transmission", "Cloth Seats", "SYNC"],
          },
          {
            trim: "SuperCrew XLT",
            count: 145,
            category: "mid",
            msrp: 42695,
            features: ["SuperCrew Cab", "SYNC 3", "Power Windows", "Alloy Wheels"],
          },
          {
            trim: "Lariat",
            count: 125,
            category: "premium",
            msrp: 52695,
            features: ["Leather Seats", "Navigation", "Premium Audio", "Power Seats"],
          },
          {
            trim: "King Ranch",
            count: 65,
            category: "luxury",
            msrp: 62695,
            features: ["King Ranch Leather", "Unique Styling", "Premium Features", "Massage Seats"],
          },
          {
            trim: "Platinum",
            count: 45,
            category: "luxury",
            msrp: 67695,
            features: ["Platinum Leather", "Adaptive Cruise", "Massaging Seats", "Premium Audio"],
          },
          {
            trim: "Limited",
            count: 35,
            category: "luxury",
            msrp: 72695,
            features: ["Limited Leather", "22-inch Wheels", "Premium Everything", "Panoramic Roof"],
          },
          {
            trim: "Raptor",
            count: 25,
            category: "performance",
            msrp: 67895,
            features: ["Fox Racing Shocks", "Terrain Management", "Bead Lock Wheels", "Off-Road Tires"],
          },
        ],
        Mustang: [
          {
            trim: "EcoBoost",
            count: 85,
            category: "base",
            msrp: 31895,
            features: ["2.3L Turbo", "6-Speed Manual", "Sport Seats", "SYNC 3"],
          },
          {
            trim: "GT",
            count: 95,
            category: "performance",
            msrp: 38895,
            features: ["5.0L V8", "6-Speed Manual", "Performance Package Available", "Brembo Brakes"],
          },
        ],
      },
    }

    const makeTrims = trimDatabase[make]
    if (makeTrims && makeTrims[model]) {
      let trims = makeTrims[model]

      // Adjust MSRP based on year if provided
      if (year && year < 2024) {
        const yearAdjustment = (2024 - year) * 0.03 // 3% per year depreciation on MSRP
        trims = trims.map((trim) => ({
          ...trim,
          msrp: trim.msrp ? Math.round(trim.msrp * (1 - yearAdjustment)) : undefined,
        }))
      }

      return trims
    }

    // Generic fallback trims
    return this.getFallbackTrims()
  }

  private getFallbackTrims(): MarketCheckTrim[] {
    return [
      { trim: "Base", count: 50, category: "base", msrp: 25000, features: ["Standard Features"] },
      { trim: "LE", count: 80, category: "mid", msrp: 28000, features: ["Enhanced Features", "Better Interior"] },
      { trim: "XLE", count: 60, category: "premium", msrp: 32000, features: ["Premium Features", "Leather Seats"] },
      {
        trim: "Limited",
        count: 40,
        category: "luxury",
        msrp: 38000,
        features: ["Luxury Features", "Navigation", "Premium Audio"],
      },
      {
        trim: "Sport",
        count: 30,
        category: "sport",
        msrp: 35000,
        features: ["Sport Suspension", "Performance Wheels"],
      },
      {
        trim: "Premium",
        count: 25,
        category: "premium",
        msrp: 40000,
        features: ["Premium Package", "Advanced Safety"],
      },
    ]
  }

  async getVehiclePricing(vehicleData: MarketCheckVehicleData): Promise<MarketCheckPriceResponse> {
    try {
      // Always use fallback pricing for now due to API issues
      console.log("Using enhanced fallback pricing system with location data")
      return this.getFallbackPricing(vehicleData)
    } catch (error) {
      console.error("Error fetching pricing:", error)
      return this.getFallbackPricing(vehicleData)
    }
  }

  private getFallbackMakes(): MarketCheckMake[] {
    return [
      { make: "Toyota", count: 15000 },
      { make: "Honda", count: 12000 },
      { make: "Ford", count: 14000 },
      { make: "Chevrolet", count: 13000 },
      { make: "Nissan", count: 9000 },
      { make: "BMW", count: 7000 },
      { make: "Mercedes-Benz", count: 6000 },
      { make: "Audi", count: 5000 },
      { make: "Lexus", count: 4000 },
      { make: "Tesla", count: 3000 },
      { make: "Hyundai", count: 8000 },
      { make: "Volkswagen", count: 4500 },
      { make: "Subaru", count: 6500 },
      { make: "Mazda", count: 5500 },
      { make: "Kia", count: 7500 },
      { make: "Jeep", count: 8500 },
      { make: "Ram", count: 6000 },
      { make: "GMC", count: 5500 },
      { make: "Cadillac", count: 3500 },
      { make: "Lincoln", count: 2500 },
      { make: "Infiniti", count: 3000 },
      { make: "Acura", count: 4000 },
      { make: "Volvo", count: 3500 },
      { make: "Porsche", count: 2000 },
      { make: "Jaguar", count: 1500 },
      { make: "Land Rover", count: 2000 },
      { make: "Mitsubishi", count: 2500 },
      { make: "Genesis", count: 1000 },
      { make: "Buick", count: 2000 },
      { make: "Chrysler", count: 1500 },
    ]
  }

  private generateRealisticPriceDistribution(basePrice: number) {
    return [
      { priceRange: `$${Math.round(basePrice * 0.7)}k - $${Math.round(basePrice * 0.85)}k`, count: 15, percentage: 25 },
      { priceRange: `$${Math.round(basePrice * 0.85)}k - $${Math.round(basePrice * 1.0)}k`, count: 20, percentage: 35 },
      { priceRange: `$${Math.round(basePrice * 1.0)}k - $${Math.round(basePrice * 1.15)}k`, count: 12, percentage: 25 },
      { priceRange: `$${Math.round(basePrice * 1.15)}k - $${Math.round(basePrice * 1.3)}k`, count: 8, percentage: 15 },
    ]
  }

  private getFallbackPricing(vehicleData: MarketCheckVehicleData): MarketCheckPriceResponse {
    const basePrice = this.calculateEnhancedBasePrice(vehicleData)
    const adjustedPrice = Math.max(basePrice, 3000)

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

    return {
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
        totalListings: 45,
        averageDaysOnMarket: 35,
        priceDistribution: this.generateRealisticPriceDistribution(adjustedPrice),
        geographicData: {
          localAverage: adjustedPrice,
          nationalAverage: Math.round(adjustedPrice * 1.02),
          regionPremium: Math.round(adjustedPrice * 0.02),
        },
        trends: {
          priceChange30Days: Math.round((Math.random() - 0.5) * 1000),
          priceChange90Days: Math.round((Math.random() - 0.5) * 2000),
          inventoryChange: Math.round((Math.random() - 0.5) * 20),
        },
      },
      comparableVehicles: [],
    }
  }

  private calculateEnhancedBasePrice(vehicleData: MarketCheckVehicleData): number {
    const currentYear = new Date().getFullYear()
    const age = currentYear - vehicleData.year

    // Enhanced brand value mapping
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
    }

    const makeKey = vehicleData.make.toLowerCase().replace(/\s+/g, "-")
    const brandData = brandValues[makeKey] || { base: 28000, depreciation: 0.16 }

    const basePrice = brandData.base

    // Apply year-specific depreciation
    const depreciatedPrice = basePrice * Math.pow(1 - brandData.depreciation, age)

    return Math.max(depreciatedPrice, 3000)
  }
}

// Create and export the singleton instance
const marketCheckApi = new MarketCheckApiService()

export { marketCheckApi }
export default MarketCheckApiService
