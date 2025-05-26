/**
 * PSEUDO CODE: Trade Proposal Form Component
 *
 * PURPOSE: Allow users to create and send trade proposals
 * FLOW:
 *   1. DISPLAY user's vehicle and target vehicle details
 *   2. ALLOW user to add cash difference (+ or -)
 *   3. ENABLE user to write proposal message
 *   4. VALIDATE proposal data before submission
 *   5. SEND proposal to database and notify recipient
 */

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRightLeft, DollarSign, MessageSquare, Send } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

interface TradeProposalFormProps {
  userListing: any
  targetListing: any
  onProposalSent?: () => void
  onCancel?: () => void
}

export function TradeProposalForm({ userListing, targetListing, onProposalSent, onCancel }: TradeProposalFormProps) {
  // PSEUDO: Component state management
  const { user } = useAuth()
  const [cashDifference, setCashDifference] = useState<number>(0)
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // PSEUDO: Calculate suggested cash difference based on price difference
  const priceDifference = targetListing.price - userListing.price
  const suggestedCash = priceDifference > 0 ? priceDifference : 0

  // PSEUDO: Handle trade proposal submission
  const handleSubmitProposal = async () => {
    if (!user || !message.trim()) return

    setIsSubmitting(true)
    try {
      // STEP 1: Create trade proposal record
      const { data: proposal, error: proposalError } = await supabase
        .from("trade_proposals")
        .insert({
          proposer_id: user.id,
          proposer_listing_id: userListing.id,
          target_listing_id: targetListing.id,
          target_user_id: targetListing.user_id,
          cash_difference: cashDifference,
          message: message.trim(),
          status: "pending",
        })
        .select()
        .single()

      if (proposalError) throw proposalError

      // STEP 2: Create notification for target user
      await supabase.from("notifications").insert({
        user_id: targetListing.user_id,
        type: "trade_proposal",
        title: "New Trade Proposal",
        message: `${user.user_metadata?.first_name || "Someone"} wants to trade their ${userListing.year} ${userListing.make} ${userListing.model} for your ${targetListing.year} ${targetListing.make} ${targetListing.model}`,
        data: { proposal_id: proposal.id },
        read: false,
      })

      // STEP 3: Success feedback and cleanup
      onProposalSent?.()
    } catch (error) {
      console.error("Error sending trade proposal:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* PSEUDO: Trade overview section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* User's vehicle */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-green-600">Your Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <img
              src={userListing.photos?.[0] || "/placeholder.svg"}
              alt={`${userListing.year} ${userListing.make} ${userListing.model}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-semibold">
                {userListing.year} {userListing.make} {userListing.model}
              </h3>
              <p className="text-sm text-gray-600">{userListing.mileage?.toLocaleString()} miles</p>
              <p className="text-lg font-bold text-green-600">${userListing.price?.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Trade arrow */}
        <div className="flex justify-center">
          <div className="bg-blue-100 p-3 rounded-full">
            <ArrowRightLeft className="h-6 w-6 text-blue-600" />
          </div>
        </div>

        {/* Target vehicle */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-600">Target Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <img
              src={targetListing.photos?.[0] || "/placeholder.svg"}
              alt={`${targetListing.year} ${targetListing.make} ${targetListing.model}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-semibold">
                {targetListing.year} {targetListing.make} {targetListing.model}
              </h3>
              <p className="text-sm text-gray-600">{targetListing.mileage?.toLocaleString()} miles</p>
              <p className="text-lg font-bold text-blue-600">${targetListing.price?.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PSEUDO: Cash difference section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cash Difference
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {priceDifference !== 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                Price difference: <span className="font-semibold">${Math.abs(priceDifference).toLocaleString()}</span>
                {priceDifference > 0 ? " (you would add cash)" : " (they would add cash)"}
              </p>
              {priceDifference > 0 && (
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setCashDifference(suggestedCash)}>
                  Use suggested amount
                </Button>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cash-difference">
              Cash you'll add to the trade (enter negative if they should add cash)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="cash-difference"
                type="number"
                value={cashDifference}
                onChange={(e) => setCashDifference(Number(e.target.value))}
                className="pl-10"
                placeholder="0"
              />
            </div>
            {cashDifference !== 0 && (
              <p className="text-sm text-gray-600">
                {cashDifference > 0
                  ? `You will add $${cashDifference.toLocaleString()} cash`
                  : `They will add $${Math.abs(cashDifference).toLocaleString()} cash`}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* PSEUDO: Message section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Proposal Message
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a message explaining why this trade would work for both of you..."
            className="min-h-[120px]"
            maxLength={500}
          />
          <p className="text-sm text-gray-500 mt-2">{message.length}/500 characters</p>
        </CardContent>
      </Card>

      {/* PSEUDO: Action buttons */}
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmitProposal}
          disabled={!message.trim() || isSubmitting}
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "Sending..." : "Send Proposal"}
        </Button>
      </div>
    </div>
  )
}
