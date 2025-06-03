// Service Worker for Push Notifications
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()

    const options = {
      body: data.body,
      icon: data.icon || "/logo.png",
      badge: data.badge || "/badge.png",
      image: data.image,
      data: data.data || {},
      actions: data.actions || [],
      vibrate: [100, 50, 100],
      tag: data.tag || "default",
      renotify: data.renotify || false,
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  // Get the notification data
  const data = event.notification.data

  // Handle click based on notification type
  if (data && data.url) {
    // Open the URL when notification is clicked
    event.waitUntil(clients.openWindow(data.url))
  }

  // Handle notification action buttons
  if (event.action === "view_conversation") {
    event.waitUntil(clients.openWindow(`/messages?conversation=${data.conversationId}`))
  } else if (event.action === "view_listing") {
    event.waitUntil(clients.openWindow(`/listing/${data.listingId}`))
  }
})
