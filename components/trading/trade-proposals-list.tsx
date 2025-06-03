/**
 * PSEUDO CODE: Trade Proposals List Component
 *
 * PURPOSE: Display and manage sent/received trade proposals
 * FLOW:
 *   1. FETCH user's sent and received proposals
 *   2. DISPLAY proposals in organized tabs
 *   3. ALLOW users to accept/decline/counter proposals
 *   4. PROVIDE real-time status updates
 */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowRightLeft, Check, X, MessageSquare, DollarSign, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"

interface TradeProposal {
  id: string
  proposer_id: string
  target_user_id: string
  cash_difference: number
  message: string
  status: "pending" | "accepted" | "declined" | "countered"
  created_at: string
  proposer_listing: any
  target_listing: any
  proposer_profile: any
  target_profile: any
}

export function TradeProposalsList() {
  // PSEUDO: Component state management
  const { user } = useAuth()
  const [sentProposals, setSentProposals] = useState<TradeProposal[]>([])
  const [receivedProposals, setReceivedProposals] = useState<TradeProposal[]>([])
  const [loading, setLoading] = useState(true)

  // PSEUDO: Load user's trade proposals
  const loadProposals = async () => {
    if (!user) return

    try {
      // STEP 1: Fetch sent proposals
      const { data: sent, error: sentError } = await supabase
        .from("trade_proposals")
        .select(`
          *,
          proposer_listing:listings!proposer_listing_id(*),
          target_listing:listings!target_listing_id(*),
          target_profile:user_profiles!target_user_id(*)
        `)
        .eq("proposer_id", user.id)
        .order("created_at", { ascending: false })

      if (sentError) throw sentError

      // STEP 2: Fetch received proposals
      const { data: received, error: receivedError } = await supabase
        .from("trade_proposals")
        .select(`
          *,
          proposer_listing:listings!proposer_listing_id(*),
          target_listing:listings!target_listing_id(*),
          proposer_profile:user_profiles!proposer_id(*)
        `)
        .eq("target_user_id", user.id)
        .order("created_at", { ascending: false })

      if (receivedError) throw receivedError

      setSentProposals(sent || [])
      setReceivedProposals(received || [])
    } catch (error) {
      console.error("Error loading proposals:", error)
    } finally {
      setLoading(false)
    }
  }

  // PSEUDO: Handle proposal response (accept/decline)
  const handleProposalResponse = async (proposalId: string, status: "accepted" | "declined") => {
    try {
      const { error } = await supabase.from("trade_proposals").update({ status }).eq("id", proposalId)

      if (error) throw error

      // STEP: Reload proposals to reflect changes
      loadProposals()
    } catch (error) {
      console.error("Error updating proposal:", error)
    }
  }

  // PSEUDO: Get status badge styling
  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      declined: "bg-red-100 text-red-800",
      countered: "bg-blue-100 text-blue-800",
    }
    return styles[status as keyof typeof styles] || styles.pending
  }

  // PSEUDO: Render individual proposal card
  const renderProposalCard = (proposal: TradeProposal, type: "sent" | "received") => {
    const isReceived = type === "received"
    const otherUser = isReceived ? proposal.proposer_profile : proposal.target_profile
    const userListing = isReceived ? proposal.target_listing : proposal.proposer_listing
    const otherListing = isReceived ? proposal.proposer_listing : proposal.target_listing

    return (
      <Card key={proposal.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser?.avatar_url || "/placeholder.svg"} />
                <AvatarFallback>
                  {otherUser?.first_name?.[0]}
                  {otherUser?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {otherUser?.first_name} {otherUser?.last_name}
                </h3>
                <p className="text-sm text-gray-600">{new Date(proposal.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <Badge className={getStatusBadge(proposal.status)}>{proposal.status}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* PSEUDO: Vehicle trade overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <img
                src={userListing?.photos?.[0] || "/placeholder.svg"}
                alt="Your vehicle"
                className="w-full h-24 object-cover rounded-lg mb-2"
              />
              <p className="text-sm font-medium">
                {userListing?.year} {userListing?.make} {userListing?.model}
              </p>
              <p className="text-sm text-gray-600">${userListing?.price?.toLocaleString()}</p>
            </div>

            <div className="flex justify-center">
              <ArrowRightLeft className="h-6 w-6 text-gray-400" />
            </div>

            <div className="text-center">
              <img
                src={otherListing?.photos?.[0] || "/placeholder.svg"}
                alt="Their vehicle"
                className="w-full h-24 object-cover rounded-lg mb-2"
              />
              <p className="text-sm font-medium">
                {otherListing?.year} {otherListing?.make} {otherListing?.model}
              </p>
              <p className="text-sm text-gray-600">${otherListing?.price?.toLocaleString()}</p>
            </div>
          </div>

          {/* PSEUDO: Cash difference display */}
          {proposal.cash_difference !== 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-600" />
                <span className="text-sm">
                  {proposal.cash_difference > 0
                    ? `${isReceived ? "They" : "You"} add $${proposal.cash_difference.toLocaleString()}`
                    : `${isReceived ? "You" : "They"} add $${Math.abs(proposal.cash_difference).toLocaleString()}`}
                </span>
              </div>
            </div>
          )}

          {/* PSEUDO: Proposal message */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800">{proposal.message}</p>
            </div>
          </div>

          {/* PSEUDO: Action buttons for received proposals */}
          {isReceived && proposal.status === "pending" && (
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleProposalResponse(proposal.id, "declined")}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => handleProposalResponse(proposal.id, "accepted")}
                className="flex items-center gap-1"
              >
                <Check className="h-4 w-4" />
                Accept
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  useEffect(() => {
    loadProposals()
  }, [user])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Trade Proposals</h2>
        <Button variant="outline" onClick={loadProposals}>
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="received" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Received ({receivedProposals.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4" />
            Sent ({sentProposals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="mt-6">
          {receivedProposals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">No proposals received</h3>
                <p className="text-gray-500">Trade proposals from other users will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div>{receivedProposals.map((proposal) => renderProposalCard(proposal, "received"))}</div>
          )}
        </TabsContent>

        <TabsContent value="sent" className="mt-6">
          {sentProposals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <ArrowRightLeft className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600">No proposals sent</h3>
                <p className="text-gray-500">Proposals you send to other users will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div>{sentProposals.map((proposal) => renderProposalCard(proposal, "sent"))}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
