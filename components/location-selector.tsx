"use client"

import { useState } from "react"
import { MapPin, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Sample data - in a real app, this would come from an API
const statesAndCities = {
  Alabama: ["Birmingham", "Montgomery", "Mobile", "Huntsville", "Tuscaloosa"],
  Alaska: ["Anchorage", "Fairbanks", "Juneau", "Sitka", "Ketchikan"],
  Arizona: ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale"],
  Arkansas: ["Little Rock", "Fort Smith", "Fayetteville", "Springdale", "Jonesboro"],
  California: [
    "Los Angeles",
    "San Francisco",
    "San Diego",
    "Sacramento",
    "San Jose",
    "Oakland",
    "Fresno",
    "Long Beach",
  ],
  Colorado: ["Denver", "Colorado Springs", "Aurora", "Fort Collins", "Lakewood"],
  Connecticut: ["Hartford", "New Haven", "Stamford", "Waterbury", "Norwalk"],
  Delaware: ["Wilmington", "Dover", "Newark", "Middletown", "Smyrna"],
  Florida: ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale", "Tallahassee", "St. Petersburg"],
  Georgia: ["Atlanta", "Augusta", "Columbus", "Macon", "Savannah"],
  Hawaii: ["Honolulu", "Hilo", "Kailua-Kona", "Kaneohe", "Waipahu"],
  Idaho: ["Boise", "Meridian", "Nampa", "Idaho Falls", "Pocatello"],
  Illinois: ["Chicago", "Aurora", "Rockford", "Joliet", "Naperville"],
  Indiana: ["Indianapolis", "Fort Wayne", "Evansville", "South Bend", "Carmel"],
  Iowa: ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City", "Iowa City"],
  Kansas: ["Wichita", "Overland Park", "Kansas City", "Topeka", "Olathe"],
  Kentucky: ["Louisville", "Lexington", "Bowling Green", "Owensboro", "Covington"],
  Louisiana: ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette", "Lake Charles"],
  Maine: ["Portland", "Lewiston", "Bangor", "South Portland", "Auburn"],
  Maryland: ["Baltimore", "Frederick", "Rockville", "Gaithersburg", "Bowie"],
  Massachusetts: ["Boston", "Worcester", "Springfield", "Lowell", "Cambridge"],
  Michigan: ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Lansing"],
  Minnesota: ["Minneapolis", "Saint Paul", "Rochester", "Duluth", "Bloomington"],
  Mississippi: ["Jackson", "Gulfport", "Southaven", "Hattiesburg", "Biloxi"],
  Missouri: ["Kansas City", "Saint Louis", "Springfield", "Independence", "Columbia"],
  Montana: ["Billings", "Missoula", "Great Falls", "Bozeman", "Butte"],
  Nebraska: ["Omaha", "Lincoln", "Bellevue", "Grand Island", "Kearney"],
  Nevada: ["Las Vegas", "Henderson", "Reno", "North Las Vegas", "Sparks"],
  "New Hampshire": ["Manchester", "Nashua", "Concord", "Derry", "Rochester"],
  "New Jersey": ["Newark", "Jersey City", "Paterson", "Elizabeth", "Edison"],
  "New Mexico": ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe", "Roswell"],
  "New York": ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany"],
  "North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem"],
  "North Dakota": ["Fargo", "Bismarck", "Grand Forks", "Minot", "West Fargo"],
  Ohio: ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"],
  Oklahoma: ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow", "Lawton"],
  Oregon: ["Portland", "Eugene", "Salem", "Gresham", "Hillsboro"],
  Pennsylvania: ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading"],
  "Rhode Island": ["Providence", "Warwick", "Cranston", "Pawtucket", "East Providence"],
  "South Carolina": ["Charleston", "Columbia", "North Charleston", "Mount Pleasant", "Rock Hill"],
  "South Dakota": ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings", "Watertown"],
  Tennessee: ["Nashville", "Memphis", "Knoxville", "Chattanooga", "Clarksville"],
  Texas: ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington", "Corpus Christi"],
  Utah: ["Salt Lake City", "West Valley City", "Provo", "West Jordan", "Orem"],
  Vermont: ["Burlington", "Essex", "South Burlington", "Colchester", "Rutland"],
  Virginia: ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond", "Newport News"],
  Washington: ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue"],
  "West Virginia": ["Charleston", "Huntington", "Parkersburg", "Morgantown", "Wheeling"],
  Wisconsin: ["Milwaukee", "Madison", "Green Bay", "Kenosha", "Racine"],
  Wyoming: ["Cheyenne", "Casper", "Laramie", "Gillette", "Rock Springs"],
}

interface LocationSelectorProps {
  onLocationSelect: (state: string, city: string) => void
  onSkip: () => void
}

export function LocationSelector({ onLocationSelect, onSkip }: LocationSelectorProps) {
  const [selectedState, setSelectedState] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [step, setStep] = useState<"state" | "city">("state")

  const filteredStates = Object.keys(statesAndCities).filter((state) =>
    state.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredCities = selectedState
    ? statesAndCities[selectedState].filter((city) => city.toLowerCase().includes(searchTerm.toLowerCase()))
    : []

  const handleStateSelect = (state: string) => {
    setSelectedState(state)
    setSearchTerm("")
    setStep("city")
  }

  const handleCitySelect = (city: string) => {
    onLocationSelect(selectedState, city)
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd reverse geocode these coordinates
          onLocationSelect("Current Location", "Current Location")
        },
        (error) => {
          console.error("Location access denied")
          // Fallback to manual selection
        },
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {step === "state" ? "Choose Your State" : `Select City in ${selectedState}`}
          </CardTitle>
          <p className="text-gray-600">
            {step === "state"
              ? "Find vehicles in your area by selecting your state first"
              : "Now choose your city to see local vehicle listings"}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder={step === "state" ? "Search states..." : "Search cities..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Current Location Option */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleUseCurrentLocation} className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>Use Current Location</span>
            </Button>
          </div>

          {/* States/Cities Grid */}
          <div className="max-h-96 overflow-y-auto">
            {step === "state" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {filteredStates.map((state) => (
                  <Button
                    key={state}
                    variant="outline"
                    onClick={() => handleStateSelect(state)}
                    className="justify-between h-auto p-3 text-left"
                  >
                    <span>{state}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setStep("state")
                      setSelectedState("")
                      setSearchTerm("")
                    }}
                    className="text-blue-600"
                  >
                    ← Back to States
                  </Button>
                  <Badge variant="secondary">{selectedState}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {filteredCities.map((city) => (
                    <Button
                      key={city}
                      variant="outline"
                      onClick={() => handleCitySelect(city)}
                      className="justify-start h-auto p-3 text-left"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      {city}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Skip Option */}
          <div className="text-center pt-4 border-t">
            <Button variant="ghost" onClick={onSkip} className="text-gray-600 hover:text-gray-800">
              Skip for now - Browse all locations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
