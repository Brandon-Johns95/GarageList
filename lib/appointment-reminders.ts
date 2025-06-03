/**
 * Appointment Reminder System
 *
 * This module handles sending reminders for upcoming appointments
 * It can be triggered by a cron job or manually
 */

import { supabase } from "@/lib/supabase"

// Send reminders for appointments happening within the next 24 hours
export async function sendAppointmentReminders() {
  try {
    // Get current time and time 24 hours from now
    const now = new Date()
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    // Find confirmed appointments happening in the next 24 hours
    const { data: appointments, error } = await supabase
      .from("appointments")
      .select("*")
      .or(`status.eq.confirmed,response_status.eq.accepted`)
      .gte("appointment_date", now.toISOString())
      .lt("appointment_date", in24Hours.toISOString())

    if (error) throw error

    if (!appointments || appointments.length === 0) {
      console.log("No upcoming appointments to send reminders for")
      return { sent: 0 }
    }

    // Send notifications for each appointment
    let sentCount = 0
    for (const appointment of appointments) {
      // Get listing details
      const { data: listing } = await supabase
        .from("listings")
        .select("title")
        .eq("id", appointment.listing_id)
        .single()

      const listingTitle = listing?.title || "your appointment"

      // Format appointment time
      const appointmentTime = new Date(appointment.appointment_date)
      const formattedTime = appointmentTime.toLocaleString()

      // Send reminder to both participants
      const participants = [appointment.scheduled_by, appointment.scheduled_with]

      for (const userId of participants) {
        await supabase.from("notifications").insert({
          user_id: userId,
          type: "appointment_reminder",
          title: "Upcoming Appointment Reminder",
          message: `You have an appointment for ${listingTitle} tomorrow at ${appointmentTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
          data: {
            appointment_id: appointment.id,
            conversation_id: appointment.conversation_id,
            listing_id: appointment.listing_id,
            appointment_date: appointment.appointment_date,
            location: appointment.location,
            status: appointment.status,
          },
          read: false,
        })
        sentCount++
      }
    }

    console.log(`Sent ${sentCount} appointment reminders`)
    return { sent: sentCount }
  } catch (error) {
    console.error("Error sending appointment reminders:", error)
    throw error
  }
}
