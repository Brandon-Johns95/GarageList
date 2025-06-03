"use client"

import { useState } from "react"
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  MessageCircle,
  Heart,
  TrendingUp,
  Calendar,
  DollarSign,
  Car,
  MoreHorizontal,
  Search,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { GarageListLogo } from "@/components/garage-list-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

// Mock user data
const user = {
  name: "John Smith",
  email: "john.smith@email.com",
  avatar: "/placeholder.svg?height=40&width=40",
  memberSince: "2023",
  totalListings: 8,
  activeListing: 3,
  soldListings: 5,
}

// Mock listings data
const listings = [
  {
    id: "GL-12345",
    title: "2020 Honda Civic LX",
    price: 18500,
    category: "cars-trucks",
    images: ["/placeholder.svg?height=200&width=300"],
    status: "active",
    views: 245,
    inquiries: 12,
    favorites: 8,
    publishedAt: "2024-01-15",
    expiresAt: "2024-02-14",
    location: "San Francisco, CA",
    condition: "Excellent",
    mileage: 45000,
  },
  {
    id: "GL-12346",
    title: "2018 Toyota Camry SE",
    price: 22000,
    category: "cars-trucks",
    images: ["/placeholder.svg?height=200&width=300"],
    status: "active",
    views: 189,
    inquiries: 8,
    favorites: 5,
    publishedAt: "2024-01-10",
    expiresAt: "2024-02-09",
    location: "San Francisco, CA",
    condition: "Very Good",
    mileage: 62000,
  },
  {
    id: "GL-12347",
    title: "2019 Harley-Davidson Sportster",
    price: 8500,
    category: "motorcycles",
    images: ["/placeholder.svg?height=200&width=300"],
    status: "pending",
    views: 156,
    inquiries: 15,
    favorites: 12,
    publishedAt: "2024-01-20",
    expiresAt: "2024-02-19",
    location: "San Francisco, CA",
    condition: "Good",
    mileage: 12000,
  },
  {
    id: "GL-12348",
    title: "2017 Ford F-150 XLT",
    price: 28000,
    category: "cars-trucks",
    images: ["/placeholder.svg?height=200&width=300"],
    status: "sold",
    views: 412,
    inquiries: 28,
    favorites: 18,
    publishedAt: "2023-12-01",
    expiresAt: "2023-12-31",
    location: "San Francisco, CA",
    condition: "Excellent",
    mileage: 38000,
    soldAt: "2023-12-15",
    soldPrice: 27500,
  },
  {
    id: "GL-12349",
    title: "2021 Tesla Model 3",
    price: 35000,
    category: "cars-trucks",
    images: ["/placeholder.svg?height=200&width=300"],
    status: "expired",
    views: 89,
    inquiries: 3,
    favorites: 2,
    publishedAt: "2023-11-15",
    expiresAt: "2023-12-15",
    location: "San Francisco, CA",
    condition: "Like New",
    mileage: 25000,
  },
]

