"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, Plus, DollarSign, Car, Camera, FileText, User, Check, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { GarageListLogo } from "@/components/garage-list-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

const vehicleCategories = [
  { value: "cars-trucks", label: "Cars & Trucks", icon: "🚗" },
  { value: "motorcycles", label: "Motorcycles", icon: "🏍️" },
  { value: "rvs", label: "RVs & Campers", icon: "🚐" },
  { value: "boats", label: "Boats & Watercraft", icon: "⛵" },
  { value: "offroad", label: "Off-Road Vehicles", icon: "🏁" },
]

const vehicleData = {
  "cars-trucks": {
    makes: [
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
    ],
    bodyTypes: ["Sedan", "SUV", "Hatchback", "Coupe", "Convertible", "Pickup Truck", "Wagon", "Minivan", "Crossover"],
    fuelTypes: ["Gasoline", "Diesel", "Electric", "Hybrid", "Plug-in Hybrid"],
  },
  motorcycles: {
    makes: [
      "Harley-Davidson",
      "Honda",
      "Yamaha",
      "Kawasaki",
      "Suzuki",
      "Ducati",
      "BMW",
      "KTM",
      "Triumph",
      "Indian",
      "Victory",
      "Aprilia",
      "Moto Guzzi",
      "Can-Am",
      "Zero",
    ],
    bodyTypes: [
      "Cruiser",
      "Sport",
      "Touring",
      "Standard",
      "Dual Sport",
      "Dirt Bike",
      "Scooter",
      "Chopper",
      "Cafe Racer",
    ],
    fuelTypes: ["Gasoline", "Electric"],
  },
  rvs: {
    makes: [
      "Winnebago",
      "Thor",
      "Forest River",
      "Jayco",
      "Coachmen",
      "Keystone",
      "Heartland",
      "Grand Design",
      "Newmar",
      "Tiffin",
      "Holiday Rambler",
      "Fleetwood",
      "Airstream",
      "Dutchmen",
      "Prime Time",
    ],
    bodyTypes: [
      "Class A",
      "Class B",
      "Class C",
      "Travel Trailer",
      "Fifth Wheel",
      "Toy Hauler",
      "Pop-up Camper",
      "Truck Camper",
    ],
    fuelTypes: ["Gasoline", "Diesel"],
  },
  boats: {
    makes: [
      "Sea Ray",
      "Boston Whaler",
      "Bayliner",
      "Chaparral",
      "Mastercraft",
      "Malibu",
      "Cobalt",
      "Formula",
      "Grady-White",
      "Ranger",
      "Bass Tracker",
      "Lund",
      "Crestliner",
      "Alumacraft",
      "Princecraft",
    ],
    bodyTypes: [
      "Bowrider",
      "Pontoon",
      "Bass Boat",
      "Ski Boat",
      "Fishing Boat",
      "Sailboat",
      "Yacht",
      "Jet Ski",
      "Cabin Cruiser",
    ],
    fuelTypes: ["Gasoline", "Diesel", "Electric", "Outboard"],
  },
  offroad: {
    makes: [
      "Polaris",
      "Can-Am",
      "Yamaha",
      "Honda",
      "Kawasaki",
      "Arctic Cat",
      "Suzuki",
      "KTM",
      "Beta",
      "Husqvarna",
      "GasGas",
      "TM Racing",
      "Sherco",
    ],
    bodyTypes: ["ATV", "Side-by-Side (UTV)", "Dirt Bike", "Dune Buggy", "Go-Kart", "Sand Rail"],
    fuelTypes: ["Gasoline", "Electric"],
  },
}

const transmissionTypes = ["Automatic", "Manual", "CVT"]

const conditions = [
  { value: "excellent", label: "Excellent", description: "Like new, no visible wear" },
  { value: "very-good", label: "Very Good", description: "Minor wear, well maintained" },
  { value: "good", label: "Good", description: "Normal wear, good condition" },
  { value: "fair", label: "Fair", description: "Some wear, needs minor work" },
  { value: "poor", label: "Poor", description: "Significant wear, needs major work" },
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
    "GPS Mount",
    "Phone Charger",
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
    "Outdoor Kitchen",
    "Satellite TV",
    "WiFi Booster",
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
    "Swim Platform",
    "Anchor",
    "Safety Equipment",
    "Covers",
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
    "Sound System",
    "GPS Mount",
  ],
}

