/**
 * Calendar Integration Utilities
 *
 * This module provides functions for generating calendar files and links
 * for various calendar services (Google Calendar, Apple Calendar, Outlook, etc.)
 */

// Format date for ICS file
const formatDateForICS = (date: Date): string => {
  return date.toISOString().replace(/-|:|\.\d+/g, "")
}

// Generate a unique ID for calendar events
const generateUID = (): string => {
  return `event-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}-${Date.now()}`
}

// Create an ICS file content for calendar events
export const generateICSFile = (
  title: string,
  description: string,
  location: string,
  startTime: Date,
  endTime: Date,
  uid?: string,
): string => {
  // Default duration is 1 hour if not specified
  if (!endTime) {
    endTime = new Date(startTime.getTime() + 60 * 60 * 1000)
  }

  const eventUID = uid || generateUID()
  const now = formatDateForICS(new Date())
  const start = formatDateForICS(startTime)
  const end = formatDateForICS(endTime)

  return `BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
PRODID:-//GarageList//Vehicle Appointment//EN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${eventUID}
SUMMARY:${title.replace(/\n/g, "\\n")}
DTSTAMP:${now}
DTSTART:${start}
DTEND:${end}
DESCRIPTION:${description.replace(/\n/g, "\\n")}
LOCATION:${location.replace(/\n/g, "\\n")}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`
}

// Generate Google Calendar URL
export const generateGoogleCalendarUrl = (
  title: string,
  description: string,
  location: string,
  startTime: Date,
  endTime: Date,
): string => {
  // Default duration is 1 hour if not specified
  if (!endTime) {
    endTime = new Date(startTime.getTime() + 60 * 60 * 1000)
  }

  const startTimeISO = startTime.toISOString().replace(/-|:|\.\d+/g, "")
  const endTimeISO = endTime.toISOString().replace(/-|:|\.\d+/g, "")

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    details: description,
    location: location,
    dates: `${startTimeISO}/${endTimeISO}`,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

// Generate Outlook Calendar URL
export const generateOutlookCalendarUrl = (
  title: string,
  description: string,
  location: string,
  startTime: Date,
  endTime: Date,
): string => {
  // Default duration is 1 hour if not specified
  if (!endTime) {
    endTime = new Date(startTime.getTime() + 60 * 60 * 1000)
  }

  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: title,
    body: description,
    location: location,
    startdt: startTime.toISOString(),
    enddt: endTime.toISOString(),
  })

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

// Generate Yahoo Calendar URL
export const generateYahooCalendarUrl = (
  title: string,
  description: string,
  location: string,
  startTime: Date,
  endTime: Date,
): string => {
  // Default duration is 1 hour if not specified
  if (!endTime) {
    endTime = new Date(startTime.getTime() + 60 * 60 * 1000)
  }

  const params = new URLSearchParams({
    v: "60",
    title: title,
    desc: description,
    in_loc: location,
    st: Math.floor(startTime.getTime() / 1000).toString(),
    et: Math.floor(endTime.getTime() / 1000).toString(),
  })

  return `https://calendar.yahoo.com/?${params.toString()}`
}

// Create a downloadable ICS file
export const createDownloadableICS = (
  title: string,
  description: string,
  location: string,
  startTime: Date,
  endTime?: Date,
): { url: string; filename: string } => {
  const icsContent = generateICSFile(
    title,
    description,
    location,
    startTime,
    endTime || new Date(startTime.getTime() + 60 * 60 * 1000),
  )
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const filename = `appointment-${startTime.toISOString().split("T")[0]}.ics`

  return { url, filename }
}
