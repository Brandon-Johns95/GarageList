import { NextResponse } from "next/server"
import webpush from "web-push"
import { supabase } from "@/lib/supabase"

// VAPID keys should be environment variables
const publicVapidKey = "BLBz-HXFTZJLmyGNsIlRFEbS_SsF1bFfhZKYa_AYMkQGaBOGcGRQRnXYTdEXiTHEjNzDzRAWRgFAHJzjqYvDDOo"
const privateVapidKey = process.env.PRIVATE_VAPID_KEY || "YOUR_PRIVATE_VAPID_KEY"

// Configure web-push
webpush.setVapidDetails("mailto:support@garagelist.com", publicVapidKey, privateVapidKey)

export async function POST(request: Request) {
  try {
    // Get request body
    const body = await request.json()
    const { userId, title, message, data } = body

    if (!userId || !title || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user's push subscription
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", userId)
      .single()

    if (subscriptionError || !subscriptionData) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    // Parse subscription
    const subscription = JSON.parse(subscriptionData.subscription)

    // Create notification payload
    const payload = JSON.stringify({
      title,
      body: message,
      icon: "/logo.png",
      badge: "/badge.png",
      data: {
        url: data?.url || "/",
        conversationId: data?.conversationId,
        listingId: data?.listingId,
        appointmentId: data?.appointmentId,
        notificationType: data?.type || "general",
      },
      actions: getNotificationActions(data?.type),
    })

    // Send notification
    await webpush.sendNotification(subscription, payload)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending push notification:", error)
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 })
  }
}

// Helper function to get notification actions based on type
function getNotificationActions(type: string | undefined) {
  switch (type) {
    case "new_message":
      return [{ action: "view_conversation", title: "View Conversation" }]
    case "new_appointment":
    case "appointment_response":
    case "appointment_reminder":
      return [
        { action: "view_conversation", title: "View Conversation" },
        { action: "view_listing", title: "View Listing" },
      ]
    case "new_question":
    case "question_answered":
      return [{ action: "view_listing", title: "View Listing" }]
    case "trade_opportunity":
      return [{ action: "view_listing", title: "View Listing" }]
    default:
      return []
  }
}
