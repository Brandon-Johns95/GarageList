interface DistanceResult {
  distance: {
    text: string
    value: number
    miles: number
  }
  duration: {
    text: string
    value: number
  }
  origin: string
  destination: string
  error?: string
}

interface BulkDistanceResult {
  success: boolean
  results: DistanceResult[]
  error?: string
}

// Calculate distance between two locations
export async function calculateDistance(
  origin: string,
  destination: string,
  units: "imperial" | "metric" = "imperial",
): Promise<DistanceResult | null> {
  try {
    const params = new URLSearchParams({
      origin,
      destination,
      units,
    })

    const response = await fetch(`/api/distance/calculate?${params}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (!data.success) {
      console.error("Distance calculation failed:", data.error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error calculating distance:", error)
    return null
  }
}

// Calculate distances from one origin to multiple destinations
export async function calculateBulkDistances(
  origin: string,
  destinations: string[],
  units: "imperial" | "metric" = "imperial",
): Promise<BulkDistanceResult> {
  try {
    const response = await fetch("/api/distance/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        origins: [origin],
        destinations,
        units,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error calculating bulk distances:", error)
    return {
      success: false,
      results: [],
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Format distance for display
export function formatDistance(miles: number): string {
  if (miles < 1) {
    return "< 1 mile"
  } else if (miles < 10) {
    return `${miles.toFixed(1)} miles`
  } else {
    return `${Math.round(miles)} miles`
  }
}

// Format duration for display
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

// Check if location is within radius
export function isWithinRadius(distanceMiles: number, radiusMiles: number): boolean {
  return distanceMiles <= radiusMiles
}

// Sort listings by distance
export function sortByDistance<T extends { distance?: number }>(items: T[], direction: "asc" | "desc" = "asc"): T[] {
  return [...items].sort((a, b) => {
    const distanceA = a.distance || Number.POSITIVE_INFINITY
    const distanceB = b.distance || Number.POSITIVE_INFINITY

    if (direction === "asc") {
      return distanceA - distanceB
    } else {
      return distanceB - distanceA
    }
  })
}

// Cache for distance calculations to avoid repeated API calls
class DistanceCache {
  private cache = new Map<string, DistanceResult>()
  private maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

  private getCacheKey(origin: string, destination: string): string {
    return `${origin.toLowerCase()}|${destination.toLowerCase()}`
  }

  get(origin: string, destination: string): DistanceResult | null {
    const key = this.getCacheKey(origin, destination)
    const cached = this.cache.get(key)

    if (cached && Date.now() - (cached as any).timestamp < this.maxAge) {
      return cached
    }

    // Remove expired entry
    if (cached) {
      this.cache.delete(key)
    }

    return null
  }

  set(origin: string, destination: string, result: DistanceResult): void {
    const key = this.getCacheKey(origin, destination)
    ;(result as any).timestamp = Date.now()
    this.cache.set(key, result)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }
}

export const distanceCache = new DistanceCache()
