"use client"

import type React from "react"
import { useState } from "react"
import { Dialog } from "@headlessui/react"
import { useAuth } from "@/lib/auth-context"
import { Eye, EyeOff } from "lucide-react"

type SignInModalProps = {
  isOpen: boolean
  onClose: () => void
  onSwitchToSignUp: () => void
  onSignInSuccess?: () => void
}

export function SignInModal({ isOpen, onClose, onSwitchToSignUp, onSignInSuccess }: SignInModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { signIn: authSignIn, user } = useAuth()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error: authError } = await authSignIn(formData.email, formData.password, formData.rememberMe)

    if (authError) {
      setError(authError.message)
    } else {
      setSuccess(true)
      // Call the success callback if provided
      if (onSignInSuccess) {
        setTimeout(() => {
          onSignInSuccess()
        }, 1000)
      } else {
        setTimeout(() => {
          onClose()
        }, 1000)
      }
    }

    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded bg-white">
          <Dialog.Title className="p-4 text-lg font-medium">Sign In</Dialog.Title>
          <form className="p-4" onSubmit={handleSubmit}>
            {error && <div className="mb-4 rounded bg-red-100 px-4 py-2 text-sm text-red-500">{error}</div>}
            {success && (
              <div className="mb-4 rounded bg-green-100 px-4 py-2 text-sm text-green-500">Signed in successfully!</div>
            )}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-gray-700 focus:outline-none focus:shadow-outline"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            <div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Don't have an account?{" "}
              <button
                type="button"
                className="font-medium text-indigo-600 hover:text-indigo-500"
                onClick={onSwitchToSignUp}
              >
                Sign up
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
