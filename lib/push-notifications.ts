import { supabase } from "./supabase"

// VAPID keys should be generated and stored securely
// For production, these should be environment variables
const publicVapidKey = "BLBz-HXFTZJLmyGNsIlRFEbS_SsF1bFfhZKYa_AYMkQGaBOGcGRQRnXYTdEXiTHEjNzDzRAWRgFAHJzjqYvDDOo"
const privateVapidKey = "YOUR_PRIVATE_VAPID_KEY" // This should be an environment variable

// Function to convert URL safe base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Register the service worker
export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/service-worker.js", {
        scope: "/",
      })
      console.log("Service Worker registered with scope:", registration.scope)
      return registration
    } catch (error) {
      console.error("Service Worker registration failed:", error)
      return null
    }
  }
  return null
}

// Subscribe to push notifications
export async function subscribeToPushNotifications(userId: string) {
  try {
    // Check if push is supported
    if (!("PushManager" in window)) {
      console.error("Push notifications not supported")
      return false
    }

    // Register service worker
    const registration = await registerServiceWorker()
    if (!registration) return false

    // Request permission
    const permission = await Notification.requestPermission()
    if (permission !== "granted") {
      console.log("Notification permission denied")
      return false
    }

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    })

    // Store subscription in database
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: userId,
        subscription: JSON.stringify(subscription),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )

    if (error) {
      console.error("Error storing push subscription:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error subscribing to push notifications:", error)
    return false
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(userId: string) {
  try {
    if (!("serviceWorker" in navigator)) return false

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready

    // Get push subscription
    const subscription = await registration.pushManager.getSubscription()

    // If subscription exists, unsubscribe
    if (subscription) {
      await subscription.unsubscribe()
    }

    // Remove from database
    const { error } = await supabase.from("push_subscriptions").delete().eq("user_id", userId)

    if (error) {
      console.error("Error removing push subscription from database:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error unsubscribing from push notifications:", error)
    return false
  }
}

// Check if user is subscribed to push notifications
export async function isSubscribedToPushNotifications() {
  try {
    if (!("serviceWorker" in navigator)) return false

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready

    // Get push subscription
    const subscription = await registration.pushManager.getSubscription()

    return !!subscription
  } catch (error) {
    console.error("Error checking push subscription:", error)
    return false
  }
}
