"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  Send,
  Search,
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Check,
  Settings,
  User,
  MessageSquare,
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// PSEUDO: Define TypeScript interfaces for type safety
interface UserProfile {
  id: string
  first_name: string
  last_name: string
  avatar_url: string | null
  email: string
}

interface Listing {
  id: number
  title: string
  price: number
  listing_photos: Array<{ photo_url: string; is_main_photo: boolean }>
}

interface Message {
  id: string
  content: string
  sender_id: string
  created_at: string
  read_at: string | null
}

interface Conversation {
  id: string
  listing_id: number
  buyer_id: string
  seller_id: string
  created_at: string
  updated_at: string
  listing: Listing
  other_user: UserProfile
  last_message: Message | null
  unread_count: number
}

export default function MessagesPage() {
  const { user, profile } = useAuth()

  // PSEUDO: Initialize state variables for component data management
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [isMobileView, setIsMobileView] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // PSEUDO: Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // PSEUDO: Request browser notification permission from user
  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      return permission
    }
    return "denied"
  }

  // PSEUDO: Display native browser notification with title, body, and icon
  const showNotification = (title: string, body: string, icon?: string) => {
    if (notificationPermission === "granted" && "Notification" in window) {
      const notification = new Notification(title, {
        body,
        icon: icon || "/favicon.ico",
        badge: "/favicon.ico",
        tag: "message-notification",
      })

      // PSEUDO: Auto-close notification after 5 seconds
      setTimeout(() => notification.close(), 5000)

      // PSEUDO: Focus window when user clicks notification
      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }
  }

  // PSEUDO: Load all conversations where current user is buyer or seller
  const loadConversations = async () => {
    if (!user || !profile) return

    try {
      setIsLoading(true)

      // PSEUDO: Query conversations table with listing data joined
      const { data: conversationsData, error } = await supabase
        .from("conversations")
        .select(`
          *,
          listings!inner (
            id,
            title,
            price,
            listing_photos (photo_url, is_main_photo)
          )
        `)
        .or(`buyer_id.eq.${profile.id},seller_id.eq.${profile.id}`)
        .order("updated_at", { ascending: false })

      if (error) throw error

      // PSEUDO: Enrich each conversation with additional data
      const enrichedConversations = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          // PSEUDO: Determine who the "other user" is (not current user)
          const otherUserId = conv.buyer_id === profile.id ? conv.seller_id : conv.buyer_id

          // PSEUDO: Fetch other user's profile information
          const { data: otherUser } = await supabase
            .from("user_profiles")
            .select("id, first_name, last_name, avatar_url, email")
            .eq("id", otherUserId)
            .single()

          // PSEUDO: Get the most recent message in this conversation
          const { data: lastMessage } = await supabase
            .from("messages")
            .select("id, content, sender_id, created_at, read_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()

          // PSEUDO: Count unread messages from other users
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .neq("sender_id", profile.id)
            .is("read_at", null)

          // PSEUDO: Return enriched conversation object
          return {
            ...conv,
            listing: {
              id: conv.listings.id,
              title: conv.listings.title,
              price: conv.listings.price,
              listing_photos: conv.listings.listing_photos || [],
            },
            other_user: otherUser,
            last_message: lastMessage,
            unread_count: unreadCount || 0,
          }
        }),
      )

      setConversations(enrichedConversations)

      // PSEUDO: Auto-select first conversation on desktop view
      if (enrichedConversations.length > 0 && !selectedConversation && !isMobileView) {
        setSelectedConversation(enrichedConversations[0])
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // PSEUDO: Load all messages for a specific conversation
  const loadMessages = async (conversationId: string) => {
    try {
      // PSEUDO: Fetch messages ordered chronologically
      const { data, error } = await supabase
        .from("messages")
        .select("id, content, sender_id, created_at, read_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setMessages(data || [])

      // PSEUDO: Mark all unread messages as read
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .neq("sender_id", profile?.id)
        .is("read_at", null)

      // PSEUDO: Refresh conversation list to update unread counts
      loadConversations()
    } catch (error) {
      console.error("Error loading messages:", error)
    }
  }

  // PSEUDO: Send a new message to the selected conversation
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !profile || isSending) return

    setIsSending(true)
    try {
      // PSEUDO: Insert new message into database
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: profile.id,
          content: newMessage.trim(),
        })
        .select("id, content, sender_id, created_at, read_at")
        .single()

      if (error) throw error

      // PSEUDO: Add message to local state for immediate UI update
      setMessages((prev) => [...prev, data])
      setNewMessage("")

      // PSEUDO: Update conversation timestamp for proper sorting
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", selectedConversation.id)
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  // PSEUDO: Handle Enter key press to send message
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // PSEUDO: Format timestamp for display (relative time)
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

  // PSEUDO: Get message status icon (delivered/read) for sent messages
  const getMessageStatus = (message: Message) => {
    if (message.sender_id !== profile?.id) return null // Only show for sent messages

    if (message.read_at) {
      return <CheckCheck className="h-3 w-3 text-blue-400" /> // Read
    } else {
      return <Check className="h-3 w-3 text-gray-400" /> // Delivered
    }
  }

  // PSEUDO: Filter conversations based on search query
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.other_user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.other_user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.listing.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // PSEUDO: Initialize component on mount
  useEffect(() => {
    if (user && profile) {
      loadConversations()
      requestNotificationPermission()
    }
  }, [user, profile])

  // PSEUDO: Load messages when conversation selection changes
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
      setIsMobileView(true) // Show chat view on mobile
    }
  }, [selectedConversation])

  // PSEUDO: Set up real-time subscriptions for live updates
  useEffect(() => {
    if (!profile) return

    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as Message

          // PSEUDO: Add message to current conversation if it matches
          if (selectedConversation && newMessage.conversation_id === selectedConversation.id) {
            setMessages((prev) => [...prev, newMessage])

            // PSEUDO: Auto-mark as read if not from current user
            if (newMessage.sender_id !== profile.id) {
              supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", newMessage.id).then()
            }
          }

          // PSEUDO: Show browser notification for messages from others
          if (newMessage.sender_id !== profile.id) {
            const conversation = conversations.find((conv) => conv.id === newMessage.conversation_id)
            if (conversation) {
              showNotification(
                `New message from ${conversation.other_user.first_name} ${conversation.other_user.last_name}`,
                newMessage.content,
                conversation.other_user.avatar_url || undefined,
              )
            }
          }

          // PSEUDO: Refresh conversations to update last message and counts
          loadConversations()
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const updatedMessage = payload.new as Message

          // PSEUDO: Update message read status in current conversation
          if (selectedConversation && updatedMessage.conversation_id === selectedConversation.id) {
            setMessages((prev) =>
              prev.map((msg) => (msg.id === updatedMessage.id ? { ...msg, read_at: updatedMessage.read_at } : msg)),
            )
          }
        },
      )
      .subscribe()

    // PSEUDO: Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile, selectedConversation, conversations])

  // PSEUDO: Render sign-in prompt if user not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view your messages.</p>
          <Button asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    )
  }

  // PSEUDO: Render loading spinner while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  // PSEUDO: Render main messaging interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* PSEUDO: Header with navigation and notification bell */}
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
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>
                        {profile?.first_name?.[0]}
                        {profile?.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/messages" className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => supabase.auth.signOut()}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* PSEUDO: Show empty state if no conversations exist */}
        {conversations.length === 0 ? (
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Messages Yet</h1>
            <p className="text-gray-600 mb-6">Start browsing listings and message sellers to begin conversations.</p>
            <Button asChild>
              <Link href="/">Browse Listings</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
            {/* PSEUDO: Left sidebar - Conversations list */}
            <div className={`lg:col-span-1 ${isMobileView && selectedConversation ? "hidden lg:block" : ""}`}>
              <Card className="h-full">
                <CardContent className="p-0 h-full flex flex-col">
                  {/* PSEUDO: Search input for filtering conversations */}
                  <div className="p-4 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* PSEUDO: Scrollable list of conversations */}
                  <ScrollArea className="flex-1">
                    <div className="space-y-1 p-2">
                      {filteredConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedConversation?.id === conversation.id
                              ? "bg-blue-50 border border-blue-200"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedConversation(conversation)}
                        >
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={conversation.other_user.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback>
                                {conversation.other_user.first_name[0]}
                                {conversation.other_user.last_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {conversation.other_user.first_name} {conversation.other_user.last_name}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  {conversation.unread_count > 0 && (
                                    <Badge className="bg-blue-500 text-white text-xs">
                                      {conversation.unread_count}
                                    </Badge>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {conversation.last_message && formatTime(conversation.last_message.created_at)}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 truncate mt-1">{conversation.listing.title}</p>
                              {conversation.last_message && (
                                <p className="text-sm text-gray-500 truncate mt-1">
                                  <span className="font-medium">
                                    {conversation.last_message.sender_id === profile?.id
                                      ? "You"
                                      : conversation.other_user.first_name}
                                    :
                                  </span>{" "}
                                  {conversation.last_message.content}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* PSEUDO: Right side - Chat interface */}
            {selectedConversation && (
              <div className={`lg:col-span-2 ${!isMobileView ? "hidden lg:block" : ""}`}>
                <Card className="h-full">
                  <CardContent className="p-0 h-full flex flex-col">
                    {/* PSEUDO: Chat header with user info and actions */}
                    <div className="p-4 border-b bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="lg:hidden"
                            onClick={() => {
                              setSelectedConversation(null)
                              setIsMobileView(false)
                            }}
                          >
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                          <Link
                            href={`/seller/${selectedConversation.other_user.id}`}
                            className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                          >
                            <Avatar>
                              <AvatarImage src={selectedConversation.other_user.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback>
                                {selectedConversation.other_user.first_name[0]}
                                {selectedConversation.other_user.last_name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {selectedConversation.other_user.first_name} {selectedConversation.other_user.last_name}
                              </h3>
                              <p className="text-sm text-gray-500">Online</p>
                            </div>
                          </Link>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Video className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* PSEUDO: Listing context card showing what the conversation is about */}
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Image
                            src={
                              selectedConversation.listing.listing_photos.find((p) => p.is_main_photo)?.photo_url ||
                              selectedConversation.listing.listing_photos[0]?.photo_url ||
                              "/placeholder.svg" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt={selectedConversation.listing.title}
                            width={60}
                            height={45}
                            className="rounded object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{selectedConversation.listing.title}</h4>
                            <p className="text-lg font-bold text-blue-600">
                              ${selectedConversation.listing.price.toLocaleString()}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/listing/${selectedConversation.listing_id}`}>View Listing</Link>
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* PSEUDO: Scrollable messages area */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <p>No messages yet. Start the conversation!</p>
                          </div>
                        ) : (
                          messages.map((message) => (
                            <div
                              key={message.id}
                              className={`flex ${message.sender_id === profile?.id ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                  message.sender_id === profile?.id
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-900"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                                <div
                                  className={`flex items-center justify-end space-x-1 mt-1 ${
                                    message.sender_id === profile?.id ? "text-blue-100" : "text-gray-500"
                                  }`}
                                >
                                  <span className="text-xs">{formatTime(message.created_at)}</span>
                                  {getMessageStatus(message)}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* PSEUDO: Message input area with send button */}
                    <div className="p-4 border-t bg-white">
                      <div className="flex items-end space-x-2">
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
                        <Button onClick={sendMessage} disabled={!newMessage.trim() || isSending}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
