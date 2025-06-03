import { NextResponse } from "next/server"
import { sendAppointmentReminders } from "@/lib/appointment-reminders"

export async function GET() {
  try {
    const result = await sendAppointmentReminders()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in appointment reminders API:", error)
    return NextResponse.json({ error: "Failed to send appointment reminders" }, { status: 500 })
  }
}
