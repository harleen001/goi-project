import { type NextRequest, NextResponse } from "next/server"

const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Ahmednagar: { lat: 19.0944, lng: 74.7477 },
  Akola: { lat: 20.7136, lng: 77.0064 },
  Amravati: { lat: 20.8531, lng: 77.7532 },
  Aurangabad: { lat: 19.8762, lng: 75.3433 },
  Beed: { lat: 19.2183, lng: 75.7597 },
  Bhandara: { lat: 21.1458, lng: 79.2533 },
  Buldhana: { lat: 20.5244, lng: 76.1761 },
  Chandrapur: { lat: 19.2941, lng: 79.3044 },
  Dhule: { lat: 20.9217, lng: 74.7597 },
  Gadchiroli: { lat: 20.1856, lng: 80.7733 },
  Gondia: { lat: 21.4625, lng: 80.1961 },
  Hingoli: { lat: 19.7271, lng: 77.1458 },
  Jalgaon: { lat: 21.1458, lng: 75.5625 },
  Jalna: { lat: 19.8427, lng: 75.8844 },
  Kolhapur: { lat: 16.705, lng: 73.7421 },
  Latur: { lat: 18.4088, lng: 76.5244 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Nagpur: { lat: 21.1458, lng: 79.0882 },
  Nanded: { lat: 19.1383, lng: 77.3267 },
  Nandurbar: { lat: 21.3789, lng: 74.2517 },
  Nashik: { lat: 19.9975, lng: 73.7898 },
  Osmanabd: { lat: 17.9689, lng: 76.7597 },
  Parbhani: { lat: 19.2683, lng: 76.7597 },
  Pune: { lat: 18.5204, lng: 73.8567 },
  Raigad: { lat: 18.5956, lng: 73.2621 },
  Ratnagiri: { lat: 16.9891, lng: 73.3167 },
  Sangli: { lat: 16.8554, lng: 74.5745 },
  Satara: { lat: 17.6726, lng: 73.9828 },
  Sindhudurg: { lat: 16.3981, lng: 73.7997 },
  Solapur: { lat: 17.6599, lng: 75.9064 },
  Thane: { lat: 19.2183, lng: 72.9781 },
  Wardha: { lat: 20.7467, lng: 78.6061 },
  Washim: { lat: 20.1089, lng: 77.5244 },
  Yavatmal: { lat: 20.4856, lng: 78.1381 },
}

function findNearestDistrict(lat: number, lng: number): string {
  let nearest = "Pune"
  let minDistance = Number.POSITIVE_INFINITY

  for (const [district, coords] of Object.entries(DISTRICT_COORDINATES)) {
    // Using Haversine formula for more accurate distance calculation
    const R = 6371 // Earth's radius in km
    const dLat = ((coords.lat - lat) * Math.PI) / 180
    const dLng = ((coords.lng - lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) * Math.cos((coords.lat * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c

    if (distance < minDistance) {
      minDistance = distance
      nearest = district
    }
  }

  return nearest
}

const geocodeCache = new Map<string, { district: string; timestamp: number }>()
const GEOCODE_CACHE_TTL = 86400000 // 24 hours

export async function GET(request: NextRequest) {
  try {
    const lat = request.nextUrl.searchParams.get("lat")
    const lng = request.nextUrl.searchParams.get("lng")

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Latitude and longitude parameters required", code: "MISSING_COORDS" },
        { status: 400 },
      )
    }

    const latNum = Number.parseFloat(lat)
    const lngNum = Number.parseFloat(lng)

    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      return NextResponse.json({ error: "Invalid coordinate format", code: "INVALID_COORDS" }, { status: 400 })
    }

    if (latNum < 8 || latNum > 35 || lngNum < 68 || lngNum > 97) {
      return NextResponse.json({ error: "Coordinates outside India bounds", code: "OUT_OF_BOUNDS" }, { status: 400 })
    }

    const cacheKey = `${latNum.toFixed(4)}-${lngNum.toFixed(4)}`
    const cached = geocodeCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < GEOCODE_CACHE_TTL) {
      const response = NextResponse.json({ district: cached.district })
      response.headers.set("X-Cache", "HIT")
      return response
    }

    const district = findNearestDistrict(latNum, lngNum)

    geocodeCache.set(cacheKey, { district, timestamp: Date.now() })

    const response = NextResponse.json({ district })
    response.headers.set("Cache-Control", "public, max-age=86400")
    response.headers.set("X-Cache", "MISS")
    return response
  } catch (error) {
    console.error("[reverse-geocode API] Error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        error: "Failed to reverse geocode coordinates",
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
