"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Eye, Calendar, Gauge, Fuel, Users, MapPin } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface FavoriteListing {
  id: number
  title: string
  price: number
  year: number
  mileage: number
  location: string
  condition: string
  status: string | null
  vehicle_category: string
  fuel_type: string
  transmission: string
  listing_photos: { photo_url: string; is_main_photo: boolean }[]
  user_profiles: {
    first_name: string | null
    last_name: string | null
    avatar_url: string | null
  } | null
  favorited_at: string
}

export function FavoritesSection() {
  const [favorites, setFavorites] = useState<FavoriteListing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data, error } = await supabase
        .from("favorites")
        .select(`
        created_at,
        listings!inner (
          id,
          title,
          price,
          year,
          mileage,
          location,
          condition,
          status,
          vehicle_category,
          fuel_type,
          transmission,
          seller_id,
          listing_photos (
            photo_url,
            is_main_photo
          )
        )
      `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Now fetch seller profiles separately for each listing
      const listingsWithProfiles = await Promise.all(
        (data || []).map(async (fav: any) => {
          const { data: profile, error: profileError } = await supabase
            .from("user_profiles")
            .select("first_name, last_name, avatar_url")
            .eq("id", fav.listings.seller_id)
            .maybeSingle()

          if (profileError) {
            console.error("Error fetching seller profile:", profileError)
          }

          return {
            ...fav.listings,
            user_profiles: profile,
            favorited_at: fav.created_at,
          }
        }),
      )

      setFavorites(listingsWithProfiles)
    } catch (error) {
      console.error("Error fetching favorites:", error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (listingId: number) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listingId)

      if (error) throw error

      setFavorites(favorites.filter((fav) => fav.id !== listingId))
    } catch (error) {
      console.error("Error removing favorite:", error)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "trucks":
        return "🚛"
      case "motorcycles":
        return "🏍️"
      case "boats":
        return "🚤"
      case "rvs":
        return "🚐"
      case "atvs":
        return "🏍️"
      default:
        return "🚗"
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-32 h-24 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-500 mb-4">
            Start browsing vehicles and click the heart icon to save your favorites here.
          </p>
          <Link href="/">
            <Button>Browse Vehicles</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {favorites.length} Favorite{favorites.length !== 1 ? "s" : ""}
        </h3>
      </div>

      <div className="grid gap-4">
        {favorites.map((listing) => {
          const mainPhoto = listing.listing_photos?.find((p) => p.is_main_photo)?.photo_url
          const sellerName = listing.user_profiles
            ? `${listing.user_profiles.first_name || ""} ${listing.user_profiles.last_name || ""}`.trim()
            : "Anonymous Seller"

          // If we have a profile but no name, show "Seller" instead of "Anonymous Seller"
          const displayName = sellerName || (listing.user_profiles ? "Seller" : "Anonymous Seller")

          return (
            <Card key={listing.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="relative w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {mainPhoto ? (
                      <img
                        src={mainPhoto || "/placeholder.svg"}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        {getCategoryIcon(listing.vehicle_category)}
                      </div>
                    )}
                    {listing.status === "pending" && (
                      <Badge className="absolute top-1 left-1 bg-yellow-500 text-white text-xs">Pending</Badge>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-lg truncate">{listing.title}</h4>
                        <p className="text-2xl font-bold text-blue-600">${listing.price.toLocaleString()}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFavorite(listing.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {listing.year}
                      </div>
                      <div className="flex items-center">
                        <Gauge className="h-3 w-3 mr-1" />
                        {listing.mileage?.toLocaleString()} mi
                      </div>
                      <div className="flex items-center">
                        <Fuel className="h-3 w-3 mr-1" />
                        {listing.fuel_type}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {listing.transmission}
                      </div>
                    </div>

                    <div className="flex items-center mt-2 text-sm text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      {listing.location}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={listing.user_profiles?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {displayName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{displayName}</span>
                      </div>

                      <Link href={`/listing/${listing.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
