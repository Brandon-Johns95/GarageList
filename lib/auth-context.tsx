/**
 * PSEUDO CODE: Authentication Context Provider
 *
 * PURPOSE: Manage user authentication state across the application
 * FLOW:
 *   1. INITIALIZE authentication state (user, profile, loading)
 *   2. LISTEN for authentication changes
 *   3. PROVIDE authentication methods (signIn, signUp, signOut)
 *   4. MANAGE user profile data
 */

"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"

// STEP 1: Define TypeScript interfaces for type safety
type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  needsPasswordReset: boolean
  setNeedsPasswordReset: (needs: boolean) => void
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  updateUser: (updates: { password?: string }) => Promise<{ error: any }>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
}

type UserProfile = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  date_of_birth: string | null
  phone: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  avatar_url: string | null
  bio: string | null
  rating: number
  review_count: number
  member_since: string
  is_verified: boolean
  created_at: string
  updated_at: string
}

// STEP 2: Create React context for authentication
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // STEP 3: Initialize state variables
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false)

  // STEP 4: Setup authentication monitoring
  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!mounted) return

        if (error) {
          console.error("Error getting session:", error)
          setUser(null)
          setProfile(null)
          return
        }

        setUser(session?.user ?? null)

        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setProfile(null)
        }
      } catch (error) {
        if (mounted) {
          console.error("Error in getInitialSession:", error)
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log("Auth state changed:", event, session?.user?.email)

      // Check if this is a password recovery event
      if (event === "PASSWORD_RECOVERY") {
        setNeedsPasswordReset(true)
      }

      setUser(session?.user ?? null)

      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setProfile(null)
        setNeedsPasswordReset(false)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("No profile found for user, this is normal for new users")
          setProfile(null)
          return
        }
        console.error("Error loading profile:", error)
        setProfile(null)
      } else {
        setProfile(data)
      }
    } catch (error) {
      console.error("Error in loadUserProfile:", error)
      setProfile(null)
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id)
    }
  }

  const signIn = async (email: string, password: string, rememberMe = false) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error && rememberMe) {
      try {
        localStorage.setItem("garage_list_remember_me", "true")
      } catch (e) {
        console.warn("Could not save remember me preference:", e)
      }
    } else {
      try {
        localStorage.removeItem("garage_list_remember_me")
      } catch (e) {
        // Ignore localStorage errors
      }
    }

    return { error }
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    return { error }
  }

  const updateUser = async (updates: { password?: string }) => {
    const { error } = await supabase.auth.updateUser(updates)

    if (!error && updates.password) {
      setNeedsPasswordReset(false)
    }

    return { error }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          date_of_birth: userData.dateOfBirth,
          phone: userData.phone,
          city: userData.city,
          state: userData.state,
        },
      },
    })
    return { error }
  }

  const signOut = async () => {
    try {
      try {
        localStorage.removeItem("garage_list_remember_me")
      } catch (e) {
        // Ignore localStorage errors
      }

      await supabase.auth.signOut({ scope: "local" })

      setUser(null)
      setProfile(null)

      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
      setUser(null)
      setProfile(null)
      window.location.href = "/"
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error("No user logged in") }

    const { error } = await supabase
      .from("user_profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", user.id)

    if (!error) {
      setProfile((prev) => (prev ? { ...prev, ...updates } : null))
    }

    return { error }
  }

  const value = {
    user,
    profile,
    loading,
    needsPasswordReset,
    setNeedsPasswordReset,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateUser,
    updateProfile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
