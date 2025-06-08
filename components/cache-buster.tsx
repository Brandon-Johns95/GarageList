"use client"

import { useEffect } from "react"

export function CacheBuster() {
  useEffect(() => {
    // Clear any problematic cached data on load
    const clearProblematicCache = () => {
      try {
        // Clear localStorage items that might be causing issues
        const keysToRemove = ["garage_list_remember_me", "supabase.auth.token", "sb-auth-token"]

        keysToRemove.forEach((key) => {
          localStorage.removeItem(key)
        })

        // Clear sessionStorage
        sessionStorage.clear()

        console.log("Cache cleared successfully")
      } catch (error) {
        console.warn("Could not clear cache:", error)
      }
    }

    // Only run on first load
    if (!sessionStorage.getItem("cache_cleared")) {
      clearProblematicCache()
      sessionStorage.setItem("cache_cleared", "true")
    }
  }, [])

  return null
}
