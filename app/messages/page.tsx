"use client"
import { useState, useEffect } from "react"
import { Search, MessageSquare, Archive, Pin } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EnhancedMessagingInterface } from "@/components/messaging/enhanced-messaging-interface"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import { useLocation } from "@/lib/location-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Header } from "@/components/header"

// TypeScript interfaces
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
  archived_by_buyer: boolean
  archived_by_seller: boolean
  pinned_by_buyer: boolean
  pinned_by_seller: boolean
  listing: Listing
  other_user: UserProfile
  last_message: Message | null
  unread_count: number
}

export default function MessagesPage() {
  const { user, profile, signOut } = useAuth()
  const { selectedLocation, clearLocation } = useLocation()

  // Remove these lines:
  // const [showSignIn, setShowSignIn] = useState(false)
  // const [showSignUp, setShowSignUp] = useState(false)

  // State management
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileView, setIsMobileView] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Load conversations
  const loadConversations = async () => {
    if (!user || !profile) return

    try {
      setIsLoading(true)

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

      // Enrich conversations with additional data
      const enrichedConversations = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          const otherUserId = conv.buyer_id === profile.id ? conv.seller_id : conv.buyer_id
          const isArchivedByUser = conv.buyer_id === profile.id ? conv.archived_by_buyer : conv.archived_by_seller
          const isPinnedByUser = conv.buyer_id === profile.id ? conv.pinned_by_buyer : conv.pinned_by_seller

          // Skip archived conversations unless specifically viewing them
          if (isArchivedByUser && !showArchived) return null

          // Get other user profile
          const { data: otherUser } = await supabase
            .from("user_profiles")
            .select("id, first_name, last_name, avatar_url, email")
            .eq("id", otherUserId)
            .single()

          // Get last message
          const { data: lastMessage } = await supabase
            .from("messages")
            .select("id, content, sender_id, created_at, read_at")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()

          // Count unread messages
          const { count: unreadCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .neq("sender_id", profile.id)
            .is("read_at", null)

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
            is_pinned: isPinnedByUser,
            is_archived: isArchivedByUser,
          }
        }),
      )

      // Filter out null values and sort (pinned first)
      const validConversations = enrichedConversations.filter(Boolean).sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1
        if (!a.is_pinned && b.is_pinned) return 1
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      })

      setConversations(validConversations)

      // Auto-select first conversation on desktop
      if (validConversations.length > 0 && !selectedConversation && !isMobileView) {
        setSelectedConversation(validConversations[0])
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Archive conversation
  const archiveConversation = async (conversationId: string) => {
    if (!profile) return

    try {
      const conversation = conversations.find((c) => c.id === conversationId)
      if (!conversation) return

      const updateField = conversation.buyer_id === profile.id ? "archived_by_buyer" : "archived_by_seller"

      const { error } = await supabase
        .from("conversations")
        .update({ [updateField]: true })
        .eq("id", conversationId)

      if (error) throw error

      // Remove from current view
      setConversations((prev) => prev.filter((c) => c.id !== conversationId))

      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null)
        setIsMobileView(false)
      }
    } catch (error) {
      console.error("Error archiving conversation:", error)
    }
  }

  // Pin conversation
  const pinConversation = async (conversationId: string) => {
    if (!profile) return

    try {
      const conversation = conversations.find((c) => c.id === conversationId)
      if (!conversation) return

      const updateField = conversation.buyer_id === profile.id ? "pinned_by_buyer" : "pinned_by_seller"
      const currentPinned =
        conversation.buyer_id === profile.id ? conversation.pinned_by_buyer : conversation.pinned_by_seller

      const { error } = await supabase
        .from("conversations")
        .update({ [updateField]: !currentPinned })
        .eq("id", conversationId)

      if (error) throw error

      // Update local state
      setConversations((prev) =>
        prev
          .map((c) => (c.id === conversationId ? { ...c, is_pinned: !currentPinned } : c))
          .sort((a, b) => {
            if (a.is_pinned && !b.is_pinned) return -1
            if (!a.is_pinned && b.is_pinned) return 1
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          }),
      )
    } catch (error) {
      console.error("Error pinning conversation:", error)
    }
  }

  // Block user
  const blockUser = async (userId: string) => {
    if (!profile) return

    try {
      const { error } = await supabase.from("user_blocks").insert({
        blocker_id: profile.id,
        blocked_id: userId,
        reason: "Blocked from messages",
      })

      if (error) throw error

      // Remove conversations with blocked user
      setConversations((prev) => prev.filter((c) => c.other_user.id !== userId))

      if (selectedConversation?.other_user.id === userId) {
        setSelectedConversation(null)
        setIsMobileView(false)
      }
    } catch (error) {
      console.error("Error blocking user:", error)
    }
  }

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    // Search filter
    const matchesSearch =
      conv.other_user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.other_user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.listing.title.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    // Type filter
    switch (filterType) {
      case "unread":
        return conv.unread_count > 0
      case "pinned":
        return conv.is_pinned
      case "archived":
        return conv.is_archived
      default:
        return true
    }
  })

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

  useEffect(() => {
    if (user && profile) {
      loadConversations()
    }
  }, [user, profile, showArchived])

  // Real-time subscriptions
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
        () => {
          loadConversations()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {conversations.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Messages Yet</h1>
            <p className="text-gray-600 mb-6">Start browsing listings and message sellers to begin conversations.</p>
            <Button asChild>
              <Link href="/">Browse Listings</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 h-[calc(100vh-8rem)] lg:h-[calc(100vh-12rem)]">
            {/* Conversations list - hidden on mobile when chat is open */}
            <div className={`lg:col-span-1 ${isMobileView && selectedConversation ? "hidden lg:block" : ""}`}>
              <Card className="h-full">
                <CardContent className="p-0 h-full flex flex-col">
                  {/* Search and filters */}
                  <div className="p-4 border-b space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Messages</SelectItem>
                          <SelectItem value="unread">Unread</SelectItem>
                          <SelectItem value="pinned">Pinned</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant={showArchived ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowArchived(!showArchived)}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Conversations list */}
                  <ScrollArea className="flex-1">
                    <div className="space-y-1 p-2">
                      {filteredConversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors relative ${
                            selectedConversation?.id === conversation.id
                              ? "bg-blue-50 border border-blue-200"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => {
                            setSelectedConversation(conversation)
                            if (isMobileView) {
                              setIsMobileView(true)
                            }
                          }}
                        >
                          {/* Pin indicator */}
                          {conversation.is_pinned && <Pin className="absolute top-2 right-2 h-3 w-3 text-blue-500" />}

                          <div className="flex items-start space-x-3">
                            <Avatar className="h-12 w-12 flex-shrink-0">
                              <AvatarImage src={conversation.other_user.avatar_url || "/placeholder.svg"} />
                              <AvatarFallback>
                                {conversation.other_user.first_name[0]}
                                {conversation.other_user.last_name[0]}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {conversation.other_user.first_name} {conversation.other_user.last_name}
                                </h4>
                                <div className="flex items-center space-x-2 flex-shrink-0">
                                  {conversation.unread_count > 0 && (
                                    <Badge className="bg-blue-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                                      {conversation.unread_count > 99 ? "99+" : conversation.unread_count}
                                    </Badge>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {conversation.last_message && formatTime(conversation.last_message.created_at)}
                                  </span>
                                </div>
                              </div>

                              <p className="text-sm text-gray-600 truncate mb-1">{conversation.listing.title}</p>

                              {conversation.last_message && (
                                <p className="text-sm text-gray-500 truncate">
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

            {/* Chat interface - full screen on mobile */}
            {selectedConversation && (
              <div className={`lg:col-span-2 ${!isMobileView && !selectedConversation ? "hidden lg:block" : ""}`}>
                <Card className="h-full">
                  <CardContent className="p-0 h-full">
                    <EnhancedMessagingInterface
                      conversationId={selectedConversation.id}
                      currentUserId={profile?.id || ""}
                      otherUser={{
                        id: selectedConversation.other_user.id,
                        name: `${selectedConversation.other_user.first_name} ${selectedConversation.other_user.last_name}`,
                        avatar: selectedConversation.other_user.avatar_url || "/placeholder.svg",
                      }}
                      listing={{
                        id: selectedConversation.listing.id.toString(),
                        title: selectedConversation.listing.title,
                        price: selectedConversation.listing.price,
                        images: selectedConversation.listing.listing_photos.map((p) => p.photo_url),
                      }}
                      onArchive={() => archiveConversation(selectedConversation.id)}
                      onPin={() => pinConversation(selectedConversation.id)}
                      onBlock={() => blockUser(selectedConversation.other_user.id)}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Empty state for desktop when no conversation selected */}
            {!selectedConversation && !isMobileView && conversations.length > 0 && (
              <div className="hidden lg:flex lg:col-span-2 items-center justify-center">
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p>Choose a conversation from the list to start messaging.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
