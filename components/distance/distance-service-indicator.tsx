"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Info, MapPin, Zap } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ServiceStatus {
  googleMapsAvailable: boolean
  fallbackAvailable: boolean
  recommendedService: string
  message: string
}

export function DistanceServiceIndicator() {
  const [status, setStatus] = useState<ServiceStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch("/api/distance/verify-key")
        const data = await response.json()
        setStatus(data)
      } catch (error) {
        console.error("Failed to check distance service status:", error)
      } finally {
        setLoading(false)
      }
    }

    checkStatus()
  }, [])

  if (loading || !status) {
    return null
  }

  const getIndicator = () => {
    if (status.googleMapsAvailable) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
          <Zap className="w-3 h-3 mr-1" />
          Premium Distance
        </Badge>
      )
    } else if (status.fallbackAvailable) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
          <MapPin className="w-3 h-3 mr-1" />
          Estimated Distance
        </Badge>
      )
    } else {
      return (
        <Badge variant="destructive">
          <Info className="w-3 h-3 mr-1" />
          Distance Unavailable
        </Badge>
      )
    }
  }

  const getTooltipContent = () => {
    if (status.googleMapsAvailable) {
      return "Using Google Routes API for precise driving directions and real-time traffic data"
    } else if (status.fallbackAvailable) {
      return "Using estimated distances based on straight-line calculations. Actual driving distance may vary."
    } else {
      return "Distance calculation services are currently unavailable"
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-block">{getIndicator()}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{getTooltipContent()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
