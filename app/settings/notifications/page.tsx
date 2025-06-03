import { NotificationPreferences } from "@/components/notifications/notification-preferences"

export default function NotificationSettingsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Notification Settings</h1>
      <div className="max-w-2xl mx-auto">
        <NotificationPreferences />
      </div>
    </div>
  )
}
