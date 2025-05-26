import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import { LocationProvider } from "@/lib/location-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "GarageList - Your Trusted Vehicle Marketplace",
  description: "Buy and sell vehicles in your local community",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LocationProvider>{children}</LocationProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
