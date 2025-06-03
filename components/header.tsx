/**
 * PSEUDO CODE: Main Navigation Header
 *
 * PURPOSE: Provide consistent navigation across all pages
 * FLOW:
 *   1. GET authentication and location state
 *   2. RENDER logo and navigation links
 *   3. SHOW user menu if authenticated
 *   4. HANDLE authentication modals
 */

"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useLocation } from "@/lib/location-context"
import { Button } from "@/components/ui/button"
import { GarageListLogo } from "@/components/garage-list-logo"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { SignInModal } from "@/components/auth/sign-in-modal"
import { SignUpModal } from "@/components/auth/sign-up-modal"
import { MapPin, User, MessageSquare, HelpCircle, LayoutDashboard, ShoppingCart, DollarSign } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  // STEP 1: Get application state
  const { user, signOut } = useAuth()
  const { selectedLocation, clearLocation } = useLocation()

  // STEP 2: Initialize component state
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

  return (
    <>
      {/* STEP 3: Main navigation header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* STEP 4: Logo and main navigation */}
            <Link href="/" className="flex items-center flex-shrink-0">
              <GarageListLogo className="h-8 w-auto" />
            </Link>

            {/* STEP 5: Center - Location display and navigation */}
            <div className="flex-1 flex justify-center items-center space-x-8">
              {selectedLocation && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {selectedLocation.city}, {selectedLocation.state}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearLocation}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Change
                  </Button>
                </div>
              )}

              {/* Navigation buttons for authenticated users */}
              {user && (
                <nav className="hidden md:flex items-center space-x-1">
                  <Link href="/">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      <span>Buy</span>
                    </Button>
                  </Link>
                  <Link href="/sell">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
                    >
                      <DollarSign className="h-4 w-4" />
                      <span>Sell</span>
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>MyGarage</span>
                    </Button>
                  </Link>
                  <Link href="/messages">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1 text-gray-700 hover:text-gray-900"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Messages</span>
                    </Button>
                  </Link>
                </nav>
              )}
            </div>

            {/* STEP 6: Right side navigation */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Support link - visible to all users */}
              <Link href="/support">
                <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                  <HelpCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Support</span>
                </Button>
              </Link>

              {user ? (
                /**
                 * PSEUDO CODE: Authenticated User Menu
                 * FLOW:
                 *   1. SHOW notification bell
                 *   2. SHOW sell button
                 *   3. SHOW user dropdown menu
                 */
                <>
                  <NotificationBell />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                        {user.user_metadata?.avatar_url ? (
                          <img
                            src={user.user_metadata.avatar_url || "/placeholder.svg"}
                            alt="Profile"
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                        <span className="hidden sm:inline max-w-32 truncate">
                          Welcome{" "}
                          {user.user_metadata?.full_name?.split(" ")[0] ||
                            user.user_metadata?.name?.split(" ")[0] ||
                            user.user_metadata?.first_name ||
                            user.identities?.[0]?.identity_data?.full_name?.split(" ")[0] ||
                            user.identities?.[0]?.identity_data?.name?.split(" ")[0] ||
                            user.email?.split("@")[0] ||
                            "User"}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      {/* Mobile navigation items - only show on small screens */}
                      <div className="md:hidden">
                        <DropdownMenuItem asChild>
                          <Link href="/" className="flex items-center">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Buy
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/sell" className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-2" />
                            Sell
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard" className="flex items-center">
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            MyGarage
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/messages" className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Messages
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </div>
                      {/* Desktop Profile button */}
                      <DropdownMenuItem asChild>
                        <Link href="/profile" className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut}>Sign Out</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                /**
                 * PSEUDO CODE: Guest User Menu
                 * FLOW:
                 *   1. SHOW sign in button
                 *   2. SHOW sign up button
                 */
                <>
                  <Button variant="ghost" onClick={() => setShowSignIn(true)}>
                    Sign In
                  </Button>
                  <Button onClick={() => setShowSignUp(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* STEP 7: Authentication modals */}
      <SignInModal
        isOpen={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={() => {
          setShowSignIn(false)
          setShowSignUp(true)
        }}
      />
      <SignUpModal
        isOpen={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={() => {
          setShowSignUp(false)
          setShowSignIn(true)
        }}
      />
    </>
  )
}
