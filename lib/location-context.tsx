/**
 * PSEUDO CODE: Location Context Provider
 *
 * PURPOSE: Manage user location preferences and vehicle search criteria
 * FLOW:
 *   1. INITIALIZE location and vehicle preference state
 *   2. PERSIST data to localStorage
 *   3. PROVIDE methods to update preferences
 */

"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

// STEP 1: Define interfaces for type safety
interface VehiclePreferences {
  intent: "buy" | "sell" | ""
  bodyType: string
  yearRange: [number, number]
  make: string
  model: string
  priceRange: [number, number]
}

type LocationContextType = {
  selectedLocation: { state: string; city: string } | null
  setSelectedLocation: (location: { state: string; city: string } | null) => void
  clearLocation: () => void
  hasSelectedLocation: boolean
  vehiclePreferences: VehiclePreferences | null
  setVehiclePreferences: (preferences: VehiclePreferences | null) => void
  hasSelectedPreferences: boolean
}

// STEP 2: Create React context
const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: React.ReactNode }) {
  // STEP 3: Initialize state
  const [selectedLocation, setSelectedLocationState] = useState<{ state: string; city: string } | null>(null)
  const [vehiclePreferences, setVehiclePreferencesState] = useState<VehiclePreferences | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  /**
   * PSEUDO CODE: Load Saved Data
   * FLOW:
   *   1. GET location and preferences from localStorage
   *   2. PARSE JSON data safely
   *   3. SET state with saved data
   *   4. MARK as loaded
   */
  useEffect(() => {
    try {
      const savedLocation = localStorage.getItem("garageList_selectedLocation")
      const savedPreferences = localStorage.getItem("garageList_vehiclePreferences")

      if (savedLocation) {
        const parsed = JSON.parse(savedLocation)
        setSelectedLocationState(parsed)
      }

      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences)
        setVehiclePreferencesState(parsed)
      }
    } catch (error) {
      console.error("Error loading saved data:", error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  /**
   * PSEUDO CODE: Save Location to Storage
   * FLOW:
   *   1. WAIT for initial load to complete
   *   2. IF location exists: SAVE to localStorage
   *   3. IF location is null: REMOVE from localStorage
   */
  useEffect(() => {
    if (isLoaded) {
      try {
        if (selectedLocation) {
          localStorage.setItem("garageList_selectedLocation", JSON.stringify(selectedLocation))
        } else {
          localStorage.removeItem("garageList_selectedLocation")
        }
      } catch (error) {
        console.error("Error saving location:", error)
      }
    }
  }, [selectedLocation, isLoaded])

  /**
   * PSEUDO CODE: Save Preferences to Storage
   * FLOW:
   *   1. WAIT for initial load to complete
   *   2. IF preferences exist: SAVE to localStorage
   *   3. IF preferences are null: REMOVE from localStorage
   */
  useEffect(() => {
    if (isLoaded) {
      try {
        if (vehiclePreferences) {
          localStorage.setItem("garageList_vehiclePreferences", JSON.stringify(vehiclePreferences))
        } else {
          localStorage.removeItem("garageList_vehiclePreferences")
        }
      } catch (error) {
        console.error("Error saving preferences:", error)
      }
    }
  }, [vehiclePreferences, isLoaded])

  // STEP 4: Define helper methods
  const setSelectedLocation = (location: { state: string; city: string } | null) => {
    setSelectedLocationState(location)
  }

  const clearLocation = () => {
    setSelectedLocationState(null)
    setVehiclePreferencesState(null)
  }

  const setVehiclePreferences = (preferences: VehiclePreferences | null) => {
    setVehiclePreferencesState(preferences)
  }

  // STEP 5: Calculate derived state
  const hasSelectedLocation = selectedLocation !== null
  const hasSelectedPreferences = vehiclePreferences !== null

  const value = {
    selectedLocation,
    setSelectedLocation,
    clearLocation,
    hasSelectedLocation,
    vehiclePreferences,
    setVehiclePreferences,
    hasSelectedPreferences,
  }

  /**
   * PSEUDO CODE: Loading State
   * FLOW:
   *   1. WHILE loading saved data: SHOW loading spinner
   *   2. WHEN loaded: RENDER children with context
   */
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

/**
 * PSEUDO CODE: Location Hook
 * PURPOSE: Provide easy access to location context
 */
export function useLocation() {
  const context = useContext(LocationContext)
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider")
  }
  return context
}
