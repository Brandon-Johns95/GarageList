/**
 * PSEUDO CODE: Trade Proposals Page
 *
 * PURPOSE: Main page for managing trade proposals
 * FLOW:
 *   1. AUTHENTICATE user access
 *   2. DISPLAY trade proposals management interface
 *   3. PROVIDE navigation back to dashboard
 */

import { TradeProposalsList } from "@/components/trading/trade-proposals-list"

export default function TradeProposalsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <TradeProposalsList />
    </div>
  )
}
