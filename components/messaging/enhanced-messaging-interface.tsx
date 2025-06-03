"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import {
  Send,
  Calendar,
  ImageIcon,
  MoreVertical,
  Flag,
  Archive,
  Pin,
  DollarSign,
  MapPin,
  X,
  MessageSquare,
  Check,
} from "lucide-react"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AddToCalendar } from "@/components/calendar/add-to-calendar"
import { useAuth } from "@/lib/auth-context"

interface Message {
  id: string
  content: string
  sender_id: string
  message_type: string
  photo_url?: string
  photo_caption?: string
  created_at: string
  read_at?: string
}

interface MessageTemplate {
  id: string
  title: string
  content: string
  category: string
}

interface Offer {
  id: string
  sender_id: string
  amount: number
  offer_type: string
  trade_vehicle_details?: string
  message?: string
  status: string
  expires_at?: string
  created_at: string
}

interface Appointment {
  id: string
  scheduled_by: string
  scheduled_with: string
  appointment_type: string
  appointment_date: string
  location?: string
  notes?: string
  status: string
  response_status: string
  response_message?: string
  responded_at?: string
  responded_by?: string
}

interface AppointmentResponse {
  id: string
  appointment_id: string
  responder_id: string
  response_type: string
  suggested_date?: string
  suggested_location?: string
  message?: string
  created_at: string
}

interface EnhancedMessagingInterfaceProps {
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
  onArchive?: () => void
  onPin?: () => void
  onBlock?: () => void
}

