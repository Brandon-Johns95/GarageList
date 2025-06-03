import { NextResponse } from "next/server"

interface Trim {
  trim: string
  count: number
  bodyType?: string
  drivetrain?: string
  fuelType?: string
  msrp?: number
  features?: string[]
  category?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const make = searchParams.get("make")
    const model = searchParams.get("model")
    const year = searchParams.get("year")

    if (!make || !model) {
      return NextResponse.json({ error: "Make and model parameters are required" }, { status: 400 })
    }

    // Comprehensive trim database
    const trimDatabase: { [key: string]: { [key: string]: Trim[] } } = {
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
        Accord: [
          {
            trim: "LX",
            count: 115,
            category: "base",
            msrp: 27295,
            features: ["CVT", "Honda Sensing", "Cloth Seats", "LED Headlights"],
          },
          {
            trim: "Sport",
            count: 85,
            category: "sport",
            msrp: 30895,
            features: ["19-inch Wheels", "Sport Seats", "Dual Exhaust", "Sport Pedals"],
          },
          {
            trim: "EX-L",
            count: 95,
            category: "premium",
            msrp: 33295,
            features: ["Leather Seats", "Heated Seats", "Power Driver Seat", "Premium Audio"],
          },
          {
            trim: "Touring",
            count: 65,
            category: "luxury",
            msrp: 38295,
            features: ["Navigation", "Premium Audio", "Wireless Charging", "LED Headlights"],
          },
          {
            trim: "Sport 2.0T",
            count: 45,
            category: "performance",
            msrp: 37295,
            features: ["Turbo Engine", "10-Speed Automatic", "Sport Suspension", "Paddle Shifters"],
          },
        ],
        "CR-V": [
          {
            trim: "LX",
            count: 155,
            category: "base",
            msrp: 28400,
            features: ["AWD", "Honda Sensing", "Rear Privacy Glass", "Cloth Seats"],
          },
          {
            trim: "EX",
            count: 125,
            category: "mid",
            msrp: 31400,
            features: ["Moonroof", "Power Tailgate", "Remote Start", "Heated Seats"],
          },
          {
            trim: "EX-L",
            count: 95,
            category: "premium",
            msrp: 34400,
            features: ["Leather Seats", "Heated Seats", "Power Driver Seat", "Premium Audio"],
          },
          {
            trim: "Touring",
            count: 75,
            category: "luxury",
            msrp: 37400,
            features: ["Navigation", "Premium Audio", "Hands-Free Power Tailgate", "LED Headlights"],
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
            trim: "EcoBoost Premium",
            count: 65,
            category: "premium",
            msrp: 38895,
            features: ["Premium Interior", "Navigation", "Premium Audio", "Leather Seats"],
          },
          {
            trim: "GT",
            count: 95,
            category: "performance",
            msrp: 38895,
            features: ["5.0L V8", "6-Speed Manual", "Performance Package Available", "Brembo Brakes"],
          },
          {
            trim: "GT Premium",
            count: 75,
            category: "performance",
            msrp: 45895,
            features: ["5.0L V8", "Premium Interior", "Navigation", "Leather Seats"],
          },
          {
            trim: "Mach 1",
            count: 25,
            category: "performance",
            msrp: 58895,
            features: ["Track-Tuned Suspension", "Tremec Manual", "Aerodynamics Package", "Michelin Tires"],
          },
          {
            trim: "Shelby GT350",
            count: 15,
            category: "performance",
            msrp: 73895,
            features: ["5.2L V8", "Track Package", "Carbon Fiber", "Recaro Seats"],
          },
          {
            trim: "Shelby GT500",
            count: 10,
            category: "performance",
            msrp: 83895,
            features: ["5.2L Supercharged V8", "Carbon Track Package", "Michelin Pilot Sport", "Launch Control"],
          },
        ],
      },
      BMW: {
        "3 Series": [
          {
            trim: "330i",
            count: 125,
            category: "base",
            msrp: 41250,
            features: ["2.0L Turbo", "8-Speed Automatic", "LED Headlights", "iDrive"],
          },
          {
            trim: "330i xDrive",
            count: 145,
            category: "mid",
            msrp: 43250,
            features: ["AWD", "Premium Package Available", "Heated Seats", "Moonroof"],
          },
          {
            trim: "M340i",
            count: 85,
            category: "performance",
            msrp: 56700,
            features: ["3.0L Turbo I6", "M Performance", "Adaptive Suspension", "M Sport Brakes"],
          },
          {
            trim: "M340i xDrive",
            count: 95,
            category: "performance",
            msrp: 58700,
            features: ["AWD", "M Performance", "Launch Control", "M Sport Differential"],
          },
          {
            trim: "M3",
            count: 45,
            category: "performance",
            msrp: 73400,
            features: ["3.0L Twin-Turbo I6", "M Suspension", "Carbon Fiber", "M Sport Seats"],
          },
          {
            trim: "M3 Competition",
            count: 25,
            category: "performance",
            msrp: 79400,
            features: ["Competition Package", "M Carbon Seats", "Track Package", "M Drive Modes"],
          },
        ],
      },
      Tesla: {
        "Model 3": [
          {
            trim: "Standard Range Plus",
            count: 185,
            category: "base",
            msrp: 37990,
            features: ["RWD", "Autopilot", "Premium Interior", "15-inch Display"],
          },
          {
            trim: "Long Range",
            count: 225,
            category: "mid",
            msrp: 46990,
            features: ["AWD", "Premium Connectivity", "Enhanced Autopilot Available", "Glass Roof"],
          },
          {
            trim: "Performance",
            count: 125,
            category: "performance",
            msrp: 55990,
            features: ["AWD", "Track Mode", "Performance Brakes", "Carbon Fiber Spoiler"],
          },
        ],
        "Model Y": [
          {
            trim: "Long Range",
            count: 195,
            category: "base",
            msrp: 52990,
            features: ["AWD", "Autopilot", "Glass Roof", "7-Seat Available"],
          },
          {
            trim: "Performance",
            count: 145,
            category: "performance",
            msrp: 60990,
            features: ["AWD", "Track Mode", "Performance Wheels", "Lowered Suspension"],
          },
        ],
      },
    }

    const makeTrims = trimDatabase[make]
    let trims: Trim[] = []

    if (makeTrims && makeTrims[model]) {
      trims = makeTrims[model]

      // Adjust MSRP based on year if provided
      if (year && Number.parseInt(year) < 2024) {
        const yearAdjustment = (2024 - Number.parseInt(year)) * 0.03 // 3% per year depreciation on MSRP
        trims = trims.map((trim) => ({
          ...trim,
          msrp: trim.msrp ? Math.round(trim.msrp * (1 - yearAdjustment)) : undefined,
        }))
      }
    } else {
      // Generic fallback trims
      trims = [
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

    return NextResponse.json({
      trims: trims.sort((a, b) => b.count - a.count),
      fallback: true,
      message: "Using comprehensive trim database",
    })
  } catch (error) {
    console.error("Error in trims API:", error)

    return NextResponse.json({
      trims: [
        { trim: "Base", count: 50, category: "base", msrp: 25000, features: ["Standard Features"] },
        { trim: "LE", count: 80, category: "mid", msrp: 28000, features: ["Enhanced Features"] },
        { trim: "XLE", count: 60, category: "premium", msrp: 32000, features: ["Premium Features"] },
      ],
      fallback: true,
      error: "Fallback data used",
    })
  }
}
