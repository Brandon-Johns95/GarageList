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
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>
  signOut: () => Promise<void>
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

  // STEP 4: Setup authentication monitoring
  useEffect(() => {
    /**
     * PSEUDO CODE: Initial Session Setup
     * FLOW:
     *   1. GET current session from Supabase
     *   2. IF session exists: LOAD user profile
     *   3. SETUP real-time auth state listener
     *   4. HANDLE authentication state changes
     */

    const getInitialSession = async () => {
      try {
        // Check if user previously chose to be remembered
        const rememberMe = localStorage.getItem("auth_remember_me") === "true"

        // GET current session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        // If we have a session and user chose to be remembered, refresh it
        if (session?.user && rememberMe) {
          await supabase.auth.refreshSession()
        }

        // SET user from session
        setUser(session?.user ?? null)

        // LOAD profile if user exists
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setProfile(null)
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // SETUP real-time authentication listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      setUser(session?.user ?? null)

      if (session?.user) {
        await loadUserProfile(session.user.id)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  /**
   * PSEUDO CODE: Load User Profile
   * FLOW:
   *   1. QUERY user_profiles table for user data
   *   2. IF profile exists: SET profile state
   *   3. IF no profile: HANDLE gracefully (new user)
   */
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

  /**
   * PSEUDO CODE: Refresh Profile Data
   * FLOW:
   *   1. IF user is logged in: RELOAD profile from database
   */
  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id)
    }
  }

  /**
   * PSEUDO CODE: Sign In User
   * FLOW:
   *   1. ATTEMPT sign in with email/password
   *   2. HANDLE remember me preference
   *   3. RETURN success/error status
   */
  const signIn = async (email: string, password: string, rememberMe = false) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        data: {
          remember_me: rememberMe,
        },
      },
    })

    // Configure session persistence based on remember me preference
    if (!error) {
      if (rememberMe) {
        localStorage.setItem("auth_remember_me", "true")
        // Set a longer session for remember me users
        await supabase.auth.refreshSession()
      } else {
        localStorage.removeItem("auth_remember_me")
      }
    }

    return { error }
  }

  /**
   * PSEUDO CODE: Sign Up New User
   * FLOW:
   *   1. CREATE new user account with email/password
   *   2. INCLUDE additional user data in metadata
   *   3. RETURN success/error status
   */
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

  /**
   * PSEUDO CODE: Sign Out User
   * FLOW:
   *   1. CLEAR remember me preference
   *   2. CLEAR all local storage auth data
   *   3. SIGN OUT from Supabase with proper scope
   *   4. FORCE reload to clear any cached state
   */
  const signOut = async () => {
    try {
      // Clear all auth-related localStorage
      localStorage.removeItem("auth_remember_me")
      localStorage.removeItem("sb-garage-list-auth-token")

      // Sign out from Supabase with 'local' scope to clear session
      await supabase.auth.signOut({ scope: "local" })

      // Clear state immediately
      setUser(null)
      setProfile(null)

      // Force a page reload to ensure clean state
      window.location.href = "/"
    } catch (error) {
      console.error("Error signing out:", error)
      // Even if there's an error, clear local state and redirect
      setUser(null)
      setProfile(null)
      window.location.href = "/"
    }
  }

  /**
   * PSEUDO CODE: Update User Profile
   * FLOW:
   *   1. VALIDATE user is logged in
   *   2. UPDATE profile in database
   *   3. UPDATE local state if successful
   */
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

  // STEP 5: Provide context value to children
  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * PSEUDO CODE: Authentication Hook
 * PURPOSE: Provide easy access to authentication context
 * FLOW:
 *   1. GET context from AuthContext
 *   2. VALIDATE context exists
 *   3. RETURN authentication state and methods
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
