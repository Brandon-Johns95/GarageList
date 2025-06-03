"use client"

import { useState, useEffect } from "react"
import { Bell, MessageSquare, Calendar, ArrowRightLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { supabase } from "@/lib/supabase"

interface NotificationPreference {
  type: string
  enabled: boolean
}

export default function NotificationSettingsPage() {
  const { user } = useAuth()
  const [preferences, setPreferences] = useState<NotificationPreference[]>([])
  const [loading, setLoading] = useState(true)

  // Load notification preferences
  useEffect(() => {
    if (!user) return

    const loadPreferences = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("notification_preferences")
          .select("type, enabled")
          .eq("user_id", user.id)

        if (error) throw error

        if (data && data.length > 0) {
          setPreferences(data)
        } else {
          // Create default preferences if none exist
          const defaultPreferences = [
            { type: "new_message", enabled: true },
            { type: "new_question", enabled: true },
            { type: "question_answered", enabled: true },
            { type: "new_appointment", enabled: true },
            { type: "appointment_response", enabled: true },
            { type: "appointment_reminder", enabled: true },
            { type: "trade_opportunity", enabled: true },
          ]

          setPreferences(defaultPreferences)

          // Save default preferences
          for (const pref of defaultPreferences) {
            await supabase.from("notification_preferences").insert({
              user_id: user.id,
              type: pref.type,
              enabled: pref.enabled,
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

  // Toggle notification preference
  const togglePreference = async (type: string) => {
    if (!user) return

    try {
      const updatedPreferences = preferences.map((pref) => {
        if (pref.type === type) {
          return { ...pref, enabled: !pref.enabled }
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

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Please sign in to manage your notification preferences.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Control when you receive in-app notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`${pref.type}-enabled`} className="text-sm">
                          Enabled
                        </Label>
                        <Switch
                          id={`${pref.type}-enabled`}
                          checked={pref.enabled}
                          onCheckedChange={() => togglePreference(pref.type)}
                          aria-label={`Toggle ${getNotificationTypeName(pref.type)} notifications`}
                        />
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
      </div>
    </div>
  )
}
