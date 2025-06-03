"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { supabase } from "@/lib/supabase"
import { Send, Calendar } from "lucide-react"
import Image from "next/image"

interface Message {
  id: string
  content: string
  sender_id: string
  message_type: string
  created_at: string
  read_at?: string
}

interface MessagingInterfaceProps {
  conversationId: string
  currentUserId: string
  otherUser: {
    id: string
    name: string
    avatar: string
  }
  listing: {
    id: string
    title: string
    price: number
    images: string[]
  }
}

export function MessagingInterface({ conversationId, currentUserId, otherUser, listing }: MessagingInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setMessages(data || [])

      // Mark messages as read
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .neq("sender_id", currentUserId)
        .is("read_at", null)
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: newMessage.trim(),
          message_type: "text",
        })
        .select("*")
        .single()

      if (error) throw error

      setMessages((prev) => [...prev, data])
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  const sendQuickMessage = async (content: string) => {
    if (isSending) return

    setIsSending(true)
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content,
          message_type: "text",
        })
        .select("*")
        .single()

      if (error) throw error
      setMessages((prev) => [...prev, data])
    } catch (error) {
      console.error("Error sending quick message:", error)
    } finally {
      setIsSending(false)
    }
  }

  useEffect(() => {
    loadMessages()
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          if (newMessage.sender_id !== currentUserId) {
            setMessages((prev) => [...prev, newMessage])

            // Mark as read immediately
            supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", newMessage.id).then()
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [conversationId, currentUserId])

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Listing Context */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center space-x-3">
          <Image
            src={listing.images[0] || "/placeholder.svg"}
            alt={listing.title}
            width={60}
            height={45}
            className="rounded object-cover"
          />
          <div className="flex-1">
            <h4 className="font-medium text-gray-900">{listing.title}</h4>
            <p className="text-lg font-bold text-blue-600">${listing.price.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Start the conversation! Send a message below.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === currentUserId ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender_id === currentUserId ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div
                    className={`flex items-center justify-end mt-1 ${
                      message.sender_id === currentUserId ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    <span className="text-xs">{formatTime(message.created_at)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex flex-wrap gap-2 mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendQuickMessage("Is this still available?")}
            disabled={isSending}
          >
            Is this available?
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendQuickMessage("Can we schedule a test drive?")}
            disabled={isSending}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Schedule Test Drive
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendQuickMessage("What's your best price?")}
            disabled={isSending}
          >
            Best Price?
          </Button>
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <form onSubmit={sendMessage} className="flex space-x-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 min-h-[40px] max-h-32 resize-none"
            rows={1}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                sendMessage(e)
              }
            }}
          />
          <Button type="submit" disabled={!newMessage.trim() || isSending} className="self-end">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
