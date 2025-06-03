"use client"

import { useState } from "react"
import { MapPin, Search, Loader2, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LocationSelectorProps {
  onLocationSelect: (state: string, city: string) => void
  onSkip: () => void
}

const allStates = [
  { code: "AL", name: "Alabama", cities: ["Birmingham", "Montgomery", "Mobile", "Huntsville"] },
  { code: "AK", name: "Alaska", cities: ["Anchorage", "Fairbanks", "Juneau", "Sitka"] },
  { code: "AZ", name: "Arizona", cities: ["Phoenix", "Tucson", "Mesa", "Chandler"] },
  { code: "AR", name: "Arkansas", cities: ["Little Rock", "Fort Smith", "Fayetteville", "Springdale"] },
  { code: "CA", name: "California", cities: ["Los Angeles", "San Francisco", "San Diego", "Sacramento"] },
  { code: "CO", name: "Colorado", cities: ["Denver", "Colorado Springs", "Aurora", "Fort Collins"] },
  { code: "CT", name: "Connecticut", cities: ["Bridgeport", "New Haven", "Hartford", "Stamford"] },
  { code: "DE", name: "Delaware", cities: ["Wilmington", "Dover", "Newark", "Middletown"] },
  { code: "FL", name: "Florida", cities: ["Miami", "Orlando", "Tampa", "Jacksonville"] },
  { code: "GA", name: "Georgia", cities: ["Atlanta", "Augusta", "Columbus", "Savannah"] },
  { code: "HI", name: "Hawaii", cities: ["Honolulu", "Pearl City", "Hilo", "Kailua"] },
  { code: "ID", name: "Idaho", cities: ["Boise", "Meridian", "Nampa", "Idaho Falls"] },
  { code: "IL", name: "Illinois", cities: ["Chicago", "Aurora", "Springfield", "Peoria"] },
  { code: "IN", name: "Indiana", cities: ["Indianapolis", "Fort Wayne", "Evansville", "South Bend"] },
  { code: "IA", name: "Iowa", cities: ["Des Moines", "Cedar Rapids", "Davenport", "Sioux City"] },
  { code: "KS", name: "Kansas", cities: ["Wichita", "Overland Park", "Kansas City", "Topeka"] },
  { code: "KY", name: "Kentucky", cities: ["Louisville", "Lexington", "Bowling Green", "Owensboro"] },
  { code: "LA", name: "Louisiana", cities: ["New Orleans", "Baton Rouge", "Shreveport", "Lafayette"] },
  { code: "ME", name: "Maine", cities: ["Portland", "Lewiston", "Bangor", "South Portland"] },
  { code: "MD", name: "Maryland", cities: ["Baltimore", "Frederick", "Rockville", "Gaithersburg"] },
  { code: "MA", name: "Massachusetts", cities: ["Boston", "Worcester", "Springfield", "Cambridge"] },
  { code: "MI", name: "Michigan", cities: ["Detroit", "Grand Rapids", "Warren", "Sterling Heights"] },
  { code: "MN", name: "Minnesota", cities: ["Minneapolis", "Saint Paul", "Rochester", "Duluth"] },
  { code: "MS", name: "Mississippi", cities: ["Jackson", "Gulfport", "Southaven", "Hattiesburg"] },
  { code: "MO", name: "Missouri", cities: ["Kansas City", "Saint Louis", "Springfield", "Columbia"] },
  { code: "MT", name: "Montana", cities: ["Billings", "Missoula", "Great Falls", "Bozeman"] },
  { code: "NE", name: "Nebraska", cities: ["Omaha", "Lincoln", "Bellevue", "Grand Island"] },
  { code: "NV", name: "Nevada", cities: ["Las Vegas", "Henderson", "Reno", "North Las Vegas"] },
  { code: "NH", name: "New Hampshire", cities: ["Manchester", "Nashua", "Concord", "Derry"] },
  { code: "NJ", name: "New Jersey", cities: ["Newark", "Jersey City", "Paterson", "Elizabeth"] },
  { code: "NM", name: "New Mexico", cities: ["Albuquerque", "Las Cruces", "Rio Rancho", "Santa Fe"] },
  { code: "NY", name: "New York", cities: ["New York City", "Buffalo", "Rochester", "Yonkers"] },
  { code: "NC", name: "North Carolina", cities: ["Charlotte", "Raleigh", "Greensboro", "Durham"] },
  { code: "ND", name: "North Dakota", cities: ["Fargo", "Bismarck", "Grand Forks", "Minot"] },
  { code: "OH", name: "Ohio", cities: ["Columbus", "Cleveland", "Cincinnati", "Toledo"] },
  { code: "OK", name: "Oklahoma", cities: ["Oklahoma City", "Tulsa", "Norman", "Broken Arrow"] },
  { code: "OR", name: "Oregon", cities: ["Portland", "Salem", "Eugene", "Gresham"] },
  { code: "PA", name: "Pennsylvania", cities: ["Philadelphia", "Pittsburgh", "Allentown", "Erie"] },
  { code: "RI", name: "Rhode Island", cities: ["Providence", "Warwick", "Cranston", "Pawtucket"] },
  { code: "SC", name: "South Carolina", cities: ["Charleston", "Columbia", "North Charleston", "Mount Pleasant"] },
  { code: "SD", name: "South Dakota", cities: ["Sioux Falls", "Rapid City", "Aberdeen", "Brookings"] },
  { code: "TN", name: "Tennessee", cities: ["Nashville", "Memphis", "Knoxville", "Chattanooga"] },
  { code: "TX", name: "Texas", cities: ["Houston", "San Antonio", "Dallas", "Austin"] },
  { code: "UT", name: "Utah", cities: ["Salt Lake City", "West Valley City", "Provo", "West Jordan"] },
  { code: "VT", name: "Vermont", cities: ["Burlington", "Essex", "South Burlington", "Colchester"] },
  { code: "VA", name: "Virginia", cities: ["Virginia Beach", "Norfolk", "Chesapeake", "Richmond"] },
  { code: "WA", name: "Washington", cities: ["Seattle", "Spokane", "Tacoma", "Vancouver"] },
  { code: "WV", name: "West Virginia", cities: ["Charleston", "Huntington", "Parkersburg", "Morgantown"] },
  { code: "WI", name: "Wisconsin", cities: ["Milwaukee", "Madison", "Green Bay", "Kenosha"] },
  { code: "WY", name: "Wyoming", cities: ["Cheyenne", "Casper", "Laramie", "Gillette"] },
]

export function LocationSelector({ onLocationSelect, onSkip }: LocationSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState("")

  const getCurrentLocation = async () => {
    setIsGettingLocation(true)
    setLocationError("")

    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by this browser")
      }

      // Get user's coordinates
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        })
      })

      const { latitude, longitude } = position.coords

      // Use Google Maps Geocoding API to get location details
      const response = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`)

      if (!response.ok) {
        throw new Error("Failed to get location details")
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // Extract city and state from the response
      const { city, state } = data

      if (city && state) {
        onLocationSelect(state, city)
      } else {
        throw new Error("Could not determine your city and state")
      }
    } catch (error) {
      console.error("Error getting current location:", error)

      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied. Please enable location permissions and try again.")
            break
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable. Please select your location manually.")
            break
          case error.TIMEOUT:
            setLocationError("Location request timed out. Please try again or select manually.")
            break
          default:
            setLocationError("An unknown error occurred while getting your location.")
            break
        }
      } else {
        setLocationError(error instanceof Error ? error.message : "Failed to get your current location")
      }
    } finally {
      setIsGettingLocation(false)
    }
  }

  const filteredStates = allStates.filter(
    (state) =>
      state.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      state.cities.some((city) => city.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Welcome to GarageList</CardTitle>
          <p className="text-gray-600 text-lg">Let's find vehicles in your area. Where are you located?</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Location Button */}
          <div className="text-center">
            <Button
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              size="lg"
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Getting your location...
                </>
              ) : (
                <>
                  <Navigation className="h-5 w-5 mr-2" />
                  Use My Current Location
                </>
              )}
            </Button>

            {locationError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{locationError}</p>
              </div>
            )}
          </div>

          <div className="text-center text-gray-500">
            <span>or</span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search for your city or state..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>

          {/* Popular States and Cities */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredStates.map((state) => (
              <Card key={state.code} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    {state.name}
                  </h3>
                  <div className="space-y-2">
                    {state.cities
                      .filter(
                        (city) =>
                          searchTerm === "" ||
                          city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          state.name.toLowerCase().includes(searchTerm.toLowerCase()),
                      )
                      .map((city) => (
                        <Button
                          key={city}
                          variant="ghost"
                          className="w-full justify-start text-left h-auto py-2 px-3"
                          onClick={() => onLocationSelect(state.name, city)}
                        >
                          {city}
                        </Button>
                      ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredStates.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <p className="text-gray-500">No locations found matching "{searchTerm}"</p>
              <p className="text-sm text-gray-400 mt-2">Try searching for a different city or state</p>
            </div>
          )}

          {/* Skip Option */}
          <div className="text-center pt-4 border-t">
            <Button variant="outline" onClick={onSkip} className="text-gray-600">
              Skip for now - Browse all locations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
