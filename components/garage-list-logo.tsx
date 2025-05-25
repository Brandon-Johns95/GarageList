export function GarageListLogo() {
  return (
    <div className="relative w-8 h-8">
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Garage structure */}
        <path
          d="M4 12L16 4L28 12V26C28 27.1046 27.1046 28 26 28H6C4.89543 28 4 27.1046 4 26V12Z"
          fill="#2563eb"
          className="fill-blue-600"
        />

        {/* Garage door */}
        <rect
          x="8"
          y="16"
          width="16"
          height="12"
          rx="1"
          fill="white"
          stroke="#2563eb"
          strokeWidth="1"
          className="fill-white stroke-blue-600"
        />

        {/* Garage door handle */}
        <circle cx="21" cy="22" r="1" fill="#2563eb" className="fill-blue-600" />

        {/* Garage door panels (horizontal lines) */}
        <line x1="10" y1="20" x2="22" y2="20" stroke="#e5e7eb" strokeWidth="0.5" className="stroke-gray-200" />
        <line x1="10" y1="24" x2="22" y2="24" stroke="#e5e7eb" strokeWidth="0.5" className="stroke-gray-200" />

        {/* List/document element */}
        <rect x="26" y="8" width="4" height="6" rx="0.5" fill="#10b981" className="fill-emerald-500" />

        {/* List lines */}
        <line x1="27" y1="10" x2="29" y2="10" stroke="white" strokeWidth="0.3" />
        <line x1="27" y1="11.5" x2="29" y2="11.5" stroke="white" strokeWidth="0.3" />
        <line x1="27" y1="13" x2="29" y2="13" stroke="white" strokeWidth="0.3" />

        {/* Small car silhouette inside garage */}
        <ellipse cx="16" cy="25" rx="4" ry="1.5" fill="#6b7280" className="fill-gray-500" opacity="0.6" />
      </svg>
    </div>
  )
}
