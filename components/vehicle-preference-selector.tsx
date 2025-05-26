"use client"

import { useState } from "react"
import { Car, Search, ArrowRight, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useAuth } from "@/lib/auth-context"

interface VehiclePreferences {
  intent: "buy" | "sell" | ""
  bodyType: string
  yearRange: [number, number]
  make: string
  model: string
  priceRange: [number, number]
}

interface VehiclePreferenceSelectorProps {
  selectedLocation: { state: string; city: string }
  onPreferencesSelect: (preferences: VehiclePreferences) => void
  onSkip: () => void
}

const currentYear = new Date().getFullYear()

const bodyTypes = [
  { value: "any", label: "Any Type" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "pickup", label: "Pickup Truck" },
  { value: "coupe", label: "Coupe" },
  { value: "hatchback", label: "Hatchback" },
  { value: "convertible", label: "Convertible" },
  { value: "wagon", label: "Wagon" },
  { value: "van", label: "Van" },
  { value: "rv-trailer", label: "RVs/Travel Trailers" },
  { value: "motorcycle", label: "Motorcycle" },
  { value: "boat", label: "Boat" },
  { value: "atv", label: "ATV/UTV" },
]

const makes = [
  { value: "any", label: "Any Make" },
  { value: "acura", label: "Acura" },
  { value: "audi", label: "Audi" },
  { value: "bmw", label: "BMW" },
  { value: "buick", label: "Buick" },
  { value: "cadillac", label: "Cadillac" },
  { value: "chevrolet", label: "Chevrolet" },
  { value: "chrysler", label: "Chrysler" },
  { value: "dodge", label: "Dodge" },
  { value: "ford", label: "Ford" },
  { value: "gmc", label: "GMC" },
  { value: "honda", label: "Honda" },
  { value: "hyundai", label: "Hyundai" },
  { value: "infiniti", label: "Infiniti" },
  { value: "jeep", label: "Jeep" },
  { value: "kia", label: "Kia" },
  { value: "lexus", label: "Lexus" },
  { value: "lincoln", label: "Lincoln" },
  { value: "mazda", label: "Mazda" },
  { value: "mercedes-benz", label: "Mercedes-Benz" },
  { value: "mitsubishi", label: "Mitsubishi" },
  { value: "nissan", label: "Nissan" },
  { value: "ram", label: "Ram" },
  { value: "subaru", label: "Subaru" },
  { value: "tesla", label: "Tesla" },
  { value: "toyota", label: "Toyota" },
  { value: "volkswagen", label: "Volkswagen" },
  { value: "volvo", label: "Volvo" },
]

const modelsByMake = {
  honda: ["Accord", "Civic", "CR-V", "Pilot", "Odyssey", "Fit", "HR-V", "Passport", "Ridgeline"],
  toyota: ["Camry", "Corolla", "RAV4", "Highlander", "Prius", "Tacoma", "Tundra", "Sienna", "4Runner"],
  ford: ["F-150", "Escape", "Explorer", "Mustang", "Focus", "Fusion", "Edge", "Expedition", "Ranger"],
  chevrolet: ["Silverado", "Equinox", "Malibu", "Traverse", "Tahoe", "Suburban", "Camaro", "Corvette", "Colorado"],
  bmw: ["3 Series", "5 Series", "X3", "X5", "X1", "7 Series", "4 Series", "X7", "Z4"],
  tesla: ["Model 3", "Model Y", "Model S", "Model X", "Cybertruck"],
  jeep: ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Renegade", "Gladiator", "Grand Wagoneer"],
}

