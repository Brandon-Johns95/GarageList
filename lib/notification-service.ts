import { supabase } from "./supabase"

// Send a notification to a user (in-app only)
export async function sendNotification({
  userId,
  type,
  title,
  message,
  data = {},
}: {
  userId: string
  type: string
  title: string
  message: string
  data?: Record<string, any>
}) {
  try {
    // Create in-app notification only
    const { data: notificationData, error } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data,
        read: false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating notification:", error)
      return { success: false, error }
    }

    return { success: true, notification: notificationData }
  } catch (error) {
    console.error("Error in sendNotification:", error)
    return { success: false, error }
  }
}

// Create a notification for a new message
export async function notifyNewMessage(recipientId: string, senderId: string, message: string, conversationId: string) {
  const { data: senderData } = await supabase
    .from("user_profiles")
    .select("first_name, last_name")
    .eq("id", senderId)
    .single()

  const senderName = senderData ? `${senderData.first_name} ${senderData.last_name}` : "Someone"

  return sendNotification({
    userId: recipientId,
    type: "new_message",
    title: `New message from ${senderName}`,
    message: message.length > 100 ? `${message.substring(0, 100)}...` : message,
    data: {
      conversation_id: conversationId,
      sender_id: senderId,
      message_preview: message.length > 100 ? `${message.substring(0, 100)}...` : message,
    },
  })
}

// Create a notification for a new appointment
export async function notifyNewAppointment(recipientId: string, senderId: string, appointmentData: any) {
  const { data: senderData } = await supabase
    .from("user_profiles")
    .select("first_name, last_name")
    .eq("id", senderId)
    .single()

  const senderName = senderData ? `${senderData.first_name} ${senderData.last_name}` : "Someone"

  const appointmentDate = new Date(appointmentData.appointment_date).toLocaleString()

  return sendNotification({
    userId: recipientId,
    type: "new_appointment",
    title: `New appointment request from ${senderName}`,
    message: `${senderName} wants to meet on ${appointmentDate}${appointmentData.location ? ` at ${appointmentData.location}` : ""}`,
    data: {
      appointment_id: appointmentData.id,
      conversation_id: appointmentData.conversation_id,
      listing_id: appointmentData.listing_id,
      appointment_date: appointmentData.appointment_date,
      location: appointmentData.location,
      status: appointmentData.status,
    },
  })
}

// Create a notification for an appointment response
export async function notifyAppointmentResponse(
  recipientId: string,
  responderId: string,
  appointmentData: any,
  responseType: string,
) {
  const { data: responderData } = await supabase
    .from("user_profiles")
    .select("first_name, last_name")
    .eq("id", responderId)
    .single()

  const responderName = responderData ? `${responderData.first_name} ${responderData.last_name}` : "Someone"

  const appointmentDate = new Date(appointmentData.appointment_date).toLocaleString()

  let title = ""
  let message = ""

  if (responseType === "accept") {
    title = `${responderName} confirmed your appointment`
    message = `Your appointment on ${appointmentDate} has been confirmed`
  } else if (responseType === "decline") {
    title = `${responderName} declined your appointment`
    message = `Your appointment on ${appointmentDate} was declined`
  } else if (responseType === "suggest_alternative") {
    const newDate = new Date(appointmentData.suggested_date).toLocaleString()
    title = `${responderName} suggested a new time`
    message = `${responderName} suggested meeting on ${newDate} instead`
  }

  return sendNotification({
    userId: recipientId,
    type: "appointment_response",
    title,
    message,
    data: {
      appointment_id: appointmentData.id,
      conversation_id: appointmentData.conversation_id,
      listing_id: appointmentData.listing_id,
      appointment_date: appointmentData.appointment_date,
      location: appointmentData.location,
      status: appointmentData.status,
      response_type: responseType,
    },
  })
}

// Create a notification for an appointment reminder
export async function notifyAppointmentReminder(userId: string, appointmentData: any) {
  const appointmentDate = new Date(appointmentData.appointment_date).toLocaleString()

  return sendNotification({
    userId,
    type: "appointment_reminder",
    title: "Upcoming appointment reminder",
    message: `You have an appointment tomorrow at ${appointmentDate}${appointmentData.location ? ` at ${appointmentData.location}` : ""}`,
    data: {
      appointment_id: appointmentData.id,
      conversation_id: appointmentData.conversation_id,
      listing_id: appointmentData.listing_id,
      appointment_date: appointmentData.appointment_date,
      location: appointmentData.location,
      status: appointmentData.status,
    },
  })
}
