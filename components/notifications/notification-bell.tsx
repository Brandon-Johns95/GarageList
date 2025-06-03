/**
 * Enhanced Notification Bell Component
 *
 * PURPOSE: Display and manage user notifications including trade opportunities, appointments, and messages
 * FLOW:
 *   1. LOAD notifications from database
 *   2. SETUP real-time subscription for new notifications
 *   3. DISPLAY notification count and dropdown
 *   4. HANDLE notification actions (mark as read, reply, view trade opportunities, open messages)
 */

"use client"

import { useState, useEffect } from "react"
import { Bell, MessageSquare, X, CheckCircle, TrendingUp, ArrowRightLeft, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Define notification interface
interface Notification {
  id: number
  type: string
  title: string
  message: string
  data: any
  read: boolean
  created_at: string
}

export function NotificationBell() {
  // Initialize component state
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length

  /**
   * Setup Notifications
   * FLOW:
   *   1. IF user is authenticated: LOAD notifications
   *   2. SETUP real-time subscription for new notifications
   *   3. CLEANUP subscription on unmount
   */
  useEffect(() => {
    if (user) {
      loadNotifications()

      const subscription = supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            setNotifications((prev) => [payload.new as Notification, ...prev])
          },
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  /**
   * Load Notifications
   * FLOW:
   *   1. QUERY notifications for current user
   *   2. ORDER by creation date (newest first)
   *   3. LIMIT to 20 most recent
   *   4. UPDATE component state
   */
  const loadNotifications = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error
      setNotifications(data || [])
    } catch (error) {
      console.error("Error loading notifications:", error)
    }
  }

  /**
   * Mark Notification as Read
   * FLOW:
   *   1. UPDATE notification in database
   *   2. UPDATE local state
   */
  const markAsRead = async (notificationId: number) => {
    try {
      await supabase.from("notifications").update({ read: true }).eq("id", notificationId)
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  /**
   * Mark All as Read
   * FLOW:
   *   1. UPDATE all unread notifications for user
   *   2. UPDATE local state
   */
  const markAllAsRead = async () => {
    if (!user) return

    try {
      await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  /**
   * Handle Reply to Question
   * FLOW:
   *   1. VALIDATE reply text exists
   *   2. UPDATE question with answer in database
   *   3. CLEAR reply form
   *   4. SHOW success message
   */
  const handleReply = async (questionId: number) => {
    if (!replyText.trim()) return

    setIsSubmittingReply(true)
    try {
      const { error } = await supabase
        .from("listing_questions")
        .update({
          answer: replyText.trim(),
          answered_at: new Date().toISOString(),
        })
        .eq("id", questionId)

      if (error) throw error

      setReplyText("")
      setReplyingTo(null)
      alert("Reply sent successfully!")
    } catch (error) {
      console.error("Error sending reply:", error)
      alert("Failed to send reply. Please try again.")
    } finally {
      setIsSubmittingReply(false)
    }
  }

  /**
   * Open Message Conversation
   * FLOW:
   *   1. MARK notification as read
   *   2. NAVIGATE to conversation
   *   3. CLOSE notification dropdown
   */
  const openConversation = async (notificationId: number, conversationId: string) => {
    await markAsRead(notificationId)
    setShowDropdown(false)
    router.push(`/messages?conversation=${conversationId}`)
  }

  /**
   * Get notification icon based on type
   * RETURNS: Appropriate icon component for notification type
   */
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_question":
        return <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
      case "question_answered":
        return <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
      case "trade_opportunity":
        return <ArrowRightLeft className="h-5 w-5 text-purple-600 mt-0.5" />
      case "new_appointment":
        return <Calendar className="h-5 w-5 text-indigo-600 mt-0.5" />
      case "appointment_response":
        return <CheckCircle className="h-5 w-5 text-indigo-600 mt-0.5" />
      case "appointment_reminder":
        return <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
      case "new_message":
        return <MessageSquare className="h-5 w-5 text-green-600 mt-0.5" />
      default:
        return <Bell className="h-5 w-5 text-gray-600 mt-0.5" />
    }
  }

  // Don't render if user not authenticated
  if (!user) return null

  return (
    <div className="relative">
      {/* Notification bell button */}
      <Button variant="ghost" size="sm" onClick={() => setShowDropdown(!showDropdown)} className="relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification dropdown */}
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-96 z-50">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowDropdown(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  /**
                   * Empty State
                   * SHOW: Bell icon and "No notifications" message
                   */
                  <div className="p-4 text-center text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  /**
                   * Notification List
                   * FOR each notification:
                   *   1. DISPLAY notification content
                   *   2. SHOW appropriate icon based on type
                   *   3. HANDLE click to mark as read
                   *   4. SHOW action buttons if applicable
                   */
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b hover:bg-gray-50 ${!notification.read ? "bg-blue-50" : ""}`}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                            {!notification.read && <div className="h-2 w-2 bg-blue-600 rounded-full"></div>}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </p>

                          {/* Question notification actions */}
                          {notification.type === "new_question" && (
                            <div className="mt-3 space-y-2">
                              <div className="flex space-x-2">
                                <Link href={`/listing/${notification.data?.listing_id}`} className="flex-1">
                                  <Button variant="outline" size="sm" className="w-full">
                                    View Question
                                  </Button>
                                </Link>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setReplyingTo(notification.data?.question_id)
                                  }}
                                >
                                  Reply
                                </Button>
                              </div>

                              {/* Reply form */}
                              {replyingTo === notification.data?.question_id && (
                                <div className="space-y-2">
                                  <Textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Type your reply..."
                                    rows={3}
                                    maxLength={500}
                                  />
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-500">{replyText.length}/500 characters</span>
                                    <div className="flex space-x-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setReplyingTo(null)
                                          setReplyText("")
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={() => handleReply(notification.data?.question_id)}
                                        disabled={!replyText.trim() || isSubmittingReply}
                                      >
                                        {isSubmittingReply ? "Sending..." : "Send Reply"}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Answer notification display */}
                          {notification.type === "question_answered" && (
                            <div className="mt-3">
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                                <p className="text-sm text-green-800 font-medium">Reply:</p>
                                <p className="text-sm text-green-700 mt-1">{notification.data?.answer}</p>
                              </div>
                              <Link href={`/listing/${notification.data?.listing_id}`}>
                                <Button variant="outline" size="sm" className="w-full">
                                  View Full Conversation
                                </Button>
                              </Link>
                            </div>
                          )}

                          {/* Trade opportunity notification actions */}
                          {notification.type === "trade_opportunity" && (
                            <div className="mt-3 space-y-2">
                              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-2">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm text-purple-800 font-medium">Trade Match</p>
                                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                    {notification.data?.compatibility_score}% Match
                                  </Badge>
                                </div>
                                <p className="text-sm text-purple-700">
                                  {notification.data?.new_listing_title || notification.data?.trader_listing_title}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <Link
                                  href={`/listing/${notification.data?.new_listing_id || notification.data?.trader_listing_id}`}
                                  className="flex-1"
                                >
                                  <Button variant="outline" size="sm" className="w-full">
                                    View Listing
                                  </Button>
                                </Link>
                                <Link
                                  href={`/trade-matches/${notification.data?.trader_listing_id || notification.data?.new_listing_id}`}
                                >
                                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                    Explore Trade
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          )}

                          {/* NEW - Appointment notification actions */}
                          {(notification.type === "new_appointment" ||
                            notification.type === "appointment_response" ||
                            notification.type === "appointment_reminder") && (
                            <div className="mt-3 space-y-2">
                              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-2">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm text-indigo-800 font-medium">
                                    {notification.type === "new_appointment" && "New Appointment"}
                                    {notification.type === "appointment_response" &&
                                      notification.data?.status === "confirmed" &&
                                      "Appointment Confirmed"}
                                    {notification.type === "appointment_response" &&
                                      notification.data?.status === "declined" &&
                                      "Appointment Declined"}
                                    {notification.type === "appointment_response" &&
                                      notification.data?.status === "rescheduled" &&
                                      "Appointment Rescheduled"}
                                    {notification.type === "appointment_reminder" && "Appointment Reminder"}
                                  </p>
                                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                                    {notification.data?.status === "confirmed" && "Confirmed"}
                                    {notification.data?.status === "declined" && "Declined"}
                                    {notification.data?.status === "rescheduled" && "Rescheduled"}
                                    {notification.data?.status === "scheduled" && "Pending"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-indigo-700">
                                  {notification.data?.appointment_date &&
                                    new Date(notification.data.appointment_date).toLocaleString()}
                                </p>
                                {notification.data?.location && (
                                  <p className="text-sm text-indigo-700">Location: {notification.data.location}</p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                  onClick={() => openConversation(notification.id, notification.data?.conversation_id)}
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Open Conversation
                                </Button>
                                <Link href={`/listing/${notification.data?.listing_id}`}>
                                  <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                                    View Listing
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          )}

                          {/* NEW - Message notification actions */}
                          {notification.type === "new_message" && (
                            <div className="mt-3 space-y-2">
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                                <p className="text-sm text-green-800 font-medium">New Message:</p>
                                <p className="text-sm text-green-700 mt-1 line-clamp-2">
                                  {notification.data?.message_preview}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => openConversation(notification.id, notification.data?.conversation_id)}
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Open Conversation
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
