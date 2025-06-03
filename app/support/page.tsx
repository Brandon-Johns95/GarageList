/**
 * PSEUDO CODE: Support & Feedback Page
 *
 * PURPOSE: Provide users with support options and feedback submission
 * FLOW:
 *   1. DISPLAY support options and FAQ
 *   2. PROVIDE feedback form for user submissions
 *   3. HANDLE form submission and validation
 *   4. SHOW contact information and resources
 */

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import {
  MessageSquare,
  Mail,
  Phone,
  Clock,
  HelpCircle,
  Bug,
  Lightbulb,
  Shield,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Header } from "@/components/header"

interface FeedbackForm {
  name: string
  email: string
  category: string
  subject: string
  message: string
}

export default function SupportPage() {
  // STEP 1: Initialize state
  const { user } = useAuth()
  const [form, setForm] = useState<FeedbackForm>({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    category: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  // STEP 2: Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Reset form on success
      setForm({
        name: user?.user_metadata?.full_name || "",
        email: user?.email || "",
        category: "",
        subject: "",
        message: "",
      })
      setSubmitStatus("success")
    } catch (error) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  // STEP 3: Handle form field changes
  const handleChange = (field: keyof FeedbackForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use the standard header component */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add page title back */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Support & Feedback</h1>
          <p className="mt-2 text-lg text-gray-600">We're here to help you have the best experience on GarageList</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* STEP 5: Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-gray-600">support@garagelist.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-gray-600">1-800-GARAGE-1</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Support Hours</p>
                    <p className="text-sm text-gray-600">Mon-Fri: 9AM-6PM EST</p>
                    <p className="text-sm text-gray-600">Sat-Sun: 10AM-4PM EST</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* STEP 6: Quick Help Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Getting Started Guide
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Safety & Security
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bug className="h-4 w-4 mr-2" />
                  Report a Problem
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Feature Requests
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* STEP 7: Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* STEP 8: Feedback Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send us Feedback</CardTitle>
                <CardDescription>Have a question, suggestion, or issue? We'd love to hear from you.</CardDescription>
              </CardHeader>
              <CardContent>
                {submitStatus === "success" && (
                  <Alert className="mb-6 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Thank you for your feedback! We'll get back to you within 24 hours.
                    </AlertDescription>
                  </Alert>
                )}

                {submitStatus === "error" && (
                  <Alert className="mb-6 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      Sorry, there was an error sending your message. Please try again.
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={form.category} onValueChange={(value) => handleChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="account">Account Problem</SelectItem>
                        <SelectItem value="listing">Listing Issue</SelectItem>
                        <SelectItem value="payment">Payment/Billing</SelectItem>
                        <SelectItem value="safety">Safety Concern</SelectItem>
                        <SelectItem value="feature">Feature Request</SelectItem>
                        <SelectItem value="general">General Feedback</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={form.subject}
                      onChange={(e) => handleChange("subject", e.target.value)}
                      placeholder="Brief description of your issue or feedback"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      placeholder="Please provide as much detail as possible..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || !form.category || !form.subject || !form.message}
                  >
                    {isSubmitting ? "Sending..." : "Send Feedback"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* STEP 9: FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How do I create a listing?</AccordionTrigger>
                    <AccordionContent>
                      To create a listing, click the "Sell" button in the top navigation. You'll be guided through a
                      step-by-step process to add your vehicle details, photos, and pricing information.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                    <AccordionTrigger>Is it safe to buy/sell on GarageList?</AccordionTrigger>
                    <AccordionContent>
                      Yes! We have several safety measures including user verification, secure messaging, and safety
                      guidelines. Always meet in public places and verify vehicle information before completing any
                      transaction.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>How do I contact a seller?</AccordionTrigger>
                    <AccordionContent>
                      You can contact sellers through our secure messaging system. Click "Contact Seller" on any listing
                      to start a conversation. This keeps your personal information private until you're ready to share
                      it.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>What fees does GarageList charge?</AccordionTrigger>
                    <AccordionContent>
                      GarageList is free for buyers. Sellers pay a small listing fee only when their vehicle sells.
                      There are no upfront costs or hidden fees.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger>How do I edit or delete my listing?</AccordionTrigger>
                    <AccordionContent>
                      Go to your Dashboard and find your active listings. You can edit details, update photos, or mark
                      your vehicle as sold. You can also delete listings that are no longer needed.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-6">
                    <AccordionTrigger>What should I do if I encounter a problem?</AccordionTrigger>
                    <AccordionContent>
                      If you encounter any issues, please use the feedback form above or contact our support team
                      directly. We're here to help resolve any problems quickly and fairly.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
