import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function SupportLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-96 mx-auto mt-2 animate-pulse" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar skeleton */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded animate-pulse" />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main content skeleton */}
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-40 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-10 bg-gray-200 rounded animate-pulse" />
                  <div className="h-10 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
                <div className="h-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
