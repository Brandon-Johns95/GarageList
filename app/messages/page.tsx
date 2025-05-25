"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import {
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  ImageIcon,
  Calendar,
  MapPin,
  Star,
  Archive,
  Trash2,
  Flag,
  CheckCheck,
  Check,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { GarageListLogo } from "@/components/garage-list-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

// Mock current user
const currentUser = {
  id: "user-1",
  name: "John Smith",
  avatar: "/placeholder.svg?height=40&width=40",
}

// Mock conversations
const conversations = [
  {
    id: "conv-1",
    listingId: "GL-12345",
    listingTitle: "2020 Honda Civic LX",
    listingPrice: 18500,
    listingImage: "/placeholder.svg?height=60&width=80",
    otherUser: {
      id: "user-2",
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.8,
      reviewCount: 12,
    },
    lastMessage: {
      text: "Great! I can meet tomorrow at 2 PM. Should I bring anything specific for the test drive?",
      timestamp: "2024-01-22T14:30:00Z",
      senderId: "user-2",
    },
    unreadCount: 2,
    status: "active",
  },
  {
    id: "conv-2",
    listingId: "GL-12346",
    listingTitle: "2018 Toyota Camry SE",
    listingPrice: 22000,
    listingImage: "/placeholder.svg?height=60&width=80",
    otherUser: {
      id: "user-3",
      name: "Mike Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.9,
      reviewCount: 8,
    },
    lastMessage: {
      text: "Thanks for the detailed photos. The car looks great!",
      timestamp: "2024-01-22T10:15:00Z",
      senderId: "user-1",
    },
    unreadCount: 0,
    status: "active",
  },
  {
    id: "conv-3",
    listingId: "GL-12347",
    listingTitle: "2019 Harley-Davidson Sportster",
    listingPrice: 8500,
    listingImage: "/placeholder.svg?height=60&width=80",
    otherUser: {
      id: "user-4",
      name: "David Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
      rating: 4.7,
      reviewCount: 15,
    },
    lastMessage: {
      text: "Is the price negotiable? I'm very interested.",
      timestamp: "2024-01-21T16:45:00Z",
      senderId: "user-4",
    },
    unreadCount: 1,
    status: "active",
  },
]

// Mock messages for active conversation
const messages = [
  {
    id: "msg-1",
    senderId: "user-2",
    text: "Hi! I'm very interested in your Honda Civic. Is it still available?",
    timestamp: "2024-01-22T09:00:00Z",
    status: "read",
  },
  {
    id: "msg-2",
    senderId: "user-1",
    text: "Yes, it's still available! Thanks for your interest. Do you have any specific questions about the car?",
    timestamp: "2024-01-22T09:15:00Z",
    status: "read",
  },
  {
    id: "msg-3",
    senderId: "user-2",
    text: "What's the maintenance history like? Any accidents or major repairs?",
    timestamp: "2024-01-22T09:30:00Z",
    status: "read",
  },
  {
    id: "msg-4",
    senderId: "user-1",
    text: "No accidents at all! I have all maintenance records. Oil changes every 5,000 miles, new tires last year, and brakes were done 6 months ago. It's been garage kept.",
    timestamp: "2024-01-22T09:45:00Z",
    status: "read",
  },
  {
    id: "msg-5",
    senderId: "user-2",
    text: "That sounds perfect! Would it be possible to schedule a test drive? I'm available this weekend.",
    timestamp: "2024-01-22T10:00:00Z",
    status: "read",
  },
  {
    id: "msg-6",
    senderId: "user-1",
    text: "How about Saturday at 2 PM? We can meet at the Starbucks on Main Street - it's a safe public location with a good parking lot for the test drive.",
    timestamp: "2024-01-22T10:30:00Z",
    status: "read",
  },
  {
    id: "msg-7",
    senderId: "user-2",
    text: "Great! I can meet tomorrow at 2 PM. Should I bring anything specific for the test drive?",
    timestamp: "2024-01-22T14:30:00Z",
    status: "delivered",
  },
  {
    id: "msg-8",
    senderId: "user-2",
    text: "Also, I'm pre-approved for financing if that helps with the process.",
    timestamp: "2024-01-22T14:31:00Z",
    status: "delivered",
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message to the backend
      console.log("Sending message:", newMessage)
      setNewMessage("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 48) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  const getMessageStatus = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3 text-gray-400" />
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-gray-400" />
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />
      default:
        return null
    }
  }

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.listingTitle.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link href="/messages" className="text-blue-600 font-medium">
                  Messages
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {currentUser.name
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardContent className="p-0 h-full flex flex-col">
              {/* Search */}
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Conversations */}
              <ScrollArea className="flex-1">
                <div className="space-y-1 p-2">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedConversation.id === conversation.id
                          ? "bg-blue-50 border border-blue-200"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.otherUser.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {conversation.otherUser.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900 truncate">{conversation.otherUser.name}</h4>
                            <div className="flex items-center space-x-1">
                              {conversation.unreadCount > 0 && (
                                <Badge className="bg-blue-500 text-white text-xs">{conversation.unreadCount}</Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                {formatTime(conversation.lastMessage.timestamp)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 truncate">{conversation.listingTitle}</p>
                          <p className="text-sm text-gray-500 truncate mt-1">{conversation.lastMessage.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="lg:col-span-2">
            <CardContent className="p-0 h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={selectedConversation.otherUser.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        {selectedConversation.otherUser.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedConversation.otherUser.name}</h3>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-xs text-gray-600">
                            {selectedConversation.otherUser.rating} ({selectedConversation.otherUser.reviewCount})
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-600">Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Video className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive Conversation
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Flag className="h-4 w-4 mr-2" />
                          Report User
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Conversation
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Listing Context */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Image
                      src={selectedConversation.listingImage || "/placeholder.svg"}
                      alt={selectedConversation.listingTitle}
                      width={60}
                      height={45}
                      className="rounded object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{selectedConversation.listingTitle}</h4>
                      <p className="text-lg font-bold text-blue-600">
                        ${selectedConversation.listingPrice.toLocaleString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/listing/${selectedConversation.listingId}`}>View Listing</Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === currentUser.id ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === currentUser.id ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <div
                          className={`flex items-center justify-end space-x-1 mt-1 ${
                            message.senderId === currentUser.id ? "text-blue-100" : "text-gray-500"
                          }`}
                        >
                          <span className="text-xs">{formatTime(message.timestamp)}</span>
                          {message.senderId === currentUser.id && getMessageStatus(message.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-white">
                <div className="flex items-end space-x-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="min-h-[40px] max-h-32 resize-none"
                      rows={1}
                    />
                  </div>
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-2 mt-2">
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    Share Location
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