const exteriorColors = [
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

const interiorColors = ["Black", "Gray", "Tan", "Beige", "Brown", "White", "Red", "Blue", "Green", "Other"]

// Helper function to safely parse numbers
const safeParseInt = (value: string): number => {
  const parsed = Number.parseInt(value, 10)
  return !isNaN(parsed) && isFinite(parsed) ? parsed : 0
}

// Helper function to safely get string values
const safeString = (value: string): string => {
  return value && typeof value === "string" ? value.trim() : ""
}

// Photo upload configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_PHOTOS = 20
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

export default function SellPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Vehicle Category
    vehicleCategory: "",

    // Vehicle Details
    make: "",
    model: "",
    year: "",
    mileage: "",
    vin: "",
    bodyType: "",
    fuelType: "",
    transmission: "",
    exteriorColor: "",
    customExteriorColor: "",
    interiorColor: "",
    customInteriorColor: "",

    // Pricing & Condition
    price: "",
    condition: "",

    // Photos
    photos: [] as string[],

    // Description & Features
    description: "",
    selectedFeatures: [] as string[],

    // Contact & Location
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    state: "",
    zipCode: "",

    // Additional
    negotiable: false,
    tradeConsidered: false,
    financingAvailable: false,
  })

  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalSteps = 6
  const progress = (currentStep / totalSteps) * 100

  const router = useRouter()

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedFeatures: prev.selectedFeatures.includes(feature)
        ? prev.selectedFeatures.filter((f) => f !== feature)
        : [...prev.selectedFeatures, feature],
    }))
  }

  // Convert file to data URL for storage
  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Validate file before upload
  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Please upload only JPEG, PNG, or WebP images."
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 10MB."
    }
    return null
  }

  // Handle photo upload from device
  const handlePhotoUpload = () => {
    if (uploadedPhotos.length >= MAX_PHOTOS) {
      setUploadError(`Maximum ${MAX_PHOTOS} photos allowed.`)
      return
    }
    fileInputRef.current?.click()
  }

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadError("")

    try {
      const newPhotos: string[] = []

      for (let i = 0; i < files.length; i++) {
        if (uploadedPhotos.length + newPhotos.length >= MAX_PHOTOS) {
          setUploadError(`Maximum ${MAX_PHOTOS} photos allowed. Some files were not uploaded.`)
          break
        }

        const file = files[i]
        const validationError = validateFile(file)

        if (validationError) {
          setUploadError(validationError)
          continue
        }

        try {
          const dataURL = await fileToDataURL(file)
          newPhotos.push(dataURL)
        } catch (error) {
          console.error("Error converting file to data URL:", error)
          setUploadError("Error processing image. Please try again.")
        }
      }

      if (newPhotos.length > 0) {
        setUploadedPhotos((prev) => [...prev, ...newPhotos])
        setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...newPhotos] }))
      }
    } catch (error) {
      console.error("Error uploading photos:", error)
      setUploadError("Error uploading photos. Please try again.")
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = uploadedPhotos.filter((_, i) => i !== index)
    setUploadedPhotos(newPhotos)
    setFormData((prev) => ({ ...prev, photos: newPhotos }))
    setUploadError("")
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getCurrentVehicleData = () => {
    return vehicleData[formData.vehicleCategory as keyof typeof vehicleData] || vehicleData["cars-trucks"]
  }

  const getCurrentFeatures = () => {
    return features[formData.vehicleCategory as keyof typeof features] || features["cars-trucks"]
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Category</h2>
              <p className="text-gray-600">What type of vehicle are you selling?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicleCategories.map((category) => (
                <Card
                  key={category.value}
                  className={`cursor-pointer transition-all ${
                    formData.vehicleCategory === category.value ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleInputChange("vehicleCategory", category.value)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="font-semibold text-lg">{category.label}</h3>
                    {formData.vehicleCategory === category.value && (
                      <Check className="h-6 w-6 text-blue-500 mx-auto mt-2" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Details</h2>
              <p className="text-gray-600">
                Tell us about your{" "}
                {vehicleCategories.find((c) => c.value === formData.vehicleCategory)?.label.toLowerCase()}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="make">Make *</Label>
                <Select value={formData.make} onValueChange={(value) => handleInputChange("make", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select make" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCurrentVehicleData().makes.map((make) => (
                      <SelectItem key={make} value={make.toLowerCase()}>
                        {make}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => handleInputChange("model", e.target.value)}
                  placeholder="e.g., Civic, Sportster, Winnebago"
                />
              </div>

              <div>
                <Label htmlFor="year">Year *</Label>
                <Select value={formData.year} onValueChange={(value) => handleInputChange("year", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 50 }, (_, i) => 2024 - i).map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mileage">{formData.vehicleCategory === "boats" ? "Engine Hours" : "Mileage"} *</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => handleInputChange("mileage", e.target.value)}
                  placeholder={formData.vehicleCategory === "boats" ? "e.g., 250" : "e.g., 45000"}
                />
              </div>

              <div>
                <Label htmlFor="bodyType">Type *</Label>
                <Select value={formData.bodyType} onValueChange={(value) => handleInputChange("bodyType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCurrentVehicleData().bodyTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="fuelType">{formData.vehicleCategory === "boats" ? "Engine Type" : "Fuel Type"} *</Label>
                <Select value={formData.fuelType} onValueChange={(value) => handleInputChange("fuelType", value)}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={formData.vehicleCategory === "boats" ? "Select engine type" : "Select fuel type"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {getCurrentVehicleData().fuelTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(formData.vehicleCategory === "cars-trucks" || formData.vehicleCategory === "rvs") && (
                <div>
                  <Label htmlFor="transmission">Transmission *</Label>
                  <Select
                    value={formData.transmission}
                    onValueChange={(value) => handleInputChange("transmission", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      {transmissionTypes.map((type) => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="vin">VIN/HIN/Serial Number (Optional)</Label>
                <Input
                  id="vin"
                  value={formData.vin}
                  onChange={(e) => handleInputChange("vin", e.target.value)}
                  placeholder="Vehicle identification number"
                />
              </div>

              <div>
                <Label htmlFor="exteriorColor">Exterior Color</Label>
                <Select
                  value={formData.exteriorColor}
                  onValueChange={(value) => handleInputChange("exteriorColor", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select exterior color" />
                  </SelectTrigger>
                  <SelectContent>
                    {exteriorColors.map((color) => (
                      <SelectItem key={color} value={color.toLowerCase()}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.exteriorColor === "other" && (
                  <Input
                    className="mt-2"
                    value={formData.customExteriorColor}
                    onChange={(e) => handleInputChange("customExteriorColor", e.target.value)}
                    placeholder="Enter custom exterior color"
                  />
                )}
              </div>

              {(formData.vehicleCategory === "cars-trucks" || formData.vehicleCategory === "rvs") && (
                <div>
                  <Label htmlFor="interiorColor">Interior Color</Label>
                  <Select
                    value={formData.interiorColor}
                    onValueChange={(value) => handleInputChange("interiorColor", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select interior color" />
                    </SelectTrigger>
                    <SelectContent>
                      {interiorColors.map((color) => (
                        <SelectItem key={color} value={color.toLowerCase()}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.interiorColor === "other" && (
                    <Input
                      className="mt-2"
                      value={formData.customInteriorColor}
                      onChange={(e) => handleInputChange("customInteriorColor", e.target.value)}
                      placeholder="Enter custom interior color"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Pricing & Condition</h2>
              <p className="text-gray-600">Set your price and describe the condition</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="price">Asking Price *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="25000"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label>Vehicle Condition *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                  {conditions.map((condition) => (
                    <Card
                      key={condition.value}
                      className={`cursor-pointer transition-all ${
                        formData.condition === condition.value ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleInputChange("condition", condition.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{condition.label}</h4>
                          {formData.condition === condition.value && <Check className="h-5 w-5 text-blue-500" />}
                        </div>
                        <p className="text-sm text-gray-600">{condition.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="negotiable"
                      checked={formData.negotiable}
                      onCheckedChange={(checked) => handleInputChange("negotiable", checked)}
                    />
                    <Label htmlFor="negotiable">Price is negotiable</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tradeConsidered"
                      checked={formData.tradeConsidered}
                      onCheckedChange={(checked) => handleInputChange("tradeConsidered", checked)}
                    />
                    <Label htmlFor="tradeConsidered">Trade-in considered</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="financingAvailable"
                      checked={formData.financingAvailable}
                      onCheckedChange={(checked) => handleInputChange("financingAvailable", checked)}
                    />
                    <Label htmlFor="financingAvailable">Financing available</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Photos</h2>
              <p className="text-gray-600">Add photos to showcase your vehicle (up to {MAX_PHOTOS} photos)</p>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Upload Error */}
            {uploadError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{uploadError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={photo || "/placeholder.svg"}
                      alt={`Vehicle photo ${index + 1}`}
                      width={200}
                      height={150}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removePhoto(index)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    {index === 0 && <Badge className="absolute bottom-2 left-2 bg-blue-600">Main Photo</Badge>}
                  </div>
                ))}

                {uploadedPhotos.length < MAX_PHOTOS && (
                  <button
                    onClick={handlePhotoUpload}
                    disabled={isUploading}
                    className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-2"></div>
                        <span className="text-sm text-gray-600">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Camera className="h-8 w-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">Add Photo</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {uploadedPhotos.length === 0 && !isUploading && (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Upload your first photo</h3>
                  <p className="text-gray-600 mb-4">Great photos help your vehicle sell faster</p>
                  <Button onClick={handlePhotoUpload} disabled={isUploading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Photos
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Photo Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Take photos in good lighting (preferably outdoors)</li>
                <li>• Include exterior shots from all angles</li>
                <li>• Show the interior, dashboard, and any damage</li>
                <li>• Clean your vehicle before taking photos</li>
                <li>• Accepted formats: JPEG, PNG, WebP (max 10MB each)</li>
              </ul>
            </div>

            {/* Photo count indicator */}
            <div className="text-center text-sm text-gray-600">
              {uploadedPhotos.length} of {MAX_PHOTOS} photos uploaded
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Description & Features</h2>
              <p className="text-gray-600">Describe your vehicle and highlight its features</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Listing Title</Label>
                <div className="p-3 bg-gray-50 border rounded-md">
                  <p className="text-lg font-medium text-gray-900">
                    {formData.year && formData.make && formData.model
                      ? `${formData.year} ${formData.make.charAt(0).toUpperCase() + formData.make.slice(1)} ${formData.model}`
                      : "Title will be generated from vehicle details"}
                  </p>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  This title is automatically generated from your vehicle details
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your vehicle's condition, maintenance history, any modifications, and why you're selling..."
                  rows={6}
                  maxLength={2000}
                />
                <p className="text-sm text-gray-500 mt-1">{formData.description.length}/2000 characters</p>
              </div>

              <div>
                <Label>Features & Options</Label>
                <p className="text-sm text-gray-600 mb-3">Select all features that apply to your vehicle</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {getCurrentFeatures().map((feature) => (
                    <div key={feature} className="flex items-center space-x-2">
                      <Checkbox
                        id={feature}
                        checked={formData.selectedFeatures.includes(feature)}
                        onCheckedChange={() => handleFeatureToggle(feature)}
                      />
                      <Label htmlFor={feature} className="text-sm">
                        {feature}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact & Location</h2>
              <p className="text-gray-600">How can buyers reach you?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="John"
                />
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Doe"
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="San Francisco"
                />
              </div>

              <div>
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  placeholder="CA"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  placeholder="94102"
                  className="md:w-48"
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Privacy & Safety</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your contact information will only be shared with serious buyers</li>
                <li>• We recommend meeting in public places for test drives</li>
                <li>• Never share personal financial information</li>
              </ul>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const handlePublish = () => {
    // Validate required fields
    if (!formData.make || !formData.model || !formData.year || !formData.price) {
      alert("Please fill in all required fields")
      return
    }

    // Create a listing object from the form data with safe parsing
    const newListing = {
      id: Date.now(), // Simple ID generation
      title: `${formData.year} ${formData.make.charAt(0).toUpperCase() + formData.make.slice(1)} ${formData.model}`,
      price: safeParseInt(formData.price),
      year: safeParseInt(formData.year),
      mileage: safeParseInt(formData.mileage),
      location: `${safeString(formData.city)}, ${safeString(formData.state)}`,
      images: uploadedPhotos.length > 0 ? uploadedPhotos : ["/placeholder.svg?height=200&width=300"],
      seller: {
        name: `${safeString(formData.firstName)} ${safeString(formData.lastName)}`,
        rating: 5.0, // New seller starts with perfect rating
        reviews: 0,
        avatar: "/placeholder.svg?height=40&width=40",
      },
      features: formData.selectedFeatures,
      fuelType: formData.fuelType.charAt(0).toUpperCase() + formData.fuelType.slice(1),
      transmission: formData.transmission.charAt(0).toUpperCase() + formData.transmission.slice(1),
      bodyType: formData.bodyType.charAt(0).toUpperCase() + formData.bodyType.slice(1),
      condition: conditions.find((c) => c.value === formData.condition)?.label || "Good",
      description: safeString(formData.description),
      exteriorColor: formData.exteriorColor === "other" ? formData.customExteriorColor : formData.exteriorColor,
      interiorColor: formData.interiorColor === "other" ? formData.customInteriorColor : formData.interiorColor,
      vin: safeString(formData.vin),
      negotiable: formData.negotiable,
      tradeConsidered: formData.tradeConsidered,
      financingAvailable: formData.financingAvailable,
      publishedAt: new Date().toISOString(),
    }

    try {
      // Save to localStorage
      const existingListings = JSON.parse(localStorage.getItem("userListings") || "[]")
      existingListings.unshift(newListing) // Add to beginning of array
      localStorage.setItem("userListings", JSON.stringify(existingListings))

      console.log("Publishing listing:", newListing)
      router.push("/sell/success")
    } catch (error) {
      console.error("Error saving listing:", error)
      alert("There was an error publishing your listing. Please try again.")
    }
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
                <Link href="/" className="text-gray-700 hover:text-blue-600">
                  Buy
                </Link>
                <Link href="/sell" className="text-blue-600 font-medium">
                  Sell
                </Link>
                <Link href="/financing" className="text-gray-700 hover:text-blue-600">
                  Financing
                </Link>
                <Link href="/about" className="text-gray-700 hover:text-blue-600">
                  About
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">Sign In</Button>
              <Button variant="outline" asChild>
                <Link href="/">Back to Browse</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">List Your Vehicle</h1>
            <span className="text-sm text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-8">
          {[
            { step: 1, icon: Car, label: "Category" },
            { step: 2, icon: Car, label: "Details" },
            { step: 3, icon: DollarSign, label: "Pricing" },
            { step: 4, icon: Camera, label: "Photos" },
            { step: 5, icon: FileText, label: "Description" },
            { step: 6, icon: User, label: "Contact" },
          ].map(({ step, icon: Icon, label }) => (
            <div key={step} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step <= currentStep ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className={`text-xs mt-1 ${step <= currentStep ? "text-blue-600" : "text-gray-400"}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <Card>
          <CardContent className="p-8">{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={nextStep} disabled={currentStep === 1 && !formData.vehicleCategory}>
              Next Step
            </Button>
          ) : (
            <Button size="lg" className="bg-green-600 hover:bg-green-700" onClick={handlePublish}>
              Publish Listing
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
