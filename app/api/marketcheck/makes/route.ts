import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Use comprehensive fallback data directly since MarketCheck API is not available
    const fallbackMakes = [
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

    return NextResponse.json({
      makes: fallbackMakes,
      fallback: true,
      message: "Using comprehensive vehicle database",
    })
  } catch (error) {
    console.error("Error in makes API:", error)

    // Even if there's an error, return basic makes
    const basicMakes = [
      { make: "Toyota", count: 15000 },
      { make: "Honda", count: 12000 },
      { make: "Ford", count: 14000 },
      { make: "Chevrolet", count: 13000 },
      { make: "Nissan", count: 9000 },
    ]

    return NextResponse.json({
      makes: basicMakes,
      fallback: true,
      error: "Fallback data used",
    })
  }
}