export function VehiclePreferenceSelector({
  selectedLocation,
  onPreferencesSelect,
  onSkip,
}: VehiclePreferenceSelectorProps) {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<VehiclePreferences>({
    intent: "",
    bodyType: "any",
    yearRange: [2010, currentYear],
    make: "any",
    model: "",
    priceRange: [0, 100000],
  })

  const [step, setStep] = useState<"intent" | "details">("intent")

  const handleIntentSelect = (intent: "buy" | "sell") => {
    if (intent === "sell") {
      // Redirect directly to sell page
      window.location.href = "/sell"
      return
    }

    setPreferences((prev) => ({ ...prev, intent }))
    setStep("details")
  }

  const handlePreferenceChange = (key: keyof VehiclePreferences, value: any) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: value }
      // Reset model when make changes
      if (key === "make" && value !== prev.make) {
        updated.model = ""
      }
      return updated
    })
  }

  const handleContinue = () => {
    onPreferencesSelect(preferences)
  }

  const availableModels = preferences.make !== "any" ? modelsByMake[preferences.make] || [] : []

  if (step === "intent") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              What brings you to {selectedLocation.city}, {selectedLocation.state}?
            </CardTitle>
            <p className="text-gray-600">Let us know what you're looking for so we can personalize your experience</p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-500"
                onClick={() => handleIntentSelect("buy")}
              >
                <CardContent className="p-6 text-center">
                  <Search className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-xl font-semibold mb-2">Looking to Buy</h3>
                  <p className="text-gray-600">Browse vehicles for sale in your area</p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-green-500"
                onClick={() => handleIntentSelect("sell")}
              >
                <CardContent className="p-6 text-center">
                  <Car className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <h3 className="text-xl font-semibold mb-2">Looking to Sell</h3>
                  <p className="text-gray-600">List your vehicle for sale</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center pt-4 border-t">
              <Button variant="ghost" onClick={onSkip} className="text-gray-600 hover:text-gray-800">
                Skip - I'll browse everything
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Badge variant="secondary" className="text-sm">
              {selectedLocation.city}, {selectedLocation.state}
            </Badge>
            <Badge variant={preferences.intent === "buy" ? "default" : "secondary"} className="text-sm">
              {preferences.intent === "buy" ? "Looking to Buy" : "Looking to Sell"}
            </Badge>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            {preferences.intent === "buy" ? "What are you looking to buy?" : "What are you looking to sell?"}
          </CardTitle>
          <p className="text-gray-600">
            Help us show you the most relevant {preferences.intent === "buy" ? "listings" : "selling tools"}
          </p>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Body Type Selection */}
          <div>
            <label className="text-lg font-semibold mb-4 block">Vehicle Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {bodyTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={preferences.bodyType === type.value ? "default" : "outline"}
                  onClick={() => handlePreferenceChange("bodyType", type.value)}
                  className="h-auto p-3 text-center"
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Year Range */}
          <div>
            <label className="text-lg font-semibold mb-4 block">Year Range</label>
            <div className="space-y-4">
              <Slider
                value={preferences.yearRange}
                onValueChange={(value) => handlePreferenceChange("yearRange", value)}
                min={1990}
                max={currentYear}
                step={1}
                className="mb-2"
                showTicks={true}
                tickPositions={[1990, currentYear]}
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>{preferences.yearRange[0]}</span>
                <span>{preferences.yearRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Make Selection */}
          <div>
            <label className="text-lg font-semibold mb-4 block">Make</label>
            <Select value={preferences.make} onValueChange={(value) => handlePreferenceChange("make", value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a make" />
              </SelectTrigger>
              <SelectContent>
                {makes.map((make) => (
                  <SelectItem key={make.value} value={make.value}>
                    {make.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Selection */}
          {preferences.make !== "any" && availableModels.length > 0 && (
            <div>
              <label className="text-lg font-semibold mb-4 block">Model (Optional)</label>
              <Select value={preferences.model} onValueChange={(value) => handlePreferenceChange("model", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a model (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Model</SelectItem>
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model.toLowerCase()}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Price Range */}
          <div>
            <label className="text-lg font-semibold mb-4 block">
              {preferences.intent === "buy" ? "Budget Range" : "Expected Price Range"}
            </label>
            <div className="space-y-4">
              <Slider
                value={preferences.priceRange}
                onValueChange={(value) => handlePreferenceChange("priceRange", value)}
                min={0}
                max={200000}
                step={5000}
                className="mb-2"
                showTicks={true}
                tickPositions={[0, 200000]}
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>${preferences.priceRange[0].toLocaleString()}</span>
                <span>${preferences.priceRange[1].toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
            <Button variant="outline" onClick={() => setStep("intent")} className="flex-1">
              ← Back
            </Button>
            <Button onClick={handleContinue} className="flex-1 flex items-center justify-center space-x-2">
              <span>{preferences.intent === "buy" ? "Find Vehicles" : "Start Selling"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-center">
            <Button variant="ghost" onClick={onSkip} className="text-gray-600 hover:text-gray-800">
              <SkipForward className="h-4 w-4 mr-2" />
              Skip preferences - Browse everything
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
