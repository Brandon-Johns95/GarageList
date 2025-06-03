"use client"

import { useState, useEffect } from "react"
import { Bell, BellOff, MessageSquare, Calendar, ArrowRightLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSubscribedToPushNotifications,
} from "@/lib/push-notifications"

interface NotificationPreference {
  type: string
  enabled: boolean
  push_enabled: boolean
}

export function NotificationPreferences() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<NotificationPreference[]>([])
  const [pushSupported, setPushSupported] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if push notifications are supported
  useEffect(() => {
    const checkPushSupport = async () => {
      const supported = "PushManager" in window && "serviceWorker" in navigator
      setPushSupported(supported)

      if (supported) {
        const subscribed = await isSubscribedToPushNotifications()
        setPushEnabled(subscribed)
      }
    }

    checkPushSupport()
  }, [])

  // Load notification preferences
  useEffect(() => {
    if (!user) return

    const loadPreferences = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.from("notification_preferences").select("*").eq("user_id", user.id)

        if (error) throw error

        if (data && data.length > 0) {
          setPreferences(data)
        } else {
          // Create default preferences if none exist
          const defaultPreferences = [
            { type: "new_message", enabled: true, push_enabled: true },
            { type: "new_question", enabled: true, push_enabled: true },
            { type: "question_answered", enabled: true, push_enabled: true },
            { type: "new_appointment", enabled: true, push_enabled: true },
            { type: "appointment_response", enabled: true, push_enabled: true },
            { type: "appointment_reminder", enabled: true, push_enabled: true },
            { type: "trade_opportunity", enabled: true, push_enabled: true },
          ]

          setPreferences(defaultPreferences)

          // Save default preferences
          for (const pref of defaultPreferences) {
            await supabase.from("notification_preferences").insert({
              user_id: user.id,
              type: pref.type,
              enabled: pref.enabled,
              push_enabled: pref.push_enabled,
            })
          }
        }
      } catch (error) {
        console.error("Error loading notification preferences:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [user])

  // Toggle push notifications
  const togglePushNotifications = async () => {
    if (!user) return

    try {
      if (pushEnabled) {
        const success = await unsubscribeFromPushNotifications(user.id)
        if (success) {
          setPushEnabled(false)
        }
      } else {
        const success = await subscribeToPushNotifications(user.id)
        if (success) {
          setPushEnabled(true)
        }
      }
    } catch (error) {
      console.error("Error toggling push notifications:", error)
    }
  }

  // Toggle notification preference
  const togglePreference = async (type: string, field: "enabled" | "push_enabled") => {
    if (!user) return

    try {
      const updatedPreferences = preferences.map((pref) => {
        if (pref.type === type) {
          return { ...pref, [field]: !pref[field] }
        }
        return pref
      })

      setPreferences(updatedPreferences)

      const preference = updatedPreferences.find((p) => p.type === type)
      if (preference) {
        await supabase.from("notification_preferences").upsert(
          {
            user_id: user.id,
            type,
            enabled: preference.enabled,
            push_enabled: preference.push_enabled,
          },
          {
            onConflict: "user_id,type",
          },
        )
      }
    } catch (error) {
      console.error("Error updating notification preference:", error)
    }
  }

  // Get notification type display name
  const getNotificationTypeName = (type: string) => {
    switch (type) {
      case "new_message":
        return "New Messages"
      case "new_question":
        return "New Questions"
      case "question_answered":
        return "Question Answers"
      case "new_appointment":
        return "New Appointments"
      case "appointment_response":
        return "Appointment Responses"
      case "appointment_reminder":
        return "Appointment Reminders"
      case "trade_opportunity":
        return "Trade Opportunities"
      default:
        return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    }
  }

  // Get notification type icon
  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case "new_message":
      case "new_question":
      case "question_answered":
        return <MessageSquare className="h-5 w-5 text-blue-600" />
      case "new_appointment":
      case "appointment_response":
      case "appointment_reminder":
        return <Calendar className="h-5 w-5 text-indigo-600" />
      case "trade_opportunity":
        return <ArrowRightLeft className="h-5 w-5 text-purple-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  if (!user) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Control how and when you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Push Notifications Master Toggle */}
        {pushSupported && (
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-3">
              {pushEnabled ? (
                <Bell className="h-6 w-6 text-green-600" />
              ) : (
                <BellOff className="h-6 w-6 text-gray-400" />
              )}
              <div>
                <h3 className="font-medium">Browser Push Notifications</h3>
                <p className="text-sm text-gray-500">
                  {pushEnabled
                    ? "You will receive notifications even when the browser is in the background"
                    : "Enable to receive notifications when the browser is in the background"}
                </p>
              </div>
            </div>
            <Switch
              checked={pushEnabled}
              onCheckedChange={togglePushNotifications}
              aria-label="Toggle push notifications"
            />
          </div>
        )}

        {/* Notification Type Preferences */}
        <div className="space-y-4">
          <h3 className="font-medium">Notification Types</h3>

          {loading ? (
            <div className="text-center py-4">Loading preferences...</div>
          ) : (
            <div className="space-y-4">
              {preferences.map((pref) => (
                <div key={pref.type} className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center space-x-3">
                    {getNotificationTypeIcon(pref.type)}
                    <div>
                      <h4 className="font-medium">{getNotificationTypeName(pref.type)}</h4>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor={`${pref.type}-enabled`} className="text-sm">
                        In-App
                      </Label>
                      <Switch
                        id={`${pref.type}-enabled`}
                        checked={pref.enabled}
                        onCheckedChange={() => togglePreference(pref.type, "enabled")}
                        aria-label={`Toggle ${getNotificationTypeName(pref.type)} in-app notifications`}
                      />
                    </div>

                    {pushSupported && (
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`${pref.type}-push`} className="text-sm">
                          Push
                        </Label>
                        <Switch
                          id={`${pref.type}-push`}
                          checked={pref.push_enabled && pushEnabled}
                          onCheckedChange={() => togglePreference(pref.type, "push_enabled")}
                          disabled={!pushEnabled}
                          aria-label={`Toggle ${getNotificationTypeName(pref.type)} push notifications`}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-gray-500">You can change these settings at any time</p>
      </CardFooter>
    </Card>
  )
}