export function EnhancedMessagingInterface({
  conversationId,
  currentUserId,
  otherUser,
  listing,
  onArchive,
  onPin,
  onBlock,
}: EnhancedMessagingInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [showTemplates, setShowTemplates] = useState(false)
  const [offers, setOffers] = useState<Offer[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [appointmentResponses, setAppointmentResponses] = useState<AppointmentResponse[]>([])
  const [showOfferDialog, setShowOfferDialog] = useState(false)
  const [showAppointmentDialog, setShowAppointmentDialog] = useState(false)
  const [showAppointmentResponseDialog, setShowAppointmentResponseDialog] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Offer form state
  const [offerAmount, setOfferAmount] = useState("")
  const [offerType, setOfferType] = useState("cash")
  const [offerMessage, setOfferMessage] = useState("")
  const [tradeDetails, setTradeDetails] = useState("")

  // Appointment form state
  const [appointmentDate, setAppointmentDate] = useState("")
  const [appointmentTime, setAppointmentTime] = useState("")
  const [appointmentLocation, setAppointmentLocation] = useState("")
  const [appointmentNotes, setAppointmentNotes] = useState("")

  // Appointment response form state
  const [responseType, setResponseType] = useState("")
  const [responseMessage, setResponseMessage] = useState("")
  const [suggestedDate, setSuggestedDate] = useState("")
  const [suggestedTime, setSuggestedTime] = useState("")
  const [suggestedLocation, setSuggestedLocation] = useState("")

  // Report form state
  const [reportReason, setReportReason] = useState("")
  const [reportDescription, setReportDescription] = useState("")

  const { user } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load message templates
  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("message_templates")
        .select("*")
        .or(`user_id.eq.${currentUserId},is_default.eq.true`)
        .order("is_default", { ascending: false })

      if (error) throw error
      setTemplates(data || [])
    } catch (error) {
      console.error("Error loading templates:", error)
    }
  }

  // Load messages, offers, appointments, and responses
  const loadConversationData = async () => {
    try {
      setIsLoading(true)

      // Load messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      if (messagesError) throw messagesError
      setMessages(messagesData || [])

      // Load offers
      const { data: offersData, error: offersError } = await supabase
        .from("offers")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })

      if (offersError) throw offersError
      setOffers(offersData || [])

      // Load appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("appointment_date", { ascending: true })

      if (appointmentsError) throw appointmentsError
      setAppointments(appointmentsData || [])

      // Load appointment responses
      const { data: responsesData, error: responsesError } = await supabase
        .from("appointment_responses")
        .select("*, appointments!inner(conversation_id)")
        .eq("appointments.conversation_id", conversationId)
        .order("created_at", { ascending: false })

      if (responsesError) throw responsesError
      setAppointmentResponses(responsesData || [])

      // Mark messages as read
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .neq("sender_id", currentUserId)
        .is("read_at", null)
    } catch (error) {
      console.error("Error loading conversation data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Send text message
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

      // Create notification for the other user
      await supabase.from("notifications").insert({
        user_id: otherUser.id,
        type: "new_message",
        title: `New message from ${user?.user_metadata?.first_name || "Someone"}`,
        message: `You have a new message about ${listing.title}`,
        data: {
          conversation_id: conversationId,
          listing_id: listing.id,
          message_preview: newMessage.trim().substring(0, 100) + (newMessage.trim().length > 100 ? "..." : ""),
        },
        read: false,
      })

      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  // Send photo message
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingPhoto(true)
    try {
      // Upload to Supabase storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `message-photos/${conversationId}/${fileName}`

      const { error: uploadError } = await supabase.storage.from("message-photos").upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("message-photos").getPublicUrl(filePath)

      // Send message with photo
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: "📷 Photo",
          message_type: "photo",
          photo_url: publicUrl,
        })
        .select("*")
        .single()

      if (error) throw error

      setMessages((prev) => [...prev, data])
    } catch (error) {
      console.error("Error uploading photo:", error)
      alert("Failed to upload photo. Please try again.")
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Send template message
  const sendTemplate = async (template: MessageTemplate) => {
    if (isSending) return

    setIsSending(true)
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          content: template.content,
          message_type: "text",
        })
        .select("*")
        .single()

      if (error) throw error

      setMessages((prev) => [...prev, data])
      setShowTemplates(false)
    } catch (error) {
      console.error("Error sending template:", error)
    } finally {
      setIsSending(false)
    }
  }

  // Make offer
  const makeOffer = async () => {
    if (!offerAmount || isSending) return

    setIsSending(true)
    try {
      const { data, error } = await supabase
        .from("offers")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUserId,
          listing_id: Number.parseInt(listing.id),
          amount: Number.parseFloat(offerAmount),
          offer_type: offerType,
          trade_vehicle_details: offerType === "trade" ? tradeDetails : null,
          message: offerMessage,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        })
        .select("*")
        .single()

      if (error) throw error

      setOffers((prev) => [data, ...prev])

      // Send notification message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: `💰 Made an offer: $${offerAmount} (${offerType})`,
        message_type: "system",
      })

      setShowOfferDialog(false)
      setOfferAmount("")
      setOfferMessage("")
      setTradeDetails("")
    } catch (error) {
      console.error("Error making offer:", error)
    } finally {
      setIsSending(false)
    }
  }

  // Schedule appointment with notification
  const scheduleAppointment = async () => {
    if (!appointmentDate || !appointmentTime || isSending) return

    setIsSending(true)
    try {
      const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`)

      const { data, error } = await supabase
        .from("appointments")
        .insert({
          conversation_id: conversationId,
          listing_id: Number.parseInt(listing.id),
          scheduled_by: currentUserId,
          scheduled_with: otherUser.id,
          appointment_date: appointmentDateTime.toISOString(),
          location: appointmentLocation,
          notes: appointmentNotes,
          status: "scheduled",
          response_status: "pending",
        })
        .select("*")
        .single()

      if (error) throw error

      setAppointments((prev) => [...prev, data])

      // Send notification message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: `📅 Scheduled appointment for ${appointmentDateTime.toLocaleDateString()} at ${appointmentDateTime.toLocaleTimeString()}`,
        message_type: "system",
      })

      // Create notification for the other user
      await supabase.from("notifications").insert({
        user_id: otherUser.id,
        type: "new_appointment",
        title: `New Appointment Request`,
        message: `${user?.user_metadata?.first_name || "Someone"} has scheduled an appointment for ${appointmentDateTime.toLocaleDateString()} at ${appointmentDateTime.toLocaleTimeString()}`,
        data: {
          appointment_id: data.id,
          conversation_id: conversationId,
          listing_id: listing.id,
          appointment_date: appointmentDateTime.toISOString(),
          location: appointmentLocation,
          status: "scheduled",
        },
        read: false,
      })

      setShowAppointmentDialog(false)
      setAppointmentDate("")
      setAppointmentTime("")
      setAppointmentLocation("")
      setAppointmentNotes("")
    } catch (error) {
      console.error("Error scheduling appointment:", error)
    } finally {
      setIsSending(false)
    }
  }

  // Respond to appointment with notification
  const respondToAppointment = async () => {
    if (!selectedAppointment || !responseType || isSending) return

    setIsSending(true)
    try {
      // Create appointment response
      const responseData: any = {
        appointment_id: selectedAppointment.id,
        responder_id: currentUserId,
        response_type: responseType,
        message: responseMessage,
      }

      if (responseType === "suggest_alternative") {
        if (!suggestedDate || !suggestedTime) {
          alert("Please provide a suggested date and time.")
          setIsSending(false)
          return
        }
        const suggestedDateTime = new Date(`${suggestedDate}T${suggestedTime}`)
        responseData.suggested_date = suggestedDateTime.toISOString()
        responseData.suggested_location = suggestedLocation
      }

      const { data: responseResult, error: responseError } = await supabase
        .from("appointment_responses")
        .insert(responseData)
        .select("*")
        .single()

      if (responseError) throw responseError

      // Update appointment status
      const newResponseStatus =
        responseType === "accept" ? "accepted" : responseType === "decline" ? "declined" : "alt_suggested"
      const newStatus =
        responseType === "accept" ? "confirmed" : responseType === "decline" ? "declined" : "rescheduled"

      const { error: updateError } = await supabase
        .from("appointments")
        .update({
          response_status: newResponseStatus,
          status: newStatus,
          response_message: responseMessage,
          responded_at: new Date().toISOString(),
          responded_by: currentUserId,
        })
        .eq("id", selectedAppointment.id)

      if (updateError) throw updateError

      // Update local state
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id
            ? {
                ...apt,
                response_status: newResponseStatus,
                status: newStatus,
                response_message: responseMessage,
                responded_at: new Date().toISOString(),
                responded_by: currentUserId,
              }
            : apt,
        ),
      )

      setAppointmentResponses((prev) => [responseResult, ...prev])

      // Send notification message
      let notificationContent = ""
      if (responseType === "accept") {
        notificationContent = "✅ Appointment confirmed"
      } else if (responseType === "decline") {
        notificationContent = "❌ Appointment declined"
      } else {
        const suggestedDateTime = new Date(`${suggestedDate}T${suggestedTime}`)
        notificationContent = `🔄 Suggested new time: ${suggestedDateTime.toLocaleDateString()} at ${suggestedDateTime.toLocaleTimeString()}`
      }

      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: notificationContent,
        message_type: "system",
      })

      // Create notification for the other user
      const otherUserId =
        selectedAppointment.scheduled_by === currentUserId
          ? selectedAppointment.scheduled_with
          : selectedAppointment.scheduled_by

      await supabase.from("notifications").insert({
        user_id: otherUserId,
        type: "appointment_response",
        title:
          responseType === "accept"
            ? "Appointment Confirmed"
            : responseType === "decline"
              ? "Appointment Declined"
              : "Alternative Time Suggested",
        message:
          responseType === "accept"
            ? `Your appointment has been confirmed for ${new Date(selectedAppointment.appointment_date).toLocaleDateString()}`
            : responseType === "decline"
              ? `Your appointment request has been declined`
              : `An alternative time has been suggested for your appointment`,
        data: {
          appointment_id: selectedAppointment.id,
          conversation_id: conversationId,
          listing_id: listing.id,
          appointment_date: selectedAppointment.appointment_date,
          status: newStatus,
          response_status: newResponseStatus,
          response_message: responseMessage,
          suggested_date: responseType === "suggest_alternative" ? `${suggestedDate}T${suggestedTime}` : null,
          suggested_location: suggestedLocation || null,
        },
        read: false,
      })

      setShowAppointmentResponseDialog(false)
      setSelectedAppointment(null)
      setResponseType("")
      setResponseMessage("")
      setSuggestedDate("")
      setSuggestedTime("")
      setSuggestedLocation("")
    } catch (error) {
      console.error("Error responding to appointment:", error)
      alert("Failed to respond to appointment. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  // Accept alternative appointment suggestion with notification
  const acceptAlternativeAppointment = async (response: AppointmentResponse) => {
    if (!response.suggested_date || isSending) return

    setIsSending(true)
    try {
      // Update the original appointment with new details
      const { error: updateError } = await supabase
        .from("appointments")
        .update({
          appointment_date: response.suggested_date,
          location: response.suggested_location || null,
          status: "confirmed",
          response_status: "accepted",
          responded_at: new Date().toISOString(),
          responded_by: currentUserId,
        })
        .eq("id", response.appointment_id)

      if (updateError) throw updateError

      // Update local state
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === response.appointment_id
            ? {
                ...apt,
                appointment_date: response.suggested_date!,
                location: response.suggested_location || apt.location,
                status: "confirmed",
                response_status: "accepted",
                responded_at: new Date().toISOString(),
                responded_by: currentUserId,
              }
            : apt,
        ),
      )

      // Send notification message
      const newDateTime = new Date(response.suggested_date)
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: `✅ Accepted new appointment time: ${newDateTime.toLocaleDateString()} at ${newDateTime.toLocaleTimeString()}`,
        message_type: "system",
      })

      // Get the appointment to find the other user
      const { data: appointmentData } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", response.appointment_id)
        .single()

      if (appointmentData) {
        // Create notification for the other user
        const otherUserId =
          appointmentData.scheduled_by === currentUserId ? appointmentData.scheduled_with : appointmentData.scheduled_by

        await supabase.from("notifications").insert({
          user_id: otherUserId,
          type: "appointment_response",
          title: "Alternative Time Accepted",
          message: `Your suggested appointment time has been accepted for ${newDateTime.toLocaleDateString()} at ${newDateTime.toLocaleTimeString()}`,
          data: {
            appointment_id: response.appointment_id,
            conversation_id: conversationId,
            listing_id: listing.id,
            appointment_date: response.suggested_date,
            status: "confirmed",
            response_status: "accepted",
            location: response.suggested_location || null,
          },
          read: false,
        })
      }
    } catch (error) {
      console.error("Error accepting alternative appointment:", error)
    } finally {
      setIsSending(false)
    }
  }

  // Report user
  const reportUser = async () => {
    if (!reportReason || isSending) return

    setIsSending(true)
    try {
      const { error } = await supabase.from("user_reports").insert({
        reporter_id: currentUserId,
        reported_id: otherUser.id,
        conversation_id: conversationId,
        reason: reportReason,
        description: reportDescription,
      })

      if (error) throw error

      setShowReportDialog(false)
      setReportReason("")
      setReportDescription("")
      alert("Report submitted successfully. We'll review it shortly.")
    } catch (error) {
      console.error("Error reporting user:", error)
    } finally {
      setIsSending(false)
    }
  }

  // Block user
  const blockUser = async () => {
    try {
      const { error } = await supabase.from("user_blocks").insert({
        blocker_id: currentUserId,
        blocked_id: otherUser.id,
        reason: "Blocked from conversation",
      })

      if (error) throw error

      onBlock?.()
      alert("User has been blocked successfully.")
    } catch (error) {
      console.error("Error blocking user:", error)
    }
  }

  // Respond to offer
  const respondToOffer = async (offerId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("offers")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", offerId)

      if (error) throw error

      setOffers((prev) => prev.map((offer) => (offer.id === offerId ? { ...offer, status } : offer)))

      // Send notification message
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: currentUserId,
        content: `💰 Offer ${status}`,
        message_type: "system",
      })
    } catch (error) {
      console.error("Error responding to offer:", error)
    }
  }

  // Open appointment response dialog
  const openAppointmentResponseDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowAppointmentResponseDialog(true)
  }

  useEffect(() => {
    loadConversationData()
    loadTemplates()
  }, [conversationId])

  // Set up real-time subscriptions
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
            supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", newMessage.id).then()
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "offers",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newOffer = payload.new as Offer
          if (newOffer.sender_id !== currentUserId) {
            setOffers((prev) => [newOffer, ...prev])
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "appointments",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newAppointment = payload.new as Appointment
          if (newAppointment.scheduled_by !== currentUserId) {
            setAppointments((prev) => [...prev, newAppointment])
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "appointments",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updatedAppointment = payload.new as Appointment
          setAppointments((prev) => prev.map((apt) => (apt.id === updatedAppointment.id ? updatedAppointment : apt)))
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

  const getAppointmentStatusBadge = (appointment: Appointment) => {
    const { status, response_status } = appointment

    if (response_status === "accepted" || status === "confirmed") {
      return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
    } else if (response_status === "declined" || status === "declined") {
      return <Badge className="bg-red-100 text-red-800">Declined</Badge>
    } else if (response_status === "alt_suggested") {
      return <Badge className="bg-yellow-100 text-yellow-800">Alternative Suggested</Badge>
    } else if (response_status === "pending") {
      return <Badge className="bg-blue-100 text-blue-800">Pending Response</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Render the appointments section with calendar integration
  const renderAppointment = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.appointment_date)
    const endTime = new Date(appointmentDate.getTime() + 60 * 60 * 1000) // Default 1 hour duration

    const title = `GarageList: ${listing.title} - Appointment`
    const description = `Appointment for ${listing.title}\n\n${appointment.notes || ""}`
    const location = appointment.location || ""

    return (
      <Card key={appointment.id} className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <Calendar className="h-4 w-4 text-blue-600" />
              <p className="font-medium">
                {appointmentDate.toLocaleDateString()} at{" "}
                {appointmentDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {getAppointmentStatusBadge(appointment)}
            </div>
            {appointment.location && (
              <p className="text-sm text-gray-600 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {appointment.location}
              </p>
            )}
            {appointment.notes && <p className="text-sm text-gray-600 mt-1">{appointment.notes}</p>}
            {appointment.response_message && (
              <p className="text-sm text-gray-600 mt-1 italic">"{appointment.response_message}"</p>
            )}

            {/* Calendar integration */}
            {(appointment.status === "confirmed" || appointment.response_status === "accepted") && (
              <div className="mt-2">
                <AddToCalendar
                  title={title}
                  description={description}
                  location={location}
                  startTime={appointmentDate}
                  endTime={endTime}
                  className="text-xs h-7"
                />
              </div>
            )}
          </div>

          {/* Action buttons for pending appointments */}
          {appointment.scheduled_with === currentUserId && appointment.response_status === "pending" && (
            <div className="flex space-x-2 ml-2">
              <Button size="sm" onClick={() => openAppointmentResponseDialog(appointment)}>
                <Check className="h-4 w-4 mr-1" />
                Respond
              </Button>
            </div>
          )}
        </div>

        {/* Alternative suggestions */}
        {appointmentResponses
          .filter(
            (response) =>
              response.appointment_id === appointment.id && response.response_type === "suggest_alternative",
          )
          .map((response) => (
            <div key={response.id} className="mt-3 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800">Alternative Time Suggested:</p>
                  {response.suggested_date && (
                    <p className="text-sm text-yellow-700">
                      {new Date(response.suggested_date).toLocaleDateString()} at{" "}
                      {new Date(response.suggested_date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                  {response.suggested_location && (
                    <p className="text-sm text-yellow-700">Location: {response.suggested_location}</p>
                  )}
                  {response.message && <p className="text-sm text-yellow-700 italic">"{response.message}"</p>}
                </div>
                {response.responder_id !== currentUserId && appointment.response_status === "alt_suggested" && (
                  <Button size="sm" onClick={() => acceptAlternativeAppointment(response)}>
                    Accept
                  </Button>
                )}
              </div>
            </div>
          ))}
      </Card>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with actions */}
      <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={otherUser.avatar || "/placeholder.svg"} />
            <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium text-gray-900">{otherUser.name}</h4>
            <p className="text-sm text-gray-500">Online</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowOfferDialog(true)}>
            <DollarSign className="h-4 w-4 mr-1" />
            Make Offer
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowAppointmentDialog(true)}>
            <Calendar className="h-4 w-4 mr-1" />
            Schedule
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onPin}>
                <Pin className="h-4 w-4 mr-2" />
                Pin Conversation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                <Flag className="h-4 w-4 mr-2" />
                Report User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={blockUser} className="text-red-600">
                <X className="h-4 w-4 mr-2" />
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Listing Context */}
      <div className="p-4 bg-white border-b">
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

      {/* Active Offers */}
      {offers.filter((offer) => offer.status === "pending").length > 0 && (
        <div className="p-4 bg-yellow-50 border-b">
          <h5 className="font-medium text-gray-900 mb-2">Active Offers</h5>
          <div className="space-y-2">
            {offers
              .filter((offer) => offer.status === "pending")
              .map((offer) => (
                <Card key={offer.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        ${offer.amount.toLocaleString()} ({offer.offer_type})
                      </p>
                      {offer.message && <p className="text-sm text-gray-600">{offer.message}</p>}
                      <p className="text-xs text-gray-500">
                        Expires: {offer.expires_at ? new Date(offer.expires_at).toLocaleDateString() : "No expiration"}
                      </p>
                    </div>
                    {offer.sender_id !== currentUserId && (
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => respondToOffer(offer.id, "accepted")}>
                          Accept
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => respondToOffer(offer.id, "declined")}>
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Appointments Section */}
      {appointments.length > 0 && (
        <div className="p-4 bg-blue-50 border-b">
          <h5 className="font-medium text-gray-900 mb-2">Appointments</h5>
          <div className="space-y-2">{appointments.map(renderAppointment)}</div>
        </div>
      )}

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
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg break-words ${
                    message.sender_id === currentUserId ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {message.message_type === "photo" && message.photo_url ? (
                    <div className="space-y-2">
                      <Image
                        src={message.photo_url || "/placeholder.svg"}
                        alt="Shared photo"
                        width={200}
                        height={150}
                        className="rounded object-cover"
                      />
                      {message.photo_caption && <p className="text-sm break-words">{message.photo_caption}</p>}
                    </div>
                  ) : (
                    <p className="text-sm break-words whitespace-pre-wrap">{message.content}</p>
                  )}
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

      {/* Message Templates */}
      {showTemplates && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-medium text-gray-900">Quick Messages</h5>
            <Button variant="ghost" size="sm" onClick={() => setShowTemplates(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {templates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                size="sm"
                className="text-left justify-start h-auto p-3 whitespace-normal"
                onClick={() => sendTemplate(template)}
                disabled={isSending}
              >
                <div className="w-full overflow-hidden">
                  <p className="font-medium text-xs mb-1 truncate">{template.title}</p>
                  <p className="text-xs text-gray-600 line-clamp-2 break-words">{template.content}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2 mb-2">
          <Button variant="outline" size="sm" onClick={() => setShowTemplates(!showTemplates)}>
            <MessageSquare className="h-4 w-4 mr-1" />
            Templates
          </Button>

          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadingPhoto}>
            <ImageIcon className="h-4 w-4 mr-1" />
            {uploadingPhoto ? "Uploading..." : "Photo"}
          </Button>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </div>

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

      {/* Make Offer Dialog */}
      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
            <DialogDescription>Submit your offer for {listing.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="offer-amount">Offer Amount</Label>
              <Input
                id="offer-amount"
                type="number"
                placeholder="Enter amount"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="offer-type">Offer Type</Label>
              <Select value={offerType} onValueChange={setOfferType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="financing">Financing</SelectItem>
                  <SelectItem value="trade">Trade</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {offerType === "trade" && (
              <div>
                <Label htmlFor="trade-details">Trade Vehicle Details</Label>
                <Textarea
                  id="trade-details"
                  placeholder="Describe your trade vehicle..."
                  value={tradeDetails}
                  onChange={(e) => setTradeDetails(e.target.value)}
                />
              </div>
            )}
            <div>
              <Label htmlFor="offer-message">Message (Optional)</Label>
              <Textarea
                id="offer-message"
                placeholder="Add a message with your offer..."
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOfferDialog(false)}>
              Cancel
            </Button>
            <Button onClick={makeOffer} disabled={!offerAmount || isSending}>
              Submit Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Appointment Dialog */}
      <Dialog open={showAppointmentDialog} onOpenChange={setShowAppointmentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Appointment</DialogTitle>
            <DialogDescription>Schedule a test drive or meeting for {listing.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="appointment-date">Date</Label>
              <Input
                id="appointment-date"
                type="date"
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <Label htmlFor="appointment-time">Time</Label>
              <Input
                id="appointment-time"
                type="time"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="appointment-location">Location (Optional)</Label>
              <Input
                id="appointment-location"
                placeholder="Meeting location"
                value={appointmentLocation}
                onChange={(e) => setAppointmentLocation(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="appointment-notes">Notes (Optional)</Label>
              <Textarea
                id="appointment-notes"
                placeholder="Any special notes or requirements..."
                value={appointmentNotes}
                onChange={(e) => setAppointmentNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAppointmentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={scheduleAppointment} disabled={!appointmentDate || !appointmentTime || isSending}>
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Appointment Response Dialog */}
      <Dialog open={showAppointmentResponseDialog} onOpenChange={setShowAppointmentResponseDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Respond to Appointment</DialogTitle>
            <DialogDescription>
              {selectedAppointment && (
                <>
                  Appointment for {new Date(selectedAppointment.appointment_date).toLocaleDateString()} at{" "}
                  {new Date(selectedAppointment.appointment_date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="response-type">Response</Label>
              <Select value={responseType} onValueChange={setResponseType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your response" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accept">Accept Appointment</SelectItem>
                  <SelectItem value="decline">Decline Appointment</SelectItem>
                  <SelectItem value="suggest_alternative">Suggest Alternative Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {responseType === "suggest_alternative" && (
              <>
                <div>
                  <Label htmlFor="suggested-date">Suggested Date</Label>
                  <Input
                    id="suggested-date"
                    type="date"
                    value={suggestedDate}
                    onChange={(e) => setSuggestedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="suggested-time">Suggested Time</Label>
                  <Input
                    id="suggested-time"
                    type="time"
                    value={suggestedTime}
                    onChange={(e) => setSuggestedTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="suggested-location">Suggested Location (Optional)</Label>
                  <Input
                    id="suggested-location"
                    placeholder="Alternative meeting location"
                    value={suggestedLocation}
                    onChange={(e) => setSuggestedLocation(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="response-message">Message (Optional)</Label>
              <Textarea
                id="response-message"
                placeholder="Add a message with your response..."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAppointmentResponseDialog(false)}>
              Cancel
            </Button>
            <Button onClick={respondToAppointment} disabled={!responseType || isSending}>
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report User Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report User</DialogTitle>
            <DialogDescription>Help us keep the community safe by reporting inappropriate behavior.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="report-reason">Reason</Label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="harassment">Harassment</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                  <SelectItem value="scam">Suspected Scam</SelectItem>
                  <SelectItem value="fake">Fake Listing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="report-description">Description</Label>
              <Textarea
                id="report-description"
                placeholder="Please provide more details..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={reportUser} disabled={!reportReason || isSending}>
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
