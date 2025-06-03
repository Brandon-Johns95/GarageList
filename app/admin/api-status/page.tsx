import { DistanceApiStatusChecker } from "@/components/distance/api-status-checker"

export default function ApiStatusPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">API Status</h1>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Google Maps API Status</h2>
          <DistanceApiStatusChecker />
        </div>
      </div>
    </div>
  )
}
