"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, ChevronDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  generateGoogleCalendarUrl,
  generateOutlookCalendarUrl,
  generateYahooCalendarUrl,
  createDownloadableICS,
} from "@/lib/calendar-utils"

interface AddToCalendarProps {
  title: string
  description: string
  location: string
  startTime: Date
  endTime?: Date
  className?: string
}

export function AddToCalendar({ title, description, location, startTime, endTime, className }: AddToCalendarProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Default end time is 1 hour after start time
  const actualEndTime = endTime || new Date(startTime.getTime() + 60 * 60 * 1000)

  // Handle Apple Calendar / iCal download
  const handleAppleCalendar = () => {
    const { url, filename } = createDownloadableICS(title, description, location, startTime, actualEndTime)

    // Create a temporary link and trigger download
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()

    // Clean up
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Calendar className="h-4 w-4 mr-2" />
          Add to Calendar
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <a
            href={generateGoogleCalendarUrl(title, description, location, startTime, actualEndTime)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <img
              src="/placeholder.svg?height=16&width=16&query=Google Calendar icon"
              alt="Google Calendar"
              className="h-4 w-4 mr-2"
            />
            Google Calendar
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleAppleCalendar}>
          <img
            src="/placeholder.svg?height=16&width=16&query=Apple Calendar icon"
            alt="Apple Calendar"
            className="h-4 w-4 mr-2"
          />
          Apple Calendar
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={generateOutlookCalendarUrl(title, description, location, startTime, actualEndTime)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <img
              src="/placeholder.svg?height=16&width=16&query=Outlook Calendar icon"
              alt="Outlook"
              className="h-4 w-4 mr-2"
            />
            Outlook
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={generateYahooCalendarUrl(title, description, location, startTime, actualEndTime)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <img
              src="/placeholder.svg?height=16&width=16&query=Yahoo Calendar icon"
              alt="Yahoo"
              className="h-4 w-4 mr-2"
            />
            Yahoo
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
