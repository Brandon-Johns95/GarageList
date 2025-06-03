// Push Notifications Service
// Currently disabled to prevent build errors

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: any
}

export class PushNotificationService {
  private static instance: PushNotificationService
  private isConfigured = false

  private constructor() {
    // Service is currently disabled
    console.log("Push notification service initialized (disabled)")
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  async sendNotification(subscription: PushSubscription, payload: NotificationPayload): Promise<boolean> {
    // Return false to indicate notifications are not sent
    console.log("Push notification would be sent:", payload.title)
    return false
  }

  async sendToMultiple(
    subscriptions: PushSubscription[],
    payload: NotificationPayload,
  ): Promise<{ success: number; failed: number }> {
    // Return zero success to indicate notifications are not sent
    return { success: 0, failed: subscriptions.length }
  }

  isServiceConfigured(): boolean {
    return this.isConfigured
  }

  getPublicVapidKey(): string | null {
    // Return null since service is not configured
    return null
  }
}

export const pushNotificationService = PushNotificationService.getInstance()
