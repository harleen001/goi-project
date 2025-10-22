"use client"

import { useState } from "react"
import DistrictSelector from "@/components/district-selector"
import PerformanceCard from "@/components/performance-card"
import GeolocationButton from "@/components/geolocation-button"
import { Card } from "@/components/ui/card"

interface DistrictData {
  district: string
  state: string
  jobsCreated: number
  workersEmployed: number
  avgWagesPerDay: number
  completionRate: number
  lastUpdated: string
  previousMonth?: {
    jobsCreated: number
    workersEmployed: number
  }
}

export default function Home() {
  const [selectedDistrict, setSelectedDistrict] = useState<string>("")
  const [districtData, setDistrictData] = useState<DistrictData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const fetchDistrictData = async (district: string, retries = 3) => {
    setLoading(true)
    setError("")

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`/api/district-data?district=${encodeURIComponent(district)}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}`)
        }

        const data = await response.json()
        setDistrictData(data)
        setLoading(false)
        return
      } catch (err) {
        if (attempt === retries) {
          setError("डेटा लोड नहीं हो सका। कृपया बाद में फिर से कोशिश करें।")
          console.error(`[Fetch Error] Attempt ${attempt}/${retries}:`, err)
          setLoading(false)
        } else {
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
        }
      }
    }
  }

  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district)
    fetchDistrictData(district)
  }

  const handleGeolocationSuccess = (district: string) => {
    handleDistrictSelect(district)
  }

  const handleGeolocationError = (errorMessage: string) => {
    setError(errorMessage)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-2 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-5xl md:text-7xl font-black text-green-700 mb-3 leading-tight">काम</h1>
          <p className="text-2xl md:text-3xl text-green-600 font-bold">आपके इलाके में काम की जानकारी</p>
        </div>

        {/* District Selector */}
        <div className="mb-6 md:mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <DistrictSelector onSelect={handleDistrictSelect} />
            </div>
            <GeolocationButton onSuccess={handleGeolocationSuccess} onError={handleGeolocationError} />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="bg-red-100 border-4 border-red-600 p-6 md:p-8 mb-8">
            <p className="text-red-800 text-2xl md:text-3xl font-bold">{error}</p>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="p-12 md:p-16 text-center bg-white border-4 border-green-300">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-16 w-16 md:h-20 md:w-20 border-4 border-green-200 border-t-green-600"></div>
            </div>
            <p className="mt-6 text-2xl md:text-3xl text-gray-700 font-bold">डेटा आ रहा है...</p>
          </Card>
        )}

        {/* Performance Data */}
        {districtData && !loading && (
          <div className="space-y-6 md:space-y-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-4xl md:text-6xl font-black text-green-700 mb-3">{districtData.district}</h2>
              <p className="text-lg md:text-xl text-gray-600 font-semibold">
                अपडेट: {new Date(districtData.lastUpdated).toLocaleDateString("hi-IN")}
              </p>
            </div>

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <PerformanceCard
                title="कुल काम"
                value={districtData.jobsCreated}
                unit="काम"
                icon="💼"
                color="bg-blue-100"
                textColor="text-blue-900"
              />
              <PerformanceCard
                title="कुल मजदूर"
                value={districtData.workersEmployed}
                unit="मजदूर"
                icon="👥"
                color="bg-green-100"
                textColor="text-green-900"
              />
              <PerformanceCard
                title="रोज की मजदूरी"
                value={districtData.avgWagesPerDay}
                unit="रुपये"
                icon="💰"
                color="bg-yellow-100"
                textColor="text-yellow-900"
                prefix="₹"
              />
              <PerformanceCard
                title="काम पूरा होना"
                value={districtData.completionRate}
                unit="%"
                icon="✓"
                color="bg-purple-100"
                textColor="text-purple-900"
              />
            </div>

            {/* Comparison with Previous Month */}
            {districtData.previousMonth && (
              <Card className="bg-white p-6 md:p-8 border-4 border-green-300">
                <h3 className="text-3xl md:text-4xl font-black text-green-700 mb-6">पिछले महीने से तुलना</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-6 md:p-8 bg-blue-50 rounded-xl border-3 border-blue-300">
                    <p className="text-gray-700 text-xl md:text-2xl font-bold mb-3">काम में बदलाव</p>
                    <p className="text-4xl md:text-5xl font-black text-blue-900">
                      {districtData.jobsCreated - districtData.previousMonth.jobsCreated > 0 ? "+" : ""}
                      {districtData.jobsCreated - districtData.previousMonth.jobsCreated}
                    </p>
                  </div>
                  <div className="p-6 md:p-8 bg-green-50 rounded-xl border-3 border-green-300">
                    <p className="text-gray-700 text-xl md:text-2xl font-bold mb-3">मजदूरों में बदलाव</p>
                    <p className="text-4xl md:text-5xl font-black text-green-900">
                      {districtData.workersEmployed - districtData.previousMonth.workersEmployed > 0 ? "+" : ""}
                      {districtData.workersEmployed - districtData.previousMonth.workersEmployed}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!districtData && !loading && !error && (
          <Card className="p-12 md:p-16 text-center bg-white border-4 border-green-300">
            <p className="text-3xl md:text-4xl text-gray-700 font-black mb-4">अपना इलाका चुनें</p>
            <p className="text-xl md:text-2xl text-gray-600 font-semibold">ऊपर से अपना इलाका चुनकर काम की जानकारी देखें</p>
          </Card>
        )}
      </div>
    </main>
  )
}