const inquiries = [
  {
    id: "INQ-001",
    listingId: "GL-12345",
    listingTitle: "2020 Honda Civic LX",
    buyerName: "Sarah Johnson",
    buyerAvatar: "/placeholder.svg?height=32&width=32",
    message: "Hi! I'm very interested in your Honda Civic. Is it still available? I'd love to schedule a test drive.",
    timestamp: "2024-01-22T10:30:00Z",
    status: "unread",
  },
  {
    id: "INQ-002",
    listingId: "GL-12346",
    listingTitle: "2018 Toyota Camry SE",
    buyerName: "Mike Chen",
    buyerAvatar: "/placeholder.svg?height=32&width=32",
    message: "What's the maintenance history on this Camry? Any accidents?",
    timestamp: "2024-01-22T09:15:00Z",
    status: "read",
  },
  {
    id: "INQ-003",
    listingId: "GL-12347",
    listingTitle: "2019 Harley-Davidson Sportster",
    buyerName: "David Rodriguez",
    buyerAvatar: "/placeholder.svg?height=32&width=32",
    message: "Is the price negotiable? I'm a serious buyer and can meet this weekend.",
    timestamp: "2024-01-21T16:45:00Z",
    status: "replied",
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />
    case "sold":
      return <DollarSign className="h-4 w-4 text-blue-500" />
    case "expired":
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "sold":
      return "bg-blue-100 text-blue-800"
    case "expired":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("listings")

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || listing.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalViews: listings.reduce((sum, listing) => sum + listing.views, 0),
    totalInquiries: listings.reduce((sum, listing) => sum + listing.inquiries, 0),
    totalFavorites: listings.reduce((sum, listing) => sum + listing.favorites, 0),
    activeListings: listings.filter((l) => l.status === "active").length,
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
                  Browse
                </Link>
                <Link href="/sell" className="text-gray-700 hover:text-blue-600">
                  Sell
                </Link>
                <Link href="/dashboard" className="text-blue-600 font-medium">
                  Dashboard
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild>
                <Link href="/sell">
                  <Plus className="h-4 w-4 mr-2" />
                  List Vehicle
                </Link>
              </Button>
              <Avatar>
                <AvatarImage src={user.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h1>
          <p className="text-gray-600">Manage your listings and track your selling performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Listings</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeListings}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Car className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Inquiries</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalInquiries}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Favorites</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalFavorites}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listings">My Listings</TabsTrigger>
            <TabsTrigger value="inquiries">
              Inquiries
              {inquiries.filter((i) => i.status === "unread").length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs">
                  {inquiries.filter((i) => i.status === "unread").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Listings Tab */}
          <TabsContent value="listings" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search your listings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Listings Grid */}
            <div className="space-y-4">
              {filteredListings.map((listing) => (
                <Card key={listing.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="lg:w-64">
                        <Image
                          src={listing.images[0] || "/placeholder.svg"}
                          alt={listing.title}
                          width={300}
                          height={200}
                          className="w-full h-48 lg:h-32 object-cover rounded-lg"
                        />
                      </div>

                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{listing.title}</h3>
                            <p className="text-2xl font-bold text-blue-600">${listing.price.toLocaleString()}</p>
                            <p className="text-sm text-gray-600">ID: {listing.id}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(listing.status)}>
                              {getStatusIcon(listing.status)}
                              <span className="ml-1 capitalize">{listing.status}</span>
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/listing/${listing.id}`}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Listing
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/sell/edit/${listing.id}`}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Listing
                                  </Link>
                                </DropdownMenuItem>
                                {listing.status === "expired" && (
                                  <DropdownMenuItem>
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Renew Listing
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Listing
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{listing.views} views</span>
                          </div>
                          <div className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{listing.inquiries} inquiries</span>
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-1 text-gray-400" />
                            <span>{listing.favorites} favorites</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            <span>Expires {new Date(listing.expiresAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {listing.status === "sold" && (
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-sm text-green-800">
                              <strong>Sold for ${listing.soldPrice?.toLocaleString()}</strong> on{" "}
                              {new Date(listing.soldAt!).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/listing/${listing.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/sell/edit/${listing.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </Button>
                          {listing.status === "active" && (
                            <Button variant="outline" size="sm">
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Boost
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredListings.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No listings found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm || statusFilter !== "all"
                        ? "Try adjusting your search or filters"
                        : "You haven't created any listings yet"}
                    </p>
                    <Button asChild>
                      <Link href="/sell">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Listing
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries" className="space-y-6">
            <div className="space-y-4">
              {inquiries.map((inquiry) => (
                <Card key={inquiry.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage src={inquiry.buyerAvatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {inquiry.buyerName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{inquiry.buyerName}</h4>
                            <p className="text-sm text-gray-600">
                              Interested in:{" "}
                              <Link href={`/listing/${inquiry.listingId}`} className="text-blue-600 hover:underline">
                                {inquiry.listingTitle}
                              </Link>
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={inquiry.status === "unread" ? "default" : "secondary"}>
                              {inquiry.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(inquiry.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4">{inquiry.message}</p>
                        <div className="flex space-x-2">
                          <Button size="sm">Reply</Button>
                          <Button variant="outline" size="sm">
                            Mark as Read
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {inquiries.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</h3>
                    <p className="text-gray-600">When buyers contact you about your listings, they'll appear here</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Views to Inquiries Rate</span>
                      <span>{((stats.totalInquiries / stats.totalViews) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(stats.totalInquiries / stats.totalViews) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Inquiries to Favorites Rate</span>
                      <span>{((stats.totalFavorites / stats.totalInquiries) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={(stats.totalFavorites / stats.totalInquiries) * 100} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Listing</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const topListing = listings.reduce((prev, current) => (prev.views > current.views ? prev : current))
                    return (
                      <div className="flex items-center space-x-4">
                        <Image
                          src={topListing.images[0] || "/placeholder.svg"}
                          alt={topListing.title}
                          width={80}
                          height={60}
                          className="rounded-lg object-cover"
                        />
                        <div>
                          <h4 className="font-semibold">{topListing.title}</h4>
                          <p className="text-sm text-gray-600">{topListing.views} views</p>
                          <p className="text-sm text-gray-600">{topListing.inquiries} inquiries</p>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
