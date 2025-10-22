"use client"

import { useState } from "react"

interface GeolocationButtonProps {
  onSuccess: (district: string) => void
  onError?: (error: string) => void
}

export default function GeolocationButton({ onSuccess, onError }: GeolocationButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showFallback, setShowFallback] = useState(false)

  // Popular districts for quick access
  const popularDistricts = ["Pune", "Nagpur", "Aurangabad", "Nashik", "Kolhapur", "Solapur"]

  const handleGeolocation = async () => {
    setLoading(true)
    try {
      if (!navigator.geolocation) {
        throw new Error("आपके डिवाइस में स्थान सेवा उपलब्ध नहीं है")
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
          enableHighAccuracy: false,
        })
      })

      const { latitude, longitude } = position.coords
      const response = await fetch(`/api/reverse-geocode?lat=${latitude}&lng=${longitude}`)

      if (!response.ok) {
        throw new Error("स्थान से इलाका खोजने में समस्या हुई")
      }

      const data = await response.json()
      if (data.district) {
        onSuccess(data.district)
        setShowFallback(false)
      } else {
        throw new Error("आपका इलाका नहीं मिल सका")
      }
    } catch (error) {
      let errorMessage = "स्थान खोजने में समस्या हुई"

      if (error instanceof GeolocationPositionError) {
        if (error.code === 1) {
          errorMessage = "कृपया स्थान की अनुमति दें"
        } else if (error.code === 2) {
          errorMessage = "स्थान उपलब्ध नहीं है"
        } else if (error.code === 3) {
          errorMessage = "स्थान खोजने में समय लग गया"
        }
      } else if (error instanceof Error) {
        errorMessage = error.message
      }

      console.error("[v0] Geolocation error:", errorMessage)
      setShowFallback(true)
      onError?.(undefined)
    } finally {
      setLoading(false)
    }
  }

  if (showFallback) {
    return (
      <div className="w-full md:w-auto">
        <p className="text-lg md:text-xl text-gray-700 font-bold mb-3">लोकप्रिय इलाके:</p>
        <div className="flex flex-wrap gap-2">
          {popularDistricts.map((district) => (
            <button
              key={district}
              onClick={() => {
                onSuccess(district)
                setShowFallback(false)
              }}
              className="px-4 md:px-5 py-3 md:py-4 bg-green-600 text-white text-lg md:text-xl font-bold rounded-lg hover:bg-green-700 transition-colors border-2 border-green-700"
            >
              {district}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleGeolocation}
      disabled={loading}
      className="px-6 md:px-8 py-5 md:py-6 bg-blue-600 text-white text-2xl md:text-3xl font-black rounded-xl hover:bg-blue-700 transition-colors disabled:bg-gray-400 border-2 border-blue-700 shadow-lg w-full md:w-auto"
    >
      {loading ? "खोज रहे हैं..." : "📍 मेरा स्थान"}
    </button>
  )
}
