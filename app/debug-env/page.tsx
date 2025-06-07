"use client"

export default function DebugEnvPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-6">Environment Variables Debug</h1>

        <div className="space-y-4">
          <div>
            <label className="font-medium">NEXT_PUBLIC_SUPABASE_URL:</label>
            <p className="bg-gray-100 p-2 rounded mt-1 break-all">
              {process.env.NEXT_PUBLIC_SUPABASE_URL || "❌ Not set"}
            </p>
          </div>

          <div>
            <label className="font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY:</label>
            <p className="bg-gray-100 p-2 rounded mt-1 break-all">
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set (hidden for security)" : "❌ Not set"}
            </p>
          </div>

          <div>
            <label className="font-medium">SUPABASE_URL:</label>
            <p className="bg-gray-100 p-2 rounded mt-1 break-all">{process.env.SUPABASE_URL || "❌ Not set"}</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h3 className="font-medium text-blue-900">What you need:</h3>
          <ul className="mt-2 text-blue-800 space-y-1">
            <li>• NEXT_PUBLIC_SUPABASE_URL should be your project URL</li>
            <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY should be your anon/public key</li>
            <li>• Both should start with your project ID</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
